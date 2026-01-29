from typing import TypedDict, List, Dict, Any, Callable
import time

# --- 1. Simple Graph Engine (Lite Version) ---
class SimpleStateGraph:
    """A lightweight version of StateGraph for MVP without complex dependencies"""
    def __init__(self, state_schema):
        self.nodes = {}
        self.edges = {}
        self.entry_point = ""
        
    def add_node(self, name: str, func: Callable):
        self.nodes[name] = func
        
    def set_entry_point(self, name: str):
        self.entry_point = name
        
    def add_edge(self, from_node: str, to_node: str):
        self.edges[from_node] = to_node
        
    def invoke(self, initial_state: Any) -> Any:
        current_node = self.entry_point
        state = initial_state
        
        while current_node != "END":
            # Run node
            print(f"Running Node: {current_node}")
            func = self.nodes[current_node]
            state = func(state)
            
            # Find next node
            if current_node in self.edges:
                current_node = self.edges[current_node]
            else:
                current_node = "END"
                
        return state

END = "END"

# --- 2. State Definition ---
class ReportState(TypedDict):
    client_id: str
    week_start: str
    week_end: str
    time_data: Dict[str, Any]
    metrics_data: Dict[str, Any]
    report_output: str
    errors: List[str]

# --- 3. Nodes ---

def gather_time_data(state: ReportState) -> ReportState:
    """Mocked Clockify Data Gathering"""
    print(f"DEBUG: Gathering time for {state['client_id']}")
    # Mock data
    mock_time = {
        "total_hours": 15.5,
        "projects": [
            {"name": "Website Revamp", "hours": 10.0},
            {"name": "Social Media", "hours": 5.5}
        ]
    }
    state["time_data"] = mock_time
    return state

def gather_metrics_data(state: ReportState) -> ReportState:
    """Mocked Google Sheets Data Gathering"""
    print(f"DEBUG: Gathering metrics for {state['client_id']}")
    # Mock data
    mock_metrics = {
        "revenue": 15000,
        "new_leads": 12,
        "conversion_rate": "3.5%"
    }
    state["metrics_data"] = mock_metrics
    return state

def generate_report_content(state: ReportState) -> ReportState:
    """Mocked LLM Generation (replacing real GPT call for MVP Setup)"""
    print(f"DEBUG: Generating report for {state['client_id']}")
    
    report_md = f"""# Relatório Semanal: {state['client_id']}
**Período:** {state['week_start']} a {state['week_end']}

## 📊 Resumo Executivo
Esta semana focamos na renovação do website e campanhas de social media.
O total de horas investidas foi de **{state['time_data']['total_hours']}h**.

## 📈 Métricas Chave
- **Receita:** R$ {state['metrics_data']['revenue']}
- **Novos Leads:** {state['metrics_data']['new_leads']}
- **Conversão:** {state['metrics_data']['conversion_rate']}

## 🛠️ Atividades Realizadas
"""
    for proj in state['time_data']['projects']:
        report_md += f"- **{proj['name']}:** {proj['hours']}h\n"
        
    report_md += "\n*Relatório gerado automaticamente pelo Kyrie OS AI*"
    
    state["report_output"] = report_md
    return state

# --- 4. Graph Definition ---
workflow = SimpleStateGraph(ReportState)

workflow.add_node("gather_time", gather_time_data)
workflow.add_node("gather_metrics", gather_metrics_data)
workflow.add_node("generate_report", generate_report_content)

# Linear Flow
workflow.set_entry_point("gather_time")
workflow.add_edge("gather_time", "gather_metrics")
workflow.add_edge("gather_metrics", "generate_report")
workflow.add_edge("generate_report", END)

# Compile (Just returns itself in this lite version)
report_generator_app = workflow
