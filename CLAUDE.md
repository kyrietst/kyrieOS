# CLAUDE.md — kyrieOS v3.0

> Contexto definitivo para Claude Code. Fusão do GEMINI.md (regras reais) + CLAUDE.md (arquitetura).
> Projeto: kyrieOS | Owner: Gilmar (CEO Kyrie Performance & Resultados)
> Atualizado: Março 2026

---

## PROJETO

**kyrieOS (kOS):** SaaS interno da Kyrie Performance & Resultados (consultoria de crescimento de negócios). Substitui Trello/Clockify/Sheets/WhatsApp. Dois portais: admin interno (`/kyrie`) e portal do cliente (`/client`). Pré-produção — schema pronto, funcionalidades em implementação.

**Metodologia Kyrie:** Framework Iceberg — a maioria das agências trabalha só na superfície (posts, tráfego pago, métricas de vaidade). A Kyrie atua no que está abaixo: funil ponta a ponta, construção de oferta, time de vendas, fluxo de caixa, logística, produto, posicionamento, processos, CRM, scripts, retenção. O kOS deve refletir essa filosofia em cada feature.

**Escopo:** kOS é APENAS este projeto. NÃO referenciar nem misturar com Mont Distribuidora, catalogo-mont ou qualquer outro projeto do Gilmar. São repos separados, bancos separados, contextos separados.

---

## STACK (FIXO)

Next.js 16.1.6 (App Router ONLY), React 19.2.3, TypeScript strict, Tailwind v4, shadcn/ui (Radix), @dnd-kit, framer-motion, recharts, react-big-calendar, react-hook-form+zod, @tanstack/react-table, lucide-react, sonner, cmdk, resend, Supabase (Auth+DB+Storage+RLS), Python FastAPI+LangGraph, Gemini+Groq LLMs, Playwright.

🔴 **PROIBIDO:** MongoDB, Prisma, Drizzle, Firebase, tRPC, Zustand, Redux, CSS-in-JS, Pages Router, GSAP.

---

## COMANDOS

```bash
# Iniciar frontend + backend juntos
npm run dev

# Apenas frontend (Next.js porta 3000)
npm run dev:frontend

# Apenas backend (FastAPI porta 8002)
npm run dev:backend
```

```bash
# Backend Python manual (com venv ativado):
.\venv\Scripts\activate
$env:PYTHONPATH = $PWD
python -m api.main

# Ou via script:
.\start-backend.ps1 --install
```

```bash
# Build e lint
npm run build
npm run lint
npx tsc --noEmit
```

---

## ARQUITETURA

### Frontend: Next.js 16 (App Router)

- `app/kyrie/` — Admin: dashboard, clients/[slug]/kanban, clients/[slug]/wiki, approvals, ai, inbox, insights, workspace/calendar, workspace/kanban
- `app/client/` — Cliente: dashboard, approvals/[id], projects, reports/[id]
- `actions/` — 9 Server Actions: ai, calendar, clients, inbox, kanban, labels, master-calendar, time-tracking, wiki
- `components/` — 63 total: kanban(18), ui(23+), layout(7), admin(5), approvals(4), ai(2), outros(4)
- `contexts/` — TitleContext e HeaderActionsContext
- `lib/` — Utilities + `lib/agents/business-calculator.ts`
- `types/` — Type definitions
- `utils/supabase/client.ts` (browser) + `server.ts` (SSR)

### Backend: Python FastAPI (`api/`)

Roda na **porta 8002**.

- `api/main.py` — FastAPI root + endpoints
- `api/graphs/chat_graph.py` — LangGraph chat. Gemini primário (gemini-1.5-flash → pro → gemini-pro) com Groq/llama-3.3-70b-versatile como fallback
- `api/graphs/report_generator.py` — LangGraph 5 nodes: resolve_context → gather_time → gather_metrics → generate_report → save_report. Usa Groq. ⚠️ Converter para Gemini na Fase 5
- `api/services/embedding_service.py` — ⏳ Criar na Fase 4. Embeddings 768 dims para retrieve_context

### Agentes disponíveis (`.agent/agents/`)

Para ativar um agente, informe: "Ative o [nome]" e leia o arquivo `.agent/agents/[nome].md`.

- `kyrie-admin` — Gestão administrativa da Kyrie
- `kyrie-ai` — Desenvolvimento do módulo de IA  
- `kyrie-client` — Perspectiva do portal cliente
- `orchestrator` — Coordenação entre agentes e tarefas multi-domínio
- `backend-specialist` — FastAPI, LangGraph, Python
- `frontend-specialist` — Next.js, React, Tailwind, shadcn, dnd-kit
- `database-architect` — Supabase, schema, RLS, migrations
- `debugger` — Bugs, pipeline de dados
- `security-auditor` — RLS, auth, env vars
- `project-planner` — Arquitetura, PRDs, roadmap
- `code-archaeologist` — Análise de código legado
- `documentation-writer` — Documentação técnica
- `devops-engineer` — CI/CD, deploy, infraestrutura
- `explorer-agent` — Exploração e prototipagem
- `mobile-developer` — Mobile/PWA
- `performance-optimizer` — Performance e otimização
- `product-manager` — Gestão de produto
- `product-owner` — Visão de produto
- `qa-automation-engineer` — Testes e QA
- `seo-specialist` — SEO técnico
- `test-engineer` — Testes unitários/integração
- `game-developer` — (especial)
- `penetration-tester` — Segurança

**Skills:** `.agent/skills/` | **Workflows:** `.agent/workflows/` | **Regras extras:** `.agent/rules/`

---

## TIER 0: REGRAS UNIVERSAIS (SEMPRE ATIVAS)

**Idioma:** Responder em PT-BR. Código/comentários em inglês. Nomes de DB seguem padrões existentes.

### 🏥 Diagnóstico Antes da Implementação (INEGOCIÁVEL)

1. **QUERY FIRST** — entender o estado atual
2. **REPORT** — mostrar findings para o Gilmar
3. **WAIT** — NÃO implementar sem aprovação
4. **VALIDATE** — provar que o fix funcionou depois

### Clean Code

- Zero tipos `any`. Todas as mutações via `/actions/`. Máximo 300 linhas por componente.
- Supabase client: `utils/supabase/client.ts` (browser), `utils/supabase/server.ts` (server).
- Toda chamada Supabase deve checar `.error`. Imports absolutos com `@/`.

### Cascade Awareness

- Migration → atualizar `/types/`, `/actions/`, componentes consumidores
- Server Action → atualizar componentes consumidores + `revalidatePath`
- RLS Policy → testar como KYRIE_ADMIN e CLIENT_OWNER
- View/Schema change → `NOTIFY pgrst, 'reload schema'`
- AI endpoint → atualizar `components/ai/ChatInterface.tsx` + `actions/ai.ts`

---

## TIER 1: SUPABASE

**27 tabelas, 100% RLS (67 policies), 39 FKs, 63 indexes, 1 view, 7 funções, 6 triggers, 9 enums.**

### ⚠️ Schema Real — wiki_embeddings (CRÍTICO)

```
Coluna real: chunk_text   (NÃO "content")
Coluna real: page_id      (NÃO "wiki_page_id")
```

Todo código que tocar `wiki_embeddings` DEVE usar `chunk_text` e `page_id`.
RPC de busca: `match_wiki_embeddings` (confirmado no banco).
Embeddings: 768 dims, modelo `text-embedding-001`, 100% consistente.

### Naming

`kanban_*` (10 tabelas), `ai_*` (2), `wiki_*` (2), sem prefixo para core (organizations, profiles, projects, tasks, approvals, approval_history, activities, notifications, inbox_items, time_entries, reports, business_metrics, client_health). Views: `*_view`.

### Arquitetura Multi-org

`organizations` é a entidade central. Toda tabela de dados tem `organization_id` FK. RLS escopa todos os dados por organização. Admins Kyrie veem todas as orgs; clientes veem apenas a própria.

### Roles (`user_role`)
KYRIE_ADMIN, KYRIE_TEAM, CLIENT_OWNER, CLIENT_VIEWER

### Funções-chave
`is_kyrie_admin()`, `get_user_org_id()`, `handle_new_user()`, `log_activity()`

### Enums (9)
- `task_status`: backlog, todo, in_progress, review, done, cancelled
- `task_priority`: low, medium, high, urgent
- `approval_status`: pending, approved, rejected, revision, expired
- `approval_content_type`: creative, copy, post, landing_page, email, other
- `report_type`: weekly, monthly, quarterly, custom
- `report_status`: draft, generated, sent, viewed
- `churn_risk_level`: low, medium, high, critical
- `activity_type`: report_generated, report_viewed, task_created, task_completed, project_created, project_updated, time_logged, metric_updated, health_calculated, user_login, user_action, comment_added

### Triggers (6)
`business_metrics_updated_at`, `organizations_updated_at`, `reports_updated_at`, `tasks_updated_at` (todos chamam `update_updated_at()`), `tasks_completion_tracker` (seta completed_at), `trigger_sync_global_column` (sync colunas kanban no INSERT).

### Indexes importantes
- `idx_wiki_embeddings_vector` — ivfflat vector search (cosine)
- `idx_kanban_cards_column` — btree (column_id, position) para ordenação
- `idx_inbox_user_unread` — partial WHERE NOT archived
- `idx_one_active_timer_per_user` — UNIQUE WHERE end_time IS NULL
- `idx_tasks_ice_score` — btree DESC NULLS LAST

### Regras de Migration
- Sempre criar novo arquivo de migration (nunca editar existentes)
- Sempre `NOTIFY pgrst, 'reload schema'` após mudanças
- PostgREST join retornando null = FK não cacheada → reload schema

---

## TIER 1: FRONTEND

- Server Components por padrão. `'use client'` apenas para interatividade.
- Dois layouts: `app/kyrie/layout.tsx` (admin), `app/client/layout.tsx` (cliente).
- Fluxo de dados: Supabase → Server Action → Component. Mutação → Server Action → `revalidatePath()`.
- **Roxo É a marca Kyrie** (`#8B5CF6`, `#6D28D9`). NÃO banir roxo.
- Debug: console.log em cada estágio (raw Supabase → transform → props). Checar snake_case vs camelCase.

---

## TIER 1: SISTEMA DE IA

### Estado atual (Fase 3B concluída)
- ChatInterface (2 componentes), FastAPI + 1 LangGraph graph
- `ai_conversations` + `ai_messages` no banco
- `wiki_embeddings` com VECTOR(768) e ivfflat index
- 1 aula indexada (7 chunks, 768 dims)

### Roadmap de IA (Fases 4-6)
- **Fase 4-PREP** 🔄 — Corpus (demais aulas + metodologia Kyrie) + fix do splitter
- **Fase 4** ⏳ — RAG: `retrieve_context` no LangGraph usando `chunk_text` e `page_id`
- **Fase 5** ⏳ — 7 agentes: @cfo, @chief-of-staff, @strategist, @growth, @copywriter, @designer, @sales
- **Fase 6** ⏳ — UI: AI SDK (useChat) + AI Elements (Conversation, Message, Sources, PromptInput, Shimmer)

### Padrões FastAPI
- Entrypoint: `api/main.py`. Graphs em `api/graphs/`. Sempre `async def`. Pydantic para validação.
- Diretórios futuros: `api/services/`, `api/memory/`, `api/kb/`

### Compatibilidade Python 3.12
- Travas no `requirements.txt`: `httpcore>=1.0.2` e `httpx==0.27.2`
- Bug do `.env` corrigido: limpeza de aspas via `.strip('"').strip("'")`

---

## CLASSIFIER DE REQUESTS

| Tipo | Triggers | Ação |
|------|----------|------|
| QUESTION | "o que é", "explica", "como funciona" | Resposta em texto |
| DIAGNOSTIC | "diagnostica", "query", "verifica" | Query via MCP → Report → Aguardar |
| SIMPLE CODE | "corrige", "ajusta", "fix" (1 arquivo) | Edit inline |
| COMPLEX CODE | "implementa", "build", "refactor" | Socratic Gate → {task-slug}.md |
| MIGRATION | "migration", "tabela", "RLS", "trigger" | Impact analysis → SQL → Validar |
| AI/AGENT | "agente", "memória", "RAG", "LangGraph" | Python + Prompt Engineering |
| DESIGN/UI | "design", "componente", "página" | Socratic Gate → {task-slug}.md |
| PROMPT CRAFT | "gera prompt", "system prompt" | Texto, não código |

---

## SOCRATIC GATE (OBRIGATÓRIO para COMPLEX CODE, MIGRATION, AI)

- **Nova Feature** → Fazer 3+ perguntas (escopo, edge cases, tabelas/componentes afetados)
- **Migration** → Mapear TUDO: tabelas, views, RLS, funções, triggers, Server Actions, componentes
- **Bug** → Diagnosticar via MCP → Report → Aguardar aprovação → Fix → Validar com mesma query
- **AI/Agent** → Confirmar: qual agente, qual escopo, qual acesso à memória, comportamento esperado
- **Request vago** → Perguntar: Propósito? Escopo? Output esperado?

**Regra de ouro:** Nunca assumir. Diagnóstico antes da implementação. Aguardar aprovação. Sempre.

---

## MODOS DE OPERAÇÃO

| Modo | Comportamento |
|------|--------------|
| **plan** | 4 fases: Analysis → Planning → Solutioning → Implementation. SEM CÓDIGO antes da Fase 4. |
| **ask** | Apenas perguntas. Socrático. |
| **edit** | Executar mudanças. Checar {task-slug}.md primeiro. |
| **diagnose** | Query → Analisar → Report → Aguardar aprovação → Fix → Validar. |
| **prompt** | Gerar prompts para agentes do kOS. Apenas texto. |

---

## VARIÁVEIS DE AMBIENTE

**.env (Python backend):**
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_ACCESS_TOKEN`, `GEMINI_API_KEY`, `GROQ_API_KEY`

**.env.local (Next.js):**
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`, `GROQ_API_KEY` (⚠️ duplicado), `TRELLO_API_KEY`, `TRELLO_TOKEN`

---

## DÍVIDA TÉCNICA (NÃO piorar)

🔴 `KanbanCardDetails.tsx` (866 linhas) — separar quando tocar
🔴 `temp_original.tsx` (115KB na raiz) — deletar
🔴 Zero testes Playwright
🟡 `KanbanBoard.tsx` (600), `KanbanCard.tsx` (389), `CardCoverSelector.tsx` (331) — monitorar
🟡 RLS duplicada em business_metrics + client_health
🟡 `next.config.ts` vazio (sem remotePatterns)
🟡 GROQ_API_KEY duplicado em .env E .env.local
🟡 Legado Trello (TRELLO_API_KEY/TOKEN + find_trello_board.ts)
🟡 `report_generator.py` usa Groq — converter para Gemini na Fase 5

---

## CHECKLIST PRE-DEPLOY

1. `npx tsc --noEmit` → 0 erros
2. `npx next lint` → 0 warnings
3. Migrations aplicadas + `NOTIFY pgrst`
4. Nenhum secret no código, RLS completa
5. `npm run build` → sucesso

> Task NÃO está concluída até o build passar.

---

## MCP DISPONÍVEL

- **supabase-kyrie** — Acesso direto ao banco. Usar para diagnóstico, queries, validação de estado.

> Para usar: "Rode esta query via MCP supabase-kyrie: [SQL]"

---

## ROADMAP ATUAL

Ver arquivo completo: `kOS_ROADMAP_MASTER.md` (se disponível no projeto)

**Resumo do estado:**
- ✅ Fases 0, 1, 2, 3A, 3B, 3C concluídas
- 🔄 Fase 4-PREP em andamento (1 aula indexada, corpus pendente)
- ⏳ Fase 4 → 5 → 6 → 7 → 8 (Brownfield Audit Final)

**Próximo passo imediato:**
1. Deletar arquivos lixo (check_*.js, test_backend.py, etc.)
2. Fix do splitter em `scripts/ingest-growth-advisor.ts`
3. Re-indexar Aula 01 com novo splitter
4. Transcrever e indexar demais aulas