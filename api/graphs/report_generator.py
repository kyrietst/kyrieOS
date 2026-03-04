from typing import TypedDict, List, Dict, Any, Optional
import os
import json
from datetime import datetime
from supabase import create_client, Client
from langgraph.graph import StateGraph, END
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

# Load env variables
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Setup Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role for backend operations
# Fallback to anon key if service role not present (for dev) - though service role is preferred for writing to protected tables
if not SUPABASE_KEY:
    SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# --- State Definition ---
class ReportState(TypedDict):
    client_slug: str # Input: Organization Slug
    organization_id: Optional[str] # Resolved UUID
    organization_name: Optional[str]
    week_start: str
    week_end: str
    time_data: List[Dict[str, Any]]
    metrics_data: Dict[str, Any]
    tasks_data: List[Dict[str, Any]] # New: Tasks completed
    report_output: str
    report_id: Optional[str] # ID of saved report
    errors: List[str]

# --- Nodes ---

def resolve_context(state: ReportState) -> Dict:
    """Resolves Organization ID from Slug"""
    print(f"DEBUG: Resolving context for slug: {state['client_slug']}")
    try:
        response = supabase.table("organizations") \
            .select("id, name") \
            .eq("slug", state['client_slug']) \
            .single() \
            .execute()
        
        if response.data:
            return {
                "organization_id": response.data['id'], 
                "organization_name": response.data['name']
            }
        else:
            return {"errors": ["Organization not found for slug: " + state['client_slug']]}
    except Exception as e:
        return {"errors": [f"Error resolving context: {str(e)}"]}

def gather_time_data(state: ReportState) -> Dict:
    """Queries real time_entries from Supabase"""
    if not state.get("organization_id"):
        return {} # Skip if context failed

    print(f"DEBUG: Gathering time for {state['organization_name']}")
    try:
        # Fetch projects for this org first to filter time entries
        projects_resp = supabase.table("projects") \
            .select("id") \
            .eq("organization_id", state['organization_id']) \
            .execute()
        
        project_ids = [p['id'] for p in projects_resp.data] if projects_resp.data else []
        
        if not project_ids:
             return {"time_data": []}

        # Query time entries for these projects
        response = supabase.table("time_entries") \
            .select("*, projects(name)") \
            .in_("project_id", project_ids) \
            .gte("start_time", state['week_start']) \
            .lte("start_time", state['week_end']) \
            .execute()
            
        return {"time_data": response.data}
    except Exception as e:
        print(f"Error fetching time: {e}")
        return {"errors": [str(e)]}

def gather_metrics_data(state: ReportState) -> Dict:
    """Fetches Business Metrics and Tasks"""
    if not state.get("organization_id"):
        return {}

    try:
        # 1. Fetch Business Metrics (Monthly) - Filter by month of week_end
        date_obj = datetime.strptime(state['week_end'], "%Y-%m-%d") # Assuming ISO format
        month = date_obj.month
        year = date_obj.year
        
        metrics_resp = supabase.table("business_metrics") \
            .select("*") \
            .eq("organization_id", state['organization_id']) \
            .eq("period_month", month) \
            .eq("period_year", year) \
            .execute()
            
        metrics = metrics_resp.data[0] if metrics_resp.data else {}
        
        # 2. Fetch Tasks Completed in this period
        projects_resp = supabase.table("projects") \
            .select("id") \
            .eq("organization_id", state['organization_id']) \
            .execute()
        project_ids = [p['id'] for p in projects_resp.data] if projects_resp.data else []
        
        tasks_data = []
        if project_ids:
            tasks_resp = supabase.table("tasks") \
                .select("*, projects(name)") \
                .in_("project_id", project_ids) \
                .eq("status", "done") \
                .gte("completed_at", state['week_start']) \
                .lte("completed_at", state['week_end']) \
                .execute()
            tasks_data = tasks_resp.data
            
        return {"metrics_data": metrics, "tasks_data": tasks_data}

    except Exception as e:
        return {"errors": [str(e)]}

def generate_report_content(state: ReportState) -> Dict:
    """Uses Groq LLM to generate Markdown report"""
    if state.get("errors"):
        return {"report_output": "Falha na geração devido a erros anteriores."}
        
    print(f"DEBUG: Generating report using Groq for {state['organization_name']}")
    
    # Prepare Data Context
    time_summary = ""
    total_seconds = 0
    for entry in state['time_data']:
        duration = entry.get('duration') or 0
        total_seconds += duration
        proj_name = entry.get('projects', {}).get('name') if entry.get('projects') else "Geral"
        desc = entry.get('task_description') or "Sem descrição"
        time_summary += f"- [{proj_name}] {desc}: {duration/3600:.2f}h\n"
        
    total_hours = total_seconds / 3600
    
    tasks_summary = ""
    for task in state.get('tasks_data', []):
        proj_name = task.get('projects', {}).get('name') if task.get('projects') else "Geral"
        tasks_summary += f"- [CONCLUÍDO] {task['title']} ({proj_name})\n"
        
    metrics_summary = "Nenhum dado financeiro disponível para este mês."
    if state['metrics_data']:
        m = state['metrics_data']
        metrics_summary = f"""
        - Receita: R$ {m.get('revenue', 0)}
        - Investimento Ads: R$ {m.get('ad_spend', 0)}
        - Leads: {m.get('leads_generated', 0)}
        - CAC: R$ {float(m.get('ad_spend',0))/max(1, m.get('new_customers',1)):.2f} (Est.)
        """

    prompt = f"""
    ATUE COMO: Kyrie OS AI, consultor de performance para {state['organization_name']}.
    OBJETIVO: Gerar Relatório de Progresso Semanal.
    
    PERÍODO: {state['week_start']} a {state['week_end']}
    
    DADOS OBTIDOS:
    
    1. ESFORÇO TÉCNICO (Time Tracking):
    Total de Horas Kyrie: {total_hours:.2f}h
    Atividades:
    {time_summary if time_summary else "Sem registros de tempo."}
    
    2. ENTREGAS (Tasks Concluídas):
    {tasks_summary if tasks_summary else "Sem tarefas concluídas no período."}
    
    3. RESULTADOS DE NEGÓCIO (Mês Vigente):
    {metrics_summary}
    
    DIRETRIZES:
    - Use Markdown profissional.
    - Seção "Resumo": Destaque o impacto do trabalho.
    - Seção "Entregas": Liste o que foi feito.
    - Seção "Insights": Analise os números (ex: leads vs investimento).
    - Seção "Próximos Passos": Sugira ações focadas em ROI.
    - Tom: Parceiro estratégico, focado em crescimento.
    """
    
    # --- GROQ IMPLEMENTATION ---
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    model = "llama-3.3-70b-versatile"
    
    print(f"INFO: Generating report with Groq ({model})...")
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "Você é um estrategista de negócios experiente."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=model,
            temperature=0.7,
        )
        
        response_text = completion.choices[0].message.content
        if response_text:
            return {"report_output": response_text}
            
    except Exception as e:
        print(f"ERROR: Groq generation failed: {e}")
        return {"report_output": f"Falha na geração de relatório (Groq). Erro: {e}", "errors": [str(e)]}

def save_report(state: ReportState) -> Dict:
    """Saves the generated report to Supabase and logs activity"""
    if state.get("errors") or not state.get("report_output"):
        return {}
        
    print(f"DEBUG: Saving report for {state['organization_name']}")
    try:
        # 1. Insert Report
        report_data = {
            "organization_id": state['organization_id'],
            "title": f"Relatório Semanal ({state['week_end']})",
            "content_markdown": state['report_output'],
            "summary": "Gerado automaticamente pela AI",
            "report_type": "weekly",
            "status": "generated",
            "period_start": state['week_start'],
            "period_end": state['week_end'],
            "metrics_snapshot": {
                "total_hours": sum(t.get('duration',0) for t in state['time_data'])/3600,
                "completed_tasks": len(state['tasks_data']),
                "business_metrics": state['metrics_data']
            },
            "ai_model_used": "llama-3.3-70b-versatile"
        }
        
        rep_resp = supabase.table("reports").insert(report_data).execute()
        report_id = rep_resp.data[0]['id'] if rep_resp.data else None
        
        # 2. Log Activity
        if report_id:
            supabase.rpc("log_activity", {
                "p_user_id": None, # System action
                "p_user_name": "Kyrie AI",
                "p_org_id": state['organization_id'],
                "p_type": "report_generated",
                "p_title": "Relatório Semanal Gerado",
                "p_description": f"Relatório automático cobrindo {state['week_start']} a {state['week_end']}",
                "p_target_type": "reports",
                "p_target_id": report_id,
                "p_target_name": f"Relatório {state['week_end']}"
            }).execute()
            
        return {"report_id": report_id}
        
    except Exception as e:
        print(f"Error saving report: {e}")
        return {"errors": [f"Erro ao salvar: {str(e)}"]}

# --- Graph Definition ---
workflow = StateGraph(ReportState)

workflow.add_node("resolve_context", resolve_context)
workflow.add_node("gather_time", gather_time_data)
workflow.add_node("gather_metrics", gather_metrics_data)
workflow.add_node("generate_report", generate_report_content)
workflow.add_node("save_report", save_report)

workflow.set_entry_point("resolve_context")

workflow.add_edge("resolve_context", "gather_time")
workflow.add_edge("gather_time", "gather_metrics")
workflow.add_edge("gather_metrics", "generate_report")
workflow.add_edge("generate_report", "save_report")
workflow.add_edge("save_report", END)

# Compile
report_generator_app = workflow.compile()
