from typing import TypedDict, List, Dict, Any
import os
from supabase import create_client, Client
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv

# Load env variables
from pathlib import Path
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)
print(f"DEBUG: Loading .env from {env_path}")

# Setup Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role for backend operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Setup Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"), # User provided key
    temperature=0.3
)

# --- State Definition ---
class ReportState(TypedDict):
    client_id: str
    week_start: str
    week_end: str
    time_data: List[Dict[str, Any]]
    metrics_data: Dict[str, Any]
    report_output: str
    errors: List[str]

# --- Nodes ---

def gather_time_data(state: ReportState) -> Dict:
    """Queries real time_entries from Supabase"""
    print(f"DEBUG: Gathering time for {state['client_id']} from {state['week_start']} to {state['week_end']}")
    
    try:
        # Assuming we can filter by user_id linked to client_id or just all tasks for now (MVP)
        # Ideally, we verify the user belongs to the client organization.
        # For this MVP, we will query all entries in the date range (demo mode)
        # or filter by metadata if we passed a user_id. 
        # But ReportState only has client_id. 
        
        # TODO: Enhanced logic to map client_id to user_ids.
        # For now, fetching ALL time entries in range to demonstrate integration.
        
        response = supabase.table("time_entries") \
            .select("*, projects(name)") \
            .gte("start_time", state['week_start']) \
            .lte("start_time", state['week_end']) \
            .execute()
            
        return {"time_data": response.data}
    except Exception as e:
        print(f"Error fetching time: {e}")
        return {"errors": [str(e)]}

def gather_metrics_data(state: ReportState) -> Dict:
    """Still mocked for now, or could query 'projects' table for status"""
    print(f"DEBUG: Gathering metrics for {state['client_id']}")
    
    # Example: Count active projects for this client
    try:
        # We need to find the organization ID from the client_id (which might be the org slug)
        response = supabase.table("organizations") \
            .select("id") \
            .eq("slug", state['client_id']) \
            .execute()
            
        if response.data:
            org_id = response.data[0]['id']
            # Count projects
            proj_response = supabase.table("projects") \
                .select("id", count="exact") \
                .eq("client_id", org_id) \
                .execute()
                
            return {"metrics_data": {"active_projects": proj_response.count, "revenue": "N/A"}}
        
        return {"metrics_data": {"revenue": 15000, "new_leads": 12}} # Fallback mock
    except Exception as e:
        return {"errors": [str(e)]}

def generate_report_content(state: ReportState) -> Dict:
    """Uses Gemini to generate Markdown report"""
    print(f"DEBUG: Generating report using Gemini")
    
    if not state.get("time_data"):
        return {"report_output": "Não foram encontrados registros de tempo para este período."}

    # Prepare context for LLM
    time_summary = ""
    total_seconds = 0
    for entry in state['time_data']:
        duration = entry.get('duration') or 0
        total_seconds += duration
        proj_name = entry.get('projects', {}).get('name') if entry.get('projects') else "Sem Projeto"
        desc = entry.get('task_description') or "Sem descrição"
        time_summary += f"- [{proj_name}] {desc}: {duration/3600:.2f}h\n"
        
    total_hours = total_seconds / 3600
    
    prompt = f"""
    Você é o Kyrie OS AI, um assistente executivo de alta performance.
    Gere um relatório semanal profissional em Markdown para o cliente: {state['client_id']}.
    
    Período: {state['week_start']} a {state['week_end']}
    
    DADOS DE TEMPO (Real do Sistema):
    Total de Horas: {total_hours:.2f}h
    Detalhes:
    {time_summary}
    
    MÉTRICAS:
    {state['metrics_data']}
    
    ESTRUTURA DO RELATÓRIO:
    1. Resumo Executivo (Tom profissional e direto)
    2. Detalhamento de Atividades (Use os dados reais acima)
    3. Próximos Passos (Sugira baseados nas atividades)
    
    Seja conciso e use formatação rica (negrito, listas).
    """
    
    try:
        response = llm.invoke([
            SystemMessage(content="Você é um especialista em relatórios corporativos."),
            HumanMessage(content=prompt)
        ])
        return {"report_output": response.content}
    except Exception as e:
        print(f"LLM Error: {e}")
        return {"report_output": f"Erro ao gerar relatório com IA: {str(e)}", "errors": [str(e)]}

# --- Graph Definition ---
workflow = StateGraph(ReportState)

workflow.add_node("gather_time", gather_time_data)
workflow.add_node("gather_metrics", gather_metrics_data)
workflow.add_node("generate_report", generate_report_content)

workflow.set_entry_point("gather_time")
workflow.add_edge("gather_time", "gather_metrics")
workflow.add_edge("gather_metrics", "generate_report")
workflow.add_edge("generate_report", END)

# Compile
report_generator_app = workflow.compile()
