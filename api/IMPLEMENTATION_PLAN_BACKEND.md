# Week 2: AI Layer Implementation Plan

## Goal

Establish the backend infrastructure using FastAPI and implement the "Report
Generator" AI Agent using LangGraph. This layer will serve as the intelligence
engine for the application, handling complex logic and external API
integrations.

## User Review Required

- [ ] Confirm Python version (3.11+ recommended).
- [ ] Confirm `requirements.txt` dependencies are acceptable.

## Proposed Changes

### Backend Structure (`api/`)

- [NEW] `api/main.py`: Entry point for FastAPI server.
- [NEW] `api/requirements.txt`: Python dependencies (fastapi, uvicorn,
  langgraph, langchain, supabase, openai).
- [NEW] `api/.env`: Backend environment variables (Supabase URL/Key, OpenAI
  Key).

### AI Agents (`api/graphs/`)

- [NEW] `api/graphs/report_generator.py`: The logic for the Report Generator
  agent.
  - **State**: `ReportState` (client_id, time_data, metrics_data,
    report_output).
  - **Nodes**:
    - `gather_time`: Mocked Clockify data fetcher (MVP).
    - `gather_metrics`: Mocked Sheets data fetcher (MVP).
    - `generate_report`: Call to OpenAI GPT-4o-mini to synthesize markdown.
  - **Edges**: Linear flow for now: `gather_time` -> `gather_metrics` ->
    `generate_report` -> `END`.

## Verification Plan

### Automated Tests

- Create a simple test script `api/test_agent.py` to invoke the graph locally
  and print the output.
- Run `curl` commands against the running FastAPI server to verify endpoints.

### Manual Verification

1. Start the backend: `uvicorn main:app --reload`
2. Send a POST request to `/api/ai/generate-report` with a sample payload.
3. Verify that the response contains a generated markdown report.
