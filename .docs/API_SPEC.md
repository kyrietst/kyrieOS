# Especificação da API

## POST /api/ai/generate-report

Gera o relatório semanal usando o agente LangGraph.

**Request:**

```json
{
    "client_id": "adega-anitas-uuid",
    "week_start": "2026-01-26",
    "week_end": "2026-02-01",
    "focus_areas": ["roi", "tasks"] // opcional
}
```

**Response:**

```json
{
    "success": true,
    "report_id": "rep_123456",
    "report_markdown": "# Relatório Semanal\n\n## Resumo Executivo...",
    "metrics": {
        "hours_worked": 12.5,
        "completed_tasks": 5,
        "roi_calculated": 4.2
    },
    "execution_time_seconds": 12.5
}
```

**Implementação:**

- **Backend:** FastAPI
- **Graph:** `report_generator.py`
- **Nodes:** `gather_time` (Clockify), `gather_metrics` (Sheets),
  `generate_content` (LLM)

---

## POST /api/ai/calculate-roi

Calcula o ROI e Health Score do cliente em tempo real.

**Request:**

```json
{
    "client_id": "mont-massas-uuid"
}
```

**Response:**

```json
{
    "success": true,
    "roi_multiplier": 3.1,
    "health_score": 72,
    "churn_risk_level": "medium",
    "insights": [
        "Aumento de 20% no custo de ads sem retorno proporcional",
        "Engajamento com tutoriais caiu esta semana"
    ]
}
```

**Implementação:**

- **Graph:** `business_calculator.py`
- **Ferramentas:** Análise de dados históricos + projeção
