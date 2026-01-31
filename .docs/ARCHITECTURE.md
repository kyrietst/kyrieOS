# Arquitetura do Sistema Kyrie OS (V1)

## 🏗️ Visão Geral

O Kyrie OS utiliza uma **Arquitetura Híbrida** para combinar a melhor
experiência de usuário (Next.js) com o poder de processamento de IA (Python).

### Diagrama Lógico

```mermaid
graph TD
    User[Usuário] --> Frontend[Next.js App (Port 3000)]
    Frontend -->|Auth & Data| Supabase[Supabase (Auth/DB)]
    Frontend -->|AI Requests| Backend[Python FastAPI (Port 8002)]
    
    subgraph "Camada de Inteligência"
        Backend -->|Orchestration| LangGraph[LangGraph Agents]
        LangGraph -->|LLM| OpenAI[OpenAI GPT-4o]
        LangGraph -->|Data| Clockify[Clockify (Mock)]
        LangGraph -->|Data| GSheets[Google Sheets (Mock)]
    end
    
    subgraph "Banco de Dados & Auth"
        Supabase -->|Tables| DB[(PostgreSQL)]
        Supabase -->|RLS| Auth[Auth Policies]
    end
```

## 🛠️ Stack Tecnológico

### 1. Frontend (The Body)

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4 + Shadcn/ui
- **Hospedagem (Futuro):** Vercel

### 2. Backend (The Brain)

- **Framework:** FastAPI (Python 3.11+)
- **Orquestração:** LangGraph (Stateful Agents)
- **Dependências:** Pydantic, Uvicorn, Python-Dotenv
- **Hospedagem (Futuro):** Railway ou Render

### 3. Dados & Infra (The Memory)

- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (SSR)
- **Storage:** Supabase Storage (para arquivos/relatórios)

## 🔐 Segurança & Permissões

- **RBAC (Role-Based Access Control):**
  - `KYRIE_ADMIN`: Acesso total (`/kyrie`)
  - `CLIENT_OWNER`: Acesso restrito à própria org (`/client`)
- **RLS (Row Level Security):** Políticas no banco garantem que clientes SÓ
  vejam seus próprios dados.

## 🔄 Fluxo de Dados (Ex: Geração de Relatório)

1. **Trigger:** Usuário clica em "Gerar Relatório" no Frontend.
2. **Request:** POST enviado para `localhost:8000/api/ai/generate-report`.
3. **Processamento:**
   - FastAPI recebe o payload (`client_id`).
   - LangGraph inicia o grafo `ReportGenerator`.
   - Nós `gather_time` e `gather_metrics` buscam dados.
   - Nó `generate_report` compila o Markdown via LLM.
4. **Response:** JSON com o Markdown retorna ao Frontend.
5. **Display:** Frontend renderiza o Markdown.
