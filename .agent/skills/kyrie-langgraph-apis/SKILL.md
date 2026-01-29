---
name: kyrie-langgraph-apis
description: LangGraph + Direct API integration for Kyrie OS (no MCP)
tags: [langgraph, api, clockify, sheets, supabase]
version: 2.0.0
---

# Kyrie LangGraph + Direct APIs

## Overview
Build AI agents with:
- **LangGraph** for workflows
- **Direct API calls** (httpx, Google SDK, Supabase SDK)
- **LangChain** for LLMs

## Pattern

```python
from langgraph.graph import StateGraph, END
import httpx

class State(TypedDict):
    data: dict

async def fetch_api(state):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.example.com/data",
            headers={"Authorization": f"Bearer {API_KEY}"}
        )
        return {"data": response.json()}

workflow = StateGraph(State)
workflow.add_node("fetch", fetch_api)
workflow.set_entry_point("fetch")
workflow.add_edge("fetch", END)

graph = workflow.compile()
result = await graph.ainvoke({})
```

## Clockify API

```python
async def get_time_entries(workspace, user, start, end):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.clockify.me/api/v1/workspaces/{workspace}/user/{user}/time-entries",
            headers={"X-Api-Key": os.getenv("CLOCKIFY_API_KEY")},
            params={"start": start, "end": end}
        )
        return response.json()
```

## Google Sheets API

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

def get_sheets():
    creds = service_account.Credentials.from_service_account_file(
        'credentials.json',
        scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
    )
    return build('sheets', 'v4', credentials=creds)

def read_metrics(sheet_id):
    service = get_sheets()
    result = service.spreadsheets().values().get(
        spreadsheetId=sheet_id,
        range='Metrics!A1:E10'
    ).execute()
    return result.get('values', [])
```

## Supabase SDK

```python
from supabase import create_client

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def get_tasks(org_id, start, end):
    return supabase.table("tasks") \
        .select("*") \
        .eq("organization_id", org_id) \
        .gte("completed_at", start) \
        .lte("completed_at", end) \
        .execute()
```

## Best Practices

✅ Use async/await
✅ Error handling (try/except)
✅ Environment variables
✅ Retry logic (tenacity)

❌ Don't use sync requests
❌ Don't hardcode credentials
