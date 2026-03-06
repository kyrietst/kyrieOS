import os
from typing import Optional, List
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq
from google import genai
from google.genai import types
from supabase import create_client

from api.models.project_brief import ProjectBrief, SquadContribution
from api.models.agent_response import AgentResponse

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


def _get_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


def _get_query_embedding(text: str) -> Optional[List[float]]:
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        return None
    client = genai.Client(api_key=gemini_key)
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=768),
    )
    return result.embeddings[0].values


def retrieve_rag_context(query: str, match_count: int = 4) -> List[str]:
    """Retrieve relevant chunks from wiki_embeddings via RAG."""
    try:
        embedding = _get_query_embedding(query)
        if not embedding:
            return []
        sb = _get_supabase()
        if not sb:
            return []
        result = sb.rpc(
            "match_wiki_embeddings",
            {
                "query_embedding": embedding,
                "match_threshold": 0.5,
                "match_count": match_count,
            },
        ).execute()
        return [row["chunk_text"] for row in result.data] if result.data else []
    except Exception as e:
        print(f"INFO: RAG retrieval failed (non-blocking): {e}")
        return []


class BaseAgent:
    """Base class for all Kyrie agents."""

    name: str = "base_agent"
    role: str = "Agente Base"
    squad: str = "none"
    specialty: str = ""
    system_prompt: str = "Voce e um agente da Kyrie Performance & Resultados."

    def __init__(self):
        self.groq_client = self._init_groq()

    def _init_groq(self) -> Optional[Groq]:
        key = os.getenv("GROQ_API_KEY")
        return Groq(api_key=key) if key else None

    def _call_llm(self, prompt: str, temperature: float = 0.7) -> AgentResponse:
        """Call LLM with Groq cascade: qwen3-32b -> llama-3.3-70b."""
        if not self.groq_client:
            return AgentResponse(
                agent_name=self.name,
                squad=self.squad,
                content="Erro: GROQ_API_KEY nao configurada.",
                model_used="none",
                error="No GROQ_API_KEY",
            )

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt},
        ]

        models = [
            ("qwen/qwen3-32b", {"reasoning_format": "hidden"}),
            ("llama-3.3-70b-versatile", {}),
        ]

        for model_name, extra_kwargs in models:
            try:
                completion = self.groq_client.chat.completions.create(
                    messages=messages,
                    model=model_name,
                    temperature=temperature,
                    max_tokens=3000,
                    **extra_kwargs,
                )
                return AgentResponse(
                    agent_name=self.name,
                    squad=self.squad,
                    content=completion.choices[0].message.content,
                    model_used=f"groq/{model_name}",
                    tokens_used=completion.usage.total_tokens
                    if completion.usage
                    else 0,
                )
            except Exception as e:
                print(f"INFO: {self.name} - {model_name} failed: {e}")
                continue

        return AgentResponse(
            agent_name=self.name,
            squad=self.squad,
            content="Erro: todos os modelos falharam.",
            model_used="none",
            error="All models failed",
        )

    def process(self, brief: ProjectBrief, task: str) -> AgentResponse:
        """Process a task given the current brief state."""
        prompt = f"""BRIEF ATUAL DO PROJETO:
{brief.get_brief_summary()}

---
SUA TAREFA ESPECIFICA:
{task}

Responda de forma objetiva e acionavel, dentro da sua especialidade ({self.specialty}).
Nao opine sobre areas fora do seu dominio."""
        return self._call_llm(prompt)

    def squad_debate(self, brief: ProjectBrief) -> SquadContribution:
        """Contribute to the brief from this agent's specialty."""
        response = self.process(
            brief,
            f"Analise o brief e contribua com sua especialidade de {self.specialty}. "
            f"Seja objetivo e entregue recomendacoes acionaveis.",
        )
        brief.add_contribution(self.squad, self.name, response.content)
        return SquadContribution(
            squad=self.squad,
            agent=self.name,
            contribution=response.content,
        )
