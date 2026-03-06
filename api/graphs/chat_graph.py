import os
from typing import TypedDict, List, Dict, Optional
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types
from groq import Groq
from supabase import create_client
from langgraph.graph import StateGraph, END

# Padrão exato do report_generator.py — não alterar
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


class ChatState(TypedDict):
    user_message: str
    conversation_history: List[Dict[str, str]]
    ai_response: str
    model_used: str
    tokens_used: int
    error: Optional[str]
    context_chunks: List[str]
    sources: List[str]


KYRIE_SYSTEM_PROMPT = """Você é o assistente estratégico interno da Kyrie Performance & Resultados.

Seu papel é ajudar o time da Kyrie com diagnósticos de negócio, estratégia, comunicação com clientes e aplicação da metodologia.

COMO VOCÊ DEVE RACIOCINAR:
- Quando receber contexto da base de conhecimento, USE-O para fundamentar sua resposta — não ignore
- Conecte conceitos entre si quando relevante
- Aplique à situação específica perguntada
- Faça diagnóstico antes de dar solução
- Use a linguagem e metodologia da Kyrie (Iceberg, Jornada de Compra, 4 etapas: Exploração → Lapidação → Extração → Escala)

QUANDO TEM CONTEXTO DO RAG:
- Baseie sua resposta no contexto fornecido
- Vá além do óbvio — conecte os pontos, gere insight real
- Não copie o contexto mecanicamente — interprete e aplique

QUANDO NÃO TEM CONTEXTO:
- Responda com base no seu conhecimento geral de marketing e vendas
- Mantenha o tom consultivo da Kyrie
- Sinalize quando não tiver certeza

Responda sempre em português brasileiro."""


def _get_gemini_client() -> Optional[genai.Client]:
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        return None
    return genai.Client(api_key=gemini_key)


def _get_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


def _get_query_embedding(text: str) -> Optional[List[float]]:
    client = _get_gemini_client()
    if not client:
        return None
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(
            output_dimensionality=768,
        ),
    )
    return result.embeddings[0].values


def retrieve_context(state: ChatState) -> Dict:
    try:
        embedding = _get_query_embedding(state["user_message"])
        if not embedding:
            return {"context_chunks": [], "sources": []}

        sb = _get_supabase()
        if not sb:
            return {"context_chunks": [], "sources": []}

        result = sb.rpc("match_wiki_embeddings", {
            "query_embedding": embedding,
            "match_threshold": 0.5,
            "match_count": 4,
        }).execute()

        chunks = [row["chunk_text"] for row in result.data] if result.data else []
        return {"context_chunks": chunks, "sources": chunks}
    except Exception as e:
        print(f"INFO: RAG retrieval failed (non-blocking): {e}")
        return {"context_chunks": [], "sources": []}


def generate_response(state: ChatState) -> Dict:
    user_message = state["user_message"]
    history = state.get("conversation_history", [])
    context_chunks = state.get("context_chunks", [])

    if context_chunks:
        context_block = "\n".join(f"---\n{chunk}" for chunk in context_chunks)
        prompt = f"""Contexto da base de conhecimento da Kyrie:

{context_block}

---
Com base nesse contexto, responda:
{user_message}"""
    else:
        prompt = user_message

    # Build conversation contents for Gemini
    contents = []
    for msg in history:
        role = "user" if msg["role"] == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])]))
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=prompt)]))

    # --- TENTATIVA 1: Gemini (primário) ---
    client = _get_gemini_client()
    if client:
        models_to_try = [
            "gemini-2.5-pro",
            "gemini-2.0-flash",
        ]

        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=KYRIE_SYSTEM_PROMPT,
                        temperature=0.7,
                    ),
                )

                return {
                    "ai_response": response.text,
                    "model_used": model_name,
                    "tokens_used": 0,
                    "error": None,
                }
            except Exception as model_err:
                print(f"INFO: Gemini {model_name} falhou: {model_err}. Tentando próximo...")
                continue

    # --- TENTATIVA 2: Groq (fallback) ---
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return {
            "ai_response": "Desculpe, nenhuma chave de LLM configurada (GEMINI_API_KEY ou GROQ_API_KEY).",
            "model_used": "none",
            "tokens_used": 0,
            "error": "No LLM keys configured",
        }

    groq_models = [
        "qwen/qwen3-32b",
        "deepseek-r1-distill-llama-70b",
        "llama-3.3-70b-versatile",
    ]

    groq_client = Groq(api_key=groq_key)
    messages = [{"role": "system", "content": KYRIE_SYSTEM_PROMPT}]
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": prompt})

    for groq_model in groq_models:
        try:
            extra_kwargs = {}
            if groq_model == "qwen/qwen3-32b":
                extra_kwargs["reasoning_format"] = "hidden"

            completion = groq_client.chat.completions.create(
                messages=messages,
                model=groq_model,
                temperature=0.7,
                max_tokens=3000,
                **extra_kwargs,
            )
            return {
                "ai_response": completion.choices[0].message.content,
                "model_used": f"groq/{groq_model}",
                "tokens_used": completion.usage.total_tokens if completion.usage else 0,
                "error": None,
            }
        except Exception as e:
            print(f"INFO: Groq {groq_model} falhou: {e}. Tentando próximo...")
            continue

    return {
        "ai_response": "Desculpe, não consegui processar sua mensagem no momento.",
        "model_used": "none",
        "tokens_used": 0,
        "error": "All LLM models failed",
    }


workflow = StateGraph(ChatState)
workflow.add_node("retrieve_context", retrieve_context)
workflow.add_node("generate_response", generate_response)
workflow.set_entry_point("retrieve_context")
workflow.add_edge("retrieve_context", "generate_response")
workflow.add_edge("generate_response", END)

chat_app = workflow.compile()
