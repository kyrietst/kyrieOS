---
trigger: always_on
---

# GEMINI.md — kyrieOS v2.0

> AI rules for kyrieOS workspace. From real diagnostic — 2026-03-03.

## PROJECT

**kyrieOS (kOS):** Internal SaaS for Kyrie Performance & Resultados (business growth consultancy). Replaces Trello/Clockify/Sheets/WhatsApp. Owner: Gilmar (CEO). Pre-production (schema ready, DB empty).

**Kyrie Methodology:** Iceberg Framework — most agencies work only on the surface (social media posts, paid traffic, vanity metrics). Kyrie works on what's below: sales funnel end-to-end, offer construction, sales team, cash flow, logistics, product, positioning, processes, CRM, scripts, retention. kOS must reflect this philosophy in every feature.

**Scope:** kOS is ONLY this project. Do NOT reference or mix with Mont Distribuidora, catalogo-mont, or any other Gilmar project. They are separate repos, separate databases, separate contexts.

**Stack (FIXED):** Next.js 16.1.6 (App Router ONLY), React 19.2.3, TypeScript strict, Tailwind v4, shadcn/ui (Radix), @dnd-kit, framer-motion, recharts, react-big-calendar, react-hook-form+zod, @tanstack/react-table, lucide-react, sonner, cmdk, resend, Supabase (Auth+DB+Storage+RLS), Python FastAPI+LangGraph, Gemini+Groq LLMs, Playwright.

🔴 **BANNED:** MongoDB, Prisma, Drizzle, Firebase, tRPC, Zustand, Redux, CSS-in-JS, Pages Router, GSAP.

**Structure:**
- `actions/` — 9 Server Actions (ai, calendar, clients, inbox, kanban, labels, master-calendar, time-tracking, wiki)
- `api/` — FastAPI (main.py) + `graphs/report_generator.py`
- `app/kyrie/` — Admin: dashboard, clients/[slug]/kanban, clients/[slug]/wiki, approvals, ai, inbox, insights, workspace/calendar, workspace/kanban
- `app/client/` — Client: dashboard, approvals/[id], projects, reports/[id]
- `components/` — 63 total: kanban(18), ui(23+), layout(7), admin(5), approvals(4), ai(2), others(4)
- `utils/supabase/client.ts` (browser) + `server.ts` (SSR)
- `types/` — Type definitions
- `lib/utils.ts` + `lib/agents/business-calculator.ts`
- `supabase/migrations/` — 24 migrations
- `docs/` — 40 docs

---

## REQUEST CLASSIFIER (before any action)

| Type | Triggers (PT-BR) | Action |
|------|-------------------|--------|
| QUESTION | "o que é", "explica", "como funciona" | Text response only |
| DIAGNOSTIC | "diagnostica", "query", "verifica" | Query via MCP → Report → Wait |
| SIMPLE CODE | "corrige", "ajusta", "fix" (1 file) | Inline edit |
| COMPLEX CODE | "implementa", "build", "refactor" | Socratic Gate → {task-slug}.md |
| MIGRATION | "migration", "tabela", "RLS", "trigger" | Impact analysis → SQL → Validate |
| AI/AGENT | "agente", "memória", "RAG", "LangGraph" | Python + Prompt Engineering |
| DESIGN/UI | "design", "componente", "página" | Socratic Gate → {task-slug}.md |
| PROMPT CRAFT | "gera prompt", "system prompt" | Text output, not code |

---

## TIER 0: UNIVERSAL RULES (ALWAYS ACTIVE)

**Language:** Respond PT-BR. Code/comments in English. DB names follow existing patterns.

### 🏥 Diagnosis Before Implementation (NON-NEGOTIABLE)

1. QUERY FIRST — understand current state
2. REPORT — show findings to Gilmar
3. WAIT — do NOT implement until approved
4. VALIDATE — prove fix worked after

### Clean Code

- Zero `any` types. All mutations through `/actions/`. Max 300 lines per component.
- Supabase client: `utils/supabase/client.ts` (browser), `utils/supabase/server.ts` (server).
- Every Supabase call must check `.error`. Absolute imports with `@/`.

### Cascade Awareness

- Migration → update `/types/`, `/actions/`, consuming components
- Server Action → update consuming components + `revalidatePath`
- RLS Policy → test from KYRIE_ADMIN and CLIENT_OWNER
- View/Schema change → `NOTIFY pgrst, 'reload schema'`
- AI endpoint → update `components/ai/ChatInterface.tsx` + `actions/ai.ts`

---

## TIER 1: SUPABASE

**27 tables, 100% RLS (67 policies), 39 FKs, 63 indexes, 1 view, 7 functions, 6 triggers, 9 enums.**

**Naming:** `kanban_*` (10 tables), `ai_*` (2), `wiki_*` (2), no prefix for core (organizations, profiles, projects, tasks, approvals, approval_history, activities, notifications, inbox_items, time_entries, reports, business_metrics, client_health). Views: `*_view`. Heaviest tables: kanban_cards (35 cols), approvals (19 cols), business_metrics (18 cols).

**Multi-org architecture:** `organizations` is the central entity. Every data table has `organization_id` FK. RLS scopes all data per organization. Kyrie admins see all orgs; clients see only their own.

**Roles** (enum `user_role`): KYRIE_ADMIN, KYRIE_TEAM, CLIENT_OWNER, CLIENT_VIEWER.
**Key functions:** `is_kyrie_admin()`, `get_user_org_id()`, `handle_new_user()`, `log_activity()`.
**Central FK:** Nearly all tables → `organizations.organization_id`.
**Self-refs:** approvals.parent_id, kanban_columns.template_id, wiki_pages.parent_id.
**Key chains:** kanban_cards → kanban_columns → organizations | kanban_card_comments → kanban_cards + profiles | kanban_checklists → kanban_cards → organizations | ai_messages → ai_conversations | tasks → projects → organizations | wiki_embeddings → wiki_pages → organizations | approval_history → approvals → organizations + projects.
**Vector:** wiki_embeddings has ivfflat index (cosine_ops).
**Unique timer:** idx_one_active_timer_per_user WHERE end_time IS NULL.

**Rules:** New migration file always (never edit existing). Always `NOTIFY pgrst, 'reload schema'` after changes. PostgREST join returning null = FK not cached → reload.

**Triggers (6):** `business_metrics_updated_at`, `organizations_updated_at`, `reports_updated_at`, `tasks_updated_at` (all call `update_updated_at()`), `tasks_completion_tracker` (sets completed_at), `trigger_sync_global_column` (syncs kanban columns on INSERT).

**Known issues:** Duplicate RLS on business_metrics and client_health (double ALL+SELECT for admins).

**Enums (9):**
- `user_role`: KYRIE_ADMIN, KYRIE_TEAM, CLIENT_OWNER, CLIENT_VIEWER
- `task_status`: backlog, todo, in_progress, review, done, cancelled
- `task_priority`: low, medium, high, urgent
- `approval_status`: pending, approved, rejected, revision, expired
- `approval_content_type`: creative, copy, post, landing_page, email, other
- `report_type`: weekly, monthly, quarterly, custom
- `report_status`: draft, generated, sent, viewed
- `churn_risk_level`: low, medium, high, critical
- `activity_type`: report_generated, report_viewed, task_created, task_completed, project_created, project_updated, time_logged, metric_updated, health_calculated, user_login, user_action, comment_added

**Key indexes to know:**
- `idx_wiki_embeddings_vector` — ivfflat vector search (cosine)
- `idx_kanban_cards_column` — btree (column_id, position) for card ordering
- `idx_inbox_user_unread` — partial WHERE NOT archived
- `idx_one_active_timer_per_user` — UNIQUE WHERE end_time IS NULL
- `idx_tasks_ice_score` — btree DESC NULLS LAST

---

## TIER 1: FRONTEND

- Server Components default. `'use client'` only for interactivity.
- Two layouts: `app/kyrie/layout.tsx` (admin), `app/client/layout.tsx` (client).
- Data flow: Supabase → Server Action → Component. Mutation → Server Action → `revalidatePath()`.
- Purple IS the Kyrie brand (`#8B5CF6`, `#6D28D9`). Purple Ban does NOT apply.
- Debug: console.log each stage (raw Supabase → transform → props). Check snake_case vs camelCase.

---

## TIER 1: AI SYSTEM

**Current:** ChatInterface (2 components), FastAPI + 1 LangGraph graph, ai_conversations + ai_messages tables, wiki_embeddings with vector.

**Planned:** 7 agents (@cfo, @chief-of-staff, @strategist, @growth, @copywriter, @designer, @sales). 3-tier memory (Core key-value + Buffer 20msgs + Semantic ChromaDB). Knowledge Base RAG (Growth Advisor + books → ChromaDB). 3 scopes (🟣Kyrie 🟡Clients 🔵Personal).

**FastAPI patterns:** Entrypoint `api/main.py`. Graphs at `api/graphs/`. Always `async def`. Pydantic for validation. Future dirs: `api/memory/`, `api/kb/`.

**Message flow (planned):** User msg → Orchestrator routes to agent → Load Core Memory → Load Conv Buffer → Semantic search → KB search (RAG) → Cross-agent query if needed → LLM response → Save + embed + extract facts + compact buffer.

---

## AGENT ROUTING

Announce: `🤖 @[agent]...` before responses.

- `frontend-specialist` — Next.js, React, Tailwind, shadcn, dnd-kit, framer-motion
- `backend-specialist` — FastAPI, LangGraph, ChromaDB, Python
- `supabase-specialist` — PostgreSQL, RLS, migrations, views, triggers
- `orchestrator` — Multi-domain tasks
- `debugger` — Bugs, data pipeline
- `security-auditor` — RLS, auth, env vars
- `project-planner` — Architecture, PRDs

---

## SOCRATIC GATE (MANDATORY for COMPLEX CODE, MIGRATION, AI tasks)

- **New Feature** → ASK 3+ questions (scope, edge cases, which tables/components affected)
- **Migration** → Map ALL affected: tables, views, RLS policies, functions, triggers, Server Actions, components
- **Bug** → Diagnose via MCP query → Report findings → Wait for Gilmar's approval → Fix → Validate with same query
- **AI/Agent** → Confirm: which agent, which scope, what memory access, expected behavior
- **Vague request** → Ask: Purpose? Scope? Expected output?

**Golden rule:** Never assume. Diagnosis before implementation. Wait for approval. Always.

---

## MODES

| Mode | Behavior |
|------|----------|
| **plan** | 4-phase: Analysis → Planning → Solutioning → Implementation. NO CODE before Phase 4. |
| **ask** | Questions only. Socratic. |
| **edit** | Execute changes. Check {task-slug}.md first. |
| **diagnose** | Query → Analyze → Report → Wait approval → Fix → Validate. |
| **prompt** | Generate prompts for kOS agents. Text output only. |

---

## ENVIRONMENT VARS

**.env (server-side):** SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, SUPABASE_ACCESS_TOKEN, GEMINI_API_KEY, GROQ_API_KEY
**.env.local (client+server):** NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_URL, GROQ_API_KEY (⚠️ duplicate), TRELLO_API_KEY, TRELLO_TOKEN

---

## TECHNICAL DEBT (do NOT make worse)

🔴 `KanbanCardDetails.tsx` (866 lines) — split when touching
🔴 `temp_original.tsx` (115KB root) — delete
🔴 Zero Playwright tests
🟡 `KanbanBoard.tsx` (600), `KanbanCard.tsx` (389), `CardCoverSelector.tsx` (331) — monitor
🟡 Duplicate RLS on business_metrics + client_health
🟡 `next.config.ts` empty (no remotePatterns)
🟡 GROQ_API_KEY duplicated in .env AND .env.local
🟡 Trello legacy (TRELLO_API_KEY/TOKEN + find_trello_board.ts)

---

## CHECKLIST (before deploy)

1. `npx tsc --noEmit` → 0 errors
2. `npx next lint` → 0 warnings
3. Migrations applied + `NOTIFY pgrst`
4. No secrets in code, RLS complete
5. `npm run build` → success

> Task NOT finished until build succeeds.
