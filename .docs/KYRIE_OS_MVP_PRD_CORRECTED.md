# 🚀 KYRIE OS - MVP PRD
## Product Requirements Document

**Version:** MVP 1.0 (Revised - LangGraph)
**Date:** January 29, 2026  
**Author:** Gilmar (Kyrie Performance & Resultados)  
**Development Method:** Vibe Coding 🎵  
**Status:** Ready to Ship

---

## 📋 ÍNDICE

1. [Visão Executiva](#1-visão-executiva)
2. [O Problema](#2-o-problema)
3. [A Solução MVP](#3-a-solução-mvp)
4. [Features do MVP](#4-features-do-mvp)
5. [Stack Técnica](#5-stack-técnica)
6. [AI Agents (LangGraph)](#6-ai-agents-langgraph)
7. [Roadmap MVP](#7-roadmap-mvp)
8. [Success Metrics](#8-success-metrics)

---

## 1. VISÃO EXECUTIVA

### 1.1 O Que É Kyrie OS?

**"Kyrie OS" - Operating System para Consultorias de Performance**

Um ecossistema completo que:
- ✅ **Unifica gestão interna** (substitui Jira + Trello + ClickUp)
- ✅ **Portal do cliente** (relatórios + aprovações + comunicação)
- ✅ **IA integrada** (insights + automações + cálculos)
- ✅ **Tracking inteligente** (tutoriais + progresso + ROI)
- ✅ **Elimina ferramentas fragmentadas**

**Diferencial:** Não é "mais um project manager", é um **sistema de inteligência comercial + gestão** que transforma consultoria em máquina de resultados previsíveis.

### 1.2 Por Que Construir Isso?

**Dor atual:**
- Gilmar gasta 10h/semana em coordenação/relatórios
- Clientes não veem o trabalho sendo feito (invisível)
- Relatórios manuais consomem tempo valioso
- Difícil provar ROI claramente

**Solução:**
- AI agents (LangGraph) fazem relatórios automaticamente
- Dashboard mostra trabalho em tempo real
- Métricas de negócio sempre atualizadas
- Transparência = confiança = retenção

### 1.3 MVP Scope

**O MVP foca em 2 coisas:**

1. **Para Gilmar:**
   - LangGraph automatizando relatórios
   - Dashboard de gestão de todos os clientes
   - Visão unificada do trabalho

2. **Para Clientes:**
   - Ver o que está sendo feito (tarefas/projetos)
   - Ver resultados do negócio (métricas)
   - Relatórios semanais automáticos

---

## 2. O PROBLEMA

### 2.1 Problemas de Gilmar

```yaml
PROBLEMA 1: Ferramentas fragmentadas
  Current State:
    - Trello para tarefas
    - Clockify para tempo
    - Google Sheets para métricas
    - WhatsApp para comunicação
    - Email para relatórios
    - 5+ ferramentas diferentes!
  
  Pain Level: 🔥🔥🔥 CRÍTICO
  Impact: Context switching mata produtividade
  Solution: Kyrie OS unifica TUDO em um lugar

PROBLEMA 2: Tempo perdido em coordenação
  Current State:
    - 10h/semana em mensagens, calls, relatórios
    - Interrupções constantes de clientes
    - Repetir mesmas informações
  
  Pain Level: 🔥🔥🔥 ALTO
  Impact: Menos tempo para trabalho estratégico

PROBLEMA 3: Relatórios manuais
  Current State:
    - Coleta manual de dados (Clockify, Trello, Meta Ads)
    - Montar planilhas/apresentações
    - Enviar por WhatsApp/Email
  
  Pain Level: 🔥🔥🔥 ALTO
  Impact: 4h/semana perdidas

PROBLEMA 4: Clientes inseguros
  Current State:
    - "O que vocês estão fazendo?"
    - "Vale a pena o investimento?"
    - Churn por falta de transparência
  
  Pain Level: 🔥🔥 MÉDIO
  Impact: Churn de 10%/ano
```

### 2.2 Problemas dos Clientes

```yaml
PROBLEMA 1: Zero visibilidade do trabalho
  - Não sabem o que está sendo feito
  - Dependem de Gilmar enviar relatórios
  - Insegurança sobre investimento

PROBLEMA 2: Métricas desorganizadas
  - Dados espalhados (Sheets, Meta Ads, Analytics)
  - Difícil ver ROI claramente
  - Não sabem se está valendo a pena

PROBLEMA 3: Comunicação fragmentada
  - WhatsApp + Email + Calls
  - Sem histórico centralizado
  - Perdem informações
```

---

## 3. A SOLUÇÃO MVP

### 3.1 Visão Geral

**1 Sistema para Governar Todos:**

```
┌─────────────────────────────────────────────────────────┐
│         KYRIE OS - Operating System (MVP)               │
│                                                         │
│  Substitui: Trello + Clockify + Sheets + WhatsApp      │
│             + Email + PowerPoint + 10 outras tools      │
└─────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                                 │
┌────────▼──────────┐            ┌────────▼──────────┐
│   ADMIN APP       │            │   CLIENT APP      │
│   (Gilmar)        │            │   (4 clientes)    │
│                   │            │                   │
│ • Dashboard       │            │ • Métricas        │
│   Consolidado     │            │   Negócio         │
│                   │            │                   │
│ • Gestão de       │            │ • Projetos        │
│   Clientes        │            │   Ativos          │
│                   │            │                   │
│ • AI Agents       │            │ • Trabalho em     │
│   Control         │            │   Andamento       │
│                   │            │                   │
│ • Relatórios      │            │ • Relatórios      │
│   Manuais         │            │   Históricos      │
└───────────────────┘            └───────────────────┘

INTELLIGENCE LAYER (IA embarcada)
├─ Report Generator (LangGraph)
├─ Business Calculator (LangGraph)
├─ Insights Generator (próxima fase)
└─ Prediction Engine (próxima fase)
```

### 3.2 Arquitetura de Roles

**App único, views diferentes por role:**

```typescript
// App único, views diferentes por role
if (user.role === 'KYRIE_ADMIN') {
  // Dashboard Kyrie completo
  <KyrieDashboard>
    <AllClients />
    <SprintPlanning />
    <AIInsights />
    <TeamManagement />
  </KyrieDashboard>
}

if (user.role === 'CLIENT_OWNER') {
  // Portal do cliente
  <ClientPortal>
    <MyReports />
    <TaskProgress />
    <Tutorials />
    <ApprovalQueue />
  </ClientPortal>
}
```

**Roles no sistema:**
- `KYRIE_ADMIN` - Gilmar (acesso total)
- `KYRIE_TEAM` - Futuros membros da equipe (futuro)
- `CLIENT_OWNER` - Dono do negócio (pode aprovar, ver tudo)
- `CLIENT_VIEWER` - Funcionário do cliente (só visualiza)

### 3.3 Features por Módulo

#### 📊 MÓDULO 1: DASHBOARD KYRIE (Interno)

```
┌─────────────────────────────────────────┐
│ 🏠 KYRIE DASHBOARD                      │
├─────────────────────────────────────────┤
│                                         │
│ 📊 Sprint Atual                         │
│ ├─ Distribuição por cliente (%)        │
│ │  • Adega: 40% (target: 40%) ✅       │
│ │  • Mont: 35% (target: 35%) ✅        │
│ │  • Libertare: 15% (target: 15%) ✅   │
│ ├─ Horas trabalhadas vs Meta           │
│ ├─ Alertas automáticos                 │
│ └─ Próximas 5 prioridades               │
│                                         │
│ 🤖 AI Insights                          │
│ ├─ "Adega precisa +5h esta semana"     │
│ ├─ "MontMassas: Google Ads performando" │
│ ├─ "Sugestão: priorizar NFC-e"         │
│ └─ "Cliente Libertare engajado (🟢)"   │
│                                         │
│ 📋 Backlog Inteligente                  │
│ ├─ Auto-priorizado por ICE + Tempo     │
│ ├─ Drag & drop manual override         │
│ ├─ Filtros: cliente/projeto/status     │
│ └─ Bulk actions                        │
│                                         │
│ 👥 Clientes                             │
│ ├─ Adega Anita's (health: 🟢 85/100)  │
│ │  └─ ROI: 4.2x • Churn risk: 5%      │
│ ├─ MontMassas (health: 🟡 72/100)     │
│ │  └─ ROI: 3.1x • Churn risk: 15%     │
│ ├─ Libertare (health: 🟢 88/100)      │
│ │  └─ ROI: 5.6x • Churn risk: 3%      │
│ └─ SI:pai (health: 🟢 80/100)         │
│    └─ ROI: 3.8x • Churn risk: 8%      │
└─────────────────────────────────────────┘
```

**Features principais:**
- ✅ Sprint planning visual com drag & drop
- ✅ Time tracking integrado (mata Clockify)
- ✅ Cálculo automático ICE + distribuição de tempo
- ✅ Chat com IA ("Qual task priorizar agora?")
- ✅ Kanban + Gantt + Calendar views
- ✅ Health score em tempo real
- ✅ Alertas proativos (cliente em risco)
- ✅ ROI por cliente calculado automaticamente

#### 🏢 MÓDULO 2: PORTAL DO CLIENTE

```
┌─────────────────────────────────────────┐
│ 🏢 ADEGA ANITA'S - Portal               │
├─────────────────────────────────────────┤
│                                         │
│ 📈 Métricas do Mês                      │
│ ├─ Faturamento: R$ 45.320 (+12%) 📈    │
│ ├─ Novos clientes: 18 (+3)             │
│ ├─ Taxa conversão: 3.2% (+0.8%)        │
│ ├─ ROI Marketing: 4.2x                 │
│ └─ Investimento: R$ 3.500               │
│    Retorno: R$ 14.700                   │
│    Lucro: R$ 11.200 💰                  │
│                                         │
│ 🎯 Progresso Projetos                   │
│ ├─ Google Ads Dezembro                 │
│ │  [██████░░░░] 60%                    │
│ │  • Setup: ✅ Concluído                │
│ │  • Anúncios: ✅ Concluído             │
│ │  • Otimização: 🔄 Em andamento       │
│ │                                       │
│ ├─ NFC-e Sistema                       │
│ │  [████████░░] 80%                    │
│ │  • Config: ✅ Concluído               │
│ │  • Testes: ✅ Concluído               │
│ │  • Deploy: 🔄 Em andamento           │
│ │                                       │
│ └─ Carrossel Instagram                 │
│    [███░░░░░░░] 30%                    │
│    • Planejamento: ✅ Concluído        │
│    • Criação: 🔄 Em andamento          │
│                                         │
│ ✅ Aprovações Pendentes (3)             │
│ ├─ 📸 Post Instagram - Promoção Natal  │
│ │   [Ver] [Aprovar] [Solicitar mudanças]│
│ ├─ 📝 Copy Email Marketing             │
│ └─ 🎨 Banner site - Black Friday       │
│                                         │
│ 📚 Tutoriais (5/8 completos)            │
│ ├─ ✅ Como adicionar produtos (100%)   │
│ ├─ ⏸️ Google Analytics (50%)           │
│ │   [Continuar assistindo]             │
│ ├─ 🆕 Meta Ads Básico                  │
│ │   [Começar] • 15min • Obrigatório    │
│ └─ 🔒 Campanhas Avançadas               │
│    Desbloqueado após: Meta Ads Básico  │
│                                         │
│ 💬 Comunicação                          │
│ ├─ Enviar mensagem para Gilmar         │
│ ├─ Últimas mensagens:                  │
│ │  • Hoje: "Setup NFC-e concluído" ✅  │
│ │  • Ontem: "Anúncios no ar!"         │
│ └─ [Ver histórico completo]            │
│                                         │
│ 📊 Relatórios Semanais                  │
│ ├─ Semana 10-16 Dez (novo) 🆕          │
│ ├─ Semana 03-09 Dez                    │
│ ├─ Semana 26 Nov - 02 Dez              │
│ └─ [Ver todos os relatórios]           │
└─────────────────────────────────────────┘
```

**Features principais:**
- ✅ Métricas de negócio em tempo real
- ✅ ROI visual e calculado automaticamente
- ✅ Progress bars de projetos
- ✅ Aprovações com preview e feedback
- ✅ Sistema de tutoriais com tracking
- ✅ Comunicação assíncrona com Kyrie
- ✅ Arquivo de relatórios semanais
- ✅ Dashboard responsivo (mobile-friendly)

### 3.2 Core Value Propositions

**Para Gilmar:**
- 🎯 **1 sistema substitui 10+ ferramentas** (Trello, Clockify, Sheets, etc)
- 🤖 **IA embarcada gera relatórios** automaticamente (economiza 4h/semana)
- 📊 **Dashboard único** para todos os clientes (zero context switching)
- ⚡ **Menos interrupções** (clientes veem dados em tempo real)
- 💰 **ROI calculado automaticamente** (prova valor constantemente)

**Para Clientes:**
- 👀 **Transparência total** do trabalho (veem tudo que acontece)
- 📈 **Métricas de negócio** sempre atualizadas (receita, ROI, conversão)
- 📱 **Acesso 24/7** ao dashboard (quando quiserem)
- 🔔 **Relatórios automáticos** toda semana (sem atrasos)
- 🎓 **Tracking de evolução** (veem próprio progresso)

**Diferencial vs. Concorrentes:**
- ❌ Trello/Jira: Só gestão de tarefas (sem IA, sem relatórios)
- ❌ ClickUp: Genérico (não focado em consultoria)
- ❌ Notion: Tudo manual (zero automação)
- ✅ **Kyrie OS: Sistema completo + IA + foco em resultado**

---

## 4. FEATURES DO MVP

### 4.1 Admin App (Gilmar)

#### Feature 1: Dashboard Consolidado

```yaml
Description:
  Visão única de todos os clientes e sprints

Display:
  - Cards por cliente (4 clientes)
  - Sprint atual (horas % por cliente)
  - Tarefas próximas (top 5)
  - Alertas de IA (problemas/oportunidades)

Data Source:
  - Supabase (projects, tasks, organizations)
  - Clockify API (time entries)
  - Google Sheets API (business metrics)

Why MVP:
  - Principal dor de Gilmar
  - Elimina context switching
  - Visão holística imediata
```

#### Feature 2: AI Report Generator

```yaml
Description:
  Botão que gera relatório semanal automaticamente
  usando LangGraph workflow

How it works:
  - LangGraph nodes:
    1. Gather time data (Clockify API)
    2. Gather metrics (Google Sheets API)
    3. Gather tasks (Supabase)
    4. Generate report (GPT-4o-mini)
  - Output: Markdown relatório completo
  - Save to database
  - Disponível para cliente no portal

Execution Time: <15 segundos

Why MVP:
  - MAIOR valor: economiza 4h/semana
  - Prova conceito de IA
  - Diferencial competitivo
```

#### Feature 3: Client Management

```yaml
Description:
  CRUD básico de clientes e projetos

Components:
  - Lista de clientes
  - Adicionar/editar cliente
  - Associar projetos
  - Definir targets de tempo

Why MVP:
  - Base necessária para tudo
  - Sem isso, nada funciona
```

#### Feature 4: Unified Task Manager

```yaml
Description:
  Gestão de tarefas integrada (substitui Trello/Jira)

Components:
  - Kanban board por cliente
  - Criar/editar/mover tarefas
  - Filtros por projeto/status
  - Drag & drop

Why MVP:
  - UNIFICA FERRAMENTAS (mata Trello)
  - Tudo em um lugar
  - Base para relatórios AI
```

#### Feature 5: Intelligence Dashboard

```yaml
Description:
  Painel com insights de IA sobre todos os clientes

Components:
  - Health score por cliente
  - Alertas automáticos (cliente em risco)
  - ROI calculado automaticamente
  - Sugestões de ação

Why MVP:
  - DIFERENCIAL vs. ferramentas normais
  - IA mostra o que fazer agora
  - Previne churn
```

### 4.2 Client App (4 clientes)

#### Feature 1: Business Metrics Dashboard

```yaml
Description:
  Métricas de negócio do cliente sempre atualizadas

Display:
  - Faturamento (mensal + evolução)
  - Novos clientes
  - Taxa de conversão
  - ROI do marketing
  - Gráficos de tendência

Data Source:
  - Google Sheets API (cliente mantém planilha)
  - Sync manual ou automático

Why MVP:
  - Clientes querem ver resultado
  - Justifica investimento
  - Reduz "cadê o trabalho?"
```

#### Feature 2: Work in Progress

```yaml
Description:
  Lista de projetos e tarefas em andamento

Display:
  - Projeto 1 [████░░░░░░] 40%
    └─ Tarefas: 3 em andamento, 2 concluídas
  - Projeto 2 [██████░░░░] 60%
    └─ Tarefas: 5 em andamento, 8 concluídas

Why MVP:
  - Transparência do que está sendo feito
  - Cliente vê progresso real
  - Menos interrupções para Gilmar
```

#### Feature 3: Weekly Reports Archive

```yaml
Description:
  Lista de relatórios semanais gerados pela AI

Display:
  - Semana 10/12 - 16/12
    └─ Resumo executivo
    └─ Trabalho realizado
    └─ Resultados alcançados
    └─ Próximos passos
    └─ [Ver completo] [Download PDF]

Why MVP:
  - Histórico sempre acessível
  - Cliente pode revisar quando quiser
  - Prova de valor acumulado
```

#### Feature 4: ROI Tracker

```yaml
Description:
  Visualização do ROI do investimento em consultoria

Display:
  - Gráfico de evolução
  - Investimento: R$ 1.500/mês
  - Retorno: R$ 8.400/mês
  - ROI: 5.6x 🚀
  - Payback: 2 semanas

Why MVP:
  - PROVA VALOR CLARAMENTE
  - Cliente vê que vale a pena
  - Reduz churn drasticamente
```

---

## 5. STACK TÉCNICA

### 5.1 Por Que Esta Stack?

**Decisões técnicas:**

```yaml
Frontend: Next.js 14
  Por quê:
    ✅ React Server Components (performance)
    ✅ App Router (routing moderno)
    ✅ API routes (backend leve)
    ✅ Vercel deploy (zero config)

Backend: FastAPI
  Por quê:
    ✅ Python = LangGraph/LangChain
    ✅ Async nativo (performance)
    ✅ Type hints (developer experience)
    ✅ Docs automáticas (Swagger)

Database: Supabase
  Por quê:
    ✅ PostgreSQL (robusto)
    ✅ Auth built-in (economiza tempo)
    ✅ Realtime (subscriptions)
    ✅ RLS (security por padrão)
    ✅ Free tier generoso

AI: LangGraph + LangChain
  Por quê:
    ✅ Workflows determinísticos
    ✅ State machines (debugável)
    ✅ LangChain ecosystem (tools)
    ✅ OpenAI integration (GPT-4o-mini)
```

### 5.2 Tech Stack Detalhado

```yaml
FRONTEND:
  Framework: Next.js 14 (App Router)
  Language: TypeScript (strict mode)
  Styling: Tailwind CSS + shadcn/ui
  Animations: Framer Motion
  State: React Context + SWR (data fetching)
  Auth: Supabase Auth
  
  Architecture:
    Single App with Role-Based Routing:
    
    app/
    ├── (auth)/
    │   └── login/page.tsx          # Login único
    │
    ├── (kyrie)/                    # KYRIE_ADMIN role
    │   ├── layout.tsx              # Admin layout
    │   ├── dashboard/page.tsx      # Sprint planning
    │   ├── clients/page.tsx        # Client management
    │   ├── backlog/page.tsx        # Intelligent backlog
    │   └── insights/page.tsx       # AI insights
    │
    ├── (client)/                   # CLIENT_OWNER role
    │   ├── layout.tsx              # Client layout
    │   ├── dashboard/page.tsx      # Metrics & projects
    │   ├── approvals/page.tsx      # Approval queue
    │   ├── tutorials/page.tsx      # Tutorial center
    │   └── reports/page.tsx        # Reports archive
    │
    └── middleware.ts               # Role-based redirect
  
  Key Libraries:
    - @supabase/supabase-js (auth + data)
    - recharts (gráficos)
    - react-hook-form (formulários)
    - zod (validação)
    - @dnd-kit/core (drag & drop)
    - framer-motion (animations)

BACKEND:
  Framework: FastAPI (Python 3.11+)
  AI Framework: LangGraph 0.2+
  LLM: OpenAI GPT-4o-mini
  
  Key Libraries:
    - langgraph (state machines)
    - langchain (LLM abstraction)
    - langchain-openai (GPT integration)
    - pydantic (schemas)
    - supabase-py (database)
    - httpx (HTTP client for APIs)
    - python-dotenv

DATABASE:
  Primary: Supabase (PostgreSQL)
  
  Tables (MVP):
    Core:
      - organizations (clientes)
      - users (auth)
      - projects
      - tasks
    
    Intelligence Layer:
      - business_metrics (receita, ROI, etc)
      - client_health (scores calculados por IA)
      - ai_insights (sugestões e alertas)
      - reports (gerados por IA)
    
    Tracking:
      - time_entries (tempo trabalhado)
      - activities (audit log)

EXTERNAL APIS:
  1. Clockify API:
     - Get time entries
     - Weekly summaries
     - Direct HTTP requests
  
  2. Google Sheets API:
     - Read metrics
     - Update data
     - OAuth2 authentication
  
  3. Supabase API:
     - Database queries
     - Realtime subscriptions
     - Auth management

DEPLOYMENT:
  Frontend: Vercel
  Backend: Render (Docker)
  Database: Supabase Cloud
  AI Engine: Same as Backend
```

### 5.3 Role-Based Routing Implementation

```typescript
// middleware.ts - Role-based redirect

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Not authenticated → redirect to login
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Authenticated → route by role
  if (session) {
    const { data: user } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', session.user.id)
      .single()

    const path = req.nextUrl.pathname

    // KYRIE_ADMIN routes
    if (user?.role === 'KYRIE_ADMIN') {
      // Allow access to /kyrie/* routes
      if (path.startsWith('/client')) {
        // Admin trying to access client routes → redirect to admin dashboard
        return NextResponse.redirect(new URL('/kyrie/dashboard', req.url))
      }
    }

    // CLIENT_OWNER routes
    if (user?.role === 'CLIENT_OWNER') {
      // Allow access to /client/* routes
      if (path.startsWith('/kyrie')) {
        // Client trying to access admin routes → redirect to client dashboard
        return NextResponse.redirect(new URL('/client/dashboard', req.url))
      }
    }

    // Root redirect based on role
    if (path === '/') {
      if (user?.role === 'KYRIE_ADMIN') {
        return NextResponse.redirect(new URL('/kyrie/dashboard', req.url))
      }
      if (user?.role === 'CLIENT_OWNER') {
        return NextResponse.redirect(new URL('/client/dashboard', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 6. AI AGENTS (LANGGRAPH)

### 6.1 Intelligence Layer Overview

**Kyrie OS tem IA embarcada usando LangGraph:**
- 🤖 Gera relatórios automaticamente (workflows determinísticos)
- 📊 Calcula ROI e métricas de negócio
- ⚠️ Detecta clientes em risco (churn prediction)
- 💡 Sugere próximas ações
- 🎯 Prioriza tarefas por impacto

**No MVP temos 2 agents (LangGraph):**

1. **Report Generator** (prioridade 1)
   - Workflow com 3 nodes
   - Busca dados de APIs externas
   - Economiza 4h/semana

2. **Business Calculator** (prioridade 2)
   - Calcula ROI automaticamente
   - Health score do cliente
   - Churn risk prediction

### 6.2 Report Generator (LangGraph)

```python
# apps/api/graphs/report_generator.py

from langgraph.graph import StateGraph, END
from typing import TypedDict
from langchain_openai import ChatOpenAI
import httpx
import os

class ReportState(TypedDict):
    """State for Report Generator workflow"""
    client_id: str
    week_start: str
    week_end: str
    time_data: dict
    metrics_data: dict
    tasks_data: dict
    report_markdown: str

def gather_time_data(state: ReportState) -> dict:
    """
    Node 1: Fetch time tracking from Clockify API
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.clockify.me/api/v1/workspaces/{os.getenv('CLOCKIFY_WORKSPACE')}/time-entries",
            headers={"X-Api-Key": os.getenv("CLOCKIFY_API_KEY")},
            params={
                "start": state["week_start"],
                "end": state["week_end"],
                "project": get_project_id(state["client_id"])
            }
        )
        time_data = response.json()
    
    return {"time_data": time_data}

def gather_metrics(state: ReportState) -> dict:
    """
    Node 2: Fetch business metrics from Google Sheets API
    """
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    
    credentials = service_account.Credentials.from_service_account_file(
        'credentials.json',
        scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
    )
    
    service = build('sheets', 'v4', credentials=credentials)
    sheet_id = get_sheet_id(state["client_id"])
    
    result = service.spreadsheets().values().get(
        spreadsheetId=sheet_id,
        range='Metrics!A1:E10'
    ).execute()
    
    metrics_data = result.get('values', [])
    
    return {"metrics_data": metrics_data}

def gather_tasks(state: ReportState) -> dict:
    """
    Node 3: Fetch completed tasks from Supabase
    """
    from supabase import create_client
    
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY")
    )
    
    tasks = supabase.table("tasks").select("*").eq(
        "organization_id", state["client_id"]
    ).gte(
        "completed_at", state["week_start"]
    ).lte(
        "completed_at", state["week_end"]
    ).execute()
    
    return {"tasks_data": tasks.data}

def generate_report(state: ReportState) -> dict:
    """
    Node 4: Generate markdown report with LLM
    """
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
    
    prompt = f"""
    Generate a professional weekly report in Portuguese (BR):
    
    TIME WORKED:
    {state['time_data']}
    
    BUSINESS METRICS:
    {state['metrics_data']}
    
    TASKS COMPLETED:
    {state['tasks_data']}
    
    FORMAT (markdown):
    # Relatório Semanal - [Cliente]
    
    ## 📊 Resumo Executivo
    (2-3 sentenças sobre a semana)
    
    ## ✅ Trabalho Realizado
    - Task 1
    - Task 2
    (bullets com tarefas completas)
    
    ## 📈 Resultados de Negócio
    - Métrica 1: X (+Y%)
    - Métrica 2: Z
    (métricas com variação percentual)
    
    ## 🎯 Próxima Semana
    1. Prioridade 1
    2. Prioridade 2
    3. Prioridade 3
    
    ## 💡 Insights
    - Insight importante observado
    """
    
    result = llm.invoke(prompt)
    report_markdown = result.content
    
    return {"report_markdown": report_markdown}

# Build LangGraph workflow
workflow = StateGraph(ReportState)

# Add nodes
workflow.add_node("gather_time", gather_time_data)
workflow.add_node("gather_metrics", gather_metrics)
workflow.add_node("gather_tasks", gather_tasks)
workflow.add_node("generate_report", generate_report)

# Define edges (workflow flow)
workflow.set_entry_point("gather_time")
workflow.add_edge("gather_time", "gather_metrics")
workflow.add_edge("gather_metrics", "gather_tasks")
workflow.add_edge("gather_tasks", "generate_report")
workflow.add_edge("generate_report", END)

# Compile graph
report_generator = workflow.compile()
```

### 6.3 Business Calculator (LangGraph)

```python
# apps/api/graphs/business_calculator.py

from langgraph.graph import StateGraph, END
from typing import TypedDict
from langchain_openai import ChatOpenAI

class CalculatorState(TypedDict):
    """State for Business Calculator workflow"""
    client_id: str
    period_days: int
    investment: float
    revenue_data: dict
    roi: float
    roi_percentage: str
    health_score: int
    churn_risk: int

def get_investment(state: CalculatorState) -> dict:
    """Node 1: Get client investment"""
    from supabase import create_client
    
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY")
    )
    
    client = supabase.table("organizations").select("monthly_fee").eq(
        "id", state["client_id"]
    ).single().execute()
    
    investment = float(client.data["monthly_fee"])
    
    return {"investment": investment}

def get_revenue(state: CalculatorState) -> dict:
    """Node 2: Get revenue from Google Sheets"""
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    
    # Similar to gather_metrics but focused on revenue
    # ...
    
    revenue_data = {
        "current": 45320.00,
        "previous": 40500.00,
        "increase": 4820.00
    }
    
    return {"revenue_data": revenue_data}

def calculate_roi(state: CalculatorState) -> dict:
    """Node 3: Calculate ROI"""
    revenue_increase = state["revenue_data"]["increase"]
    investment = state["investment"]
    
    roi = (revenue_increase - investment) / investment
    roi_percentage = f"{roi * 100:.1f}%"
    
    return {
        "roi": roi,
        "roi_percentage": roi_percentage
    }

def calculate_health(state: CalculatorState) -> dict:
    """Node 4: Calculate health score with LLM"""
    llm = ChatOpenAI(model="gpt-4o-mini")
    
    prompt = f"""
    Calculate health score (0-100) for client:
    
    DATA:
    - ROI: {state['roi']}
    - Investment: {state['investment']}
    - Revenue increase: {state['revenue_data']['increase']}
    
    FACTORS (weight):
    1. Engagement (30%): Login frequency, task completion
    2. Satisfaction (30%): Feedback, response time
    3. Results (40%): ROI, revenue growth
    
    Return JSON:
    {{
      "health_score": 85,
      "churn_risk": 5,
      "classification": "Excellent"
    }}
    """
    
    result = llm.invoke(prompt)
    # Parse JSON from result
    data = json.loads(result.content)
    
    return {
        "health_score": data["health_score"],
        "churn_risk": data["churn_risk"]
    }

# Build graph
calc_workflow = StateGraph(CalculatorState)
calc_workflow.add_node("get_investment", get_investment)
calc_workflow.add_node("get_revenue", get_revenue)
calc_workflow.add_node("calculate_roi", calculate_roi)
calc_workflow.add_node("calculate_health", calculate_health)

calc_workflow.set_entry_point("get_investment")
calc_workflow.add_edge("get_investment", "get_revenue")
calc_workflow.add_edge("get_revenue", "calculate_roi")
calc_workflow.add_edge("calculate_roi", "calculate_health")
calc_workflow.add_edge("calculate_health", END)

calculator_graph = calc_workflow.compile()
```

### 6.4 API Endpoints

```python
# apps/api/routes/ai.py

from fastapi import APIRouter, HTTPException
from graphs.report_generator import report_generator
from graphs.business_calculator import calculator_graph
from pydantic import BaseModel

router = APIRouter()

class ReportRequest(BaseModel):
    client_id: str
    week_start: str  # ISO format: 2024-12-10
    week_end: str

class CalculatorRequest(BaseModel):
    client_id: str
    period_days: int = 30

@router.post("/ai/generate-report")
async def generate_report(request: ReportRequest):
    """
    Execute Report Generator workflow
    
    Returns:
        {
          "success": true,
          "report_markdown": "# Relatório...",
          "execution_time": 12.5
        }
    """
    try:
        import time
        start = time.time()
        
        result = await report_generator.ainvoke({
            "client_id": request.client_id,
            "week_start": request.week_start,
            "week_end": request.week_end
        })
        
        execution_time = time.time() - start
        
        return {
            "success": True,
            "report_markdown": result["report_markdown"],
            "execution_time": execution_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/calculate-metrics")
async def calculate_metrics(request: CalculatorRequest):
    """
    Execute Business Calculator workflow
    
    Returns:
        {
          "success": true,
          "roi": 2.54,
          "roi_percentage": "254%",
          "health_score": 85,
          "churn_risk": 5
        }
    """
    try:
        result = await calculator_graph.ainvoke({
            "client_id": request.client_id,
            "period_days": request.period_days
        })
        
        return {
            "success": True,
            "roi": result["roi"],
            "roi_percentage": result["roi_percentage"],
            "health_score": result["health_score"],
            "churn_risk": result["churn_risk"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 7. ROADMAP MVP

### 7.1 Timeline: 3 Semanas (120h total)

```
Week 1: FOUNDATION        Week 2: AI LAYER         Week 3: DASHBOARDS
  ├─ Auth                   ├─ LangGraph setup       ├─ Admin UI
  ├─ Database               ├─ Report Generator      ├─ Client UI
  ├─ Routing                ├─ Business Calculator   ├─ Integration
  └─ Layouts                └─ API endpoints         └─ Deploy
```

### 7.2 Week 1: Foundation (40h)

**Goal:** Auth + Role-based routing + Database working

```yaml
Day 1: Supabase Setup (8h)
  ✅ Create Supabase project
  ✅ Design database schema
  ✅ Create tables (organizations, users, projects, tasks, reports)
  ✅ Setup RLS policies
  ✅ Test auth flow

Day 2: Next.js Setup (8h)
  ✅ Create Next.js 14 app
  ✅ Setup TypeScript strict mode
  ✅ Install Tailwind + shadcn/ui
  ✅ Setup Supabase client
  ✅ Test API routes

Day 3: Role-Based Routing (8h)
  ✅ Create middleware.ts
  ✅ Setup route groups: (auth), (kyrie), (client)
  ✅ Create layouts for each role
  ✅ Test role redirects

Day 4: Auth Flow (8h)
  ✅ Login page
  ✅ Logout functionality
  ✅ Protected routes
  ✅ Session management

Day 5: Basic CRUD (8h)
  ✅ Organizations CRUD
  ✅ Projects CRUD
  ✅ Tasks CRUD
  ✅ API routes tested

Deliverable: Login working, role routing working, database ready
```

### 7.3 Week 2: AI Layer (40h)

**Goal:** LangGraph agents working + APIs ready

```yaml
Day 1: FastAPI Setup (8h)
  ✅ Create FastAPI app
  ✅ Setup Python environment
  ✅ Install LangGraph + LangChain
  ✅ Setup CORS
  ✅ Test basic endpoints

Day 2-3: Report Generator (16h)
  ✅ Define ReportState TypedDict
  ✅ Create gather_time_data node (Clockify API)
  ✅ Create gather_metrics node (Sheets API)
  ✅ Create gather_tasks node (Supabase)
  ✅ Create generate_report node (GPT-4o-mini)
  ✅ Build LangGraph workflow
  ✅ Test with mock data
  ✅ Create API endpoint
  ✅ Integration tests

Day 4: Business Calculator (8h)
  ✅ Define CalculatorState
  ✅ Create calculation nodes
  ✅ Build graph
  ✅ API endpoint
  ✅ Tests

Day 5: Integration (8h)
  ✅ Connect FastAPI with Next.js
  ✅ Test report generation end-to-end
  ✅ Save reports to database
  ✅ Error handling

Deliverable: AI agents working, reports generating in <15s
```

### 7.4 Week 3: Dashboards (40h)

**Goal:** Admin and Client UIs complete

```yaml
Day 1-2: Admin Dashboard (16h)
  ✅ Kyrie dashboard page
  ✅ Client health cards
  ✅ Sprint overview widget
  ✅ AI insights panel
  ✅ Fetch data from Supabase
  ✅ Real-time updates
  ✅ Styling with Tailwind

Day 3-4: Client Portal (16h)
  ✅ Client dashboard page
  ✅ Business metrics widget
  ✅ Projects progress
  ✅ Reports archive
  ✅ ROI tracker
  ✅ Data isolation (RLS)
  ✅ Mobile responsive

Day 5: Deploy + Testing (8h)
  ✅ Deploy Frontend to Vercel
  ✅ Deploy Backend to Render
  ✅ Setup environment variables
  ✅ End-to-end testing
  ✅ Onboard 4 test clients

Deliverable: MVP live in production, 4 clients using
```

---

## 8. SUCCESS METRICS

### 8.1 Métricas de Sucesso (30 dias)

```yaml
UNIFICAÇÃO (Ferramentas eliminadas):
  Metric: Número de ferramentas em uso
  Current: 10+ (Trello, Clockify, Sheets, etc)
  Target: 1 (apenas Kyrie OS)
  Success: ✅ 90% das tarefas no Kyrie OS

EFICIÊNCIA (Gilmar):
  Metric: Tempo em relatórios
  Current: 4h/semana
  Target: 30min/semana
  Success: ✅ Redução de 87.5%

  Metric: Context switching
  Current: 10+ trocas de ferramenta/dia
  Target: 2 trocas/dia
  Success: ✅ Redução de 80%

  Metric: Interrupções de clientes
  Current: 20/semana ("cadê o trabalho?")
  Target: 5/semana
  Success: ✅ Redução de 75%

INTELIGÊNCIA (IA working):
  Metric: Relatórios gerados por IA
  Target: 100% (4 clientes × 4 semanas = 16 relatórios)
  Success: ✅ Zero relatório manual

  Metric: ROI calculado automaticamente
  Target: Atualizado diariamente
  Success: ✅ Clientes veem ROI em tempo real

  Metric: Health score accuracy
  Target: 85% de acurácia
  Success: ✅ Prediz churn corretamente

SATISFAÇÃO (Clientes):
  Metric: Clientes usando 3x/semana
  Target: 100% (4 de 4)
  Success: ✅ Todos os clientes ativos

  Metric: "Cadê o trabalho?" messages
  Current: 5/semana por cliente
  Target: 0
  Success: ✅ Zero perguntas sobre status

  Metric: NPS
  Current: N/A
  Target: 9/10
  Success: ✅ Survey após 30 dias

TÉCNICO:
  Metric: Uptime
  Target: >99%
  Success: ✅ Zero downtime crítico

  Metric: Page load
  Target: <2s
  Success: ✅ Dashboard load <2s

  Metric: AI response time
  Target: Report em <15s
  Success: ✅ Click → report ready
```

### 8.2 ROI do MVP

```yaml
CUSTOS MENSAIS: $18/mês
  - Supabase: $0 (free tier)
  - Vercel: $0 (hobby)
  - Render: $7 (starter)
  - OpenAI API: ~$10 (GPT-4o-mini)
  - Domain: $1

TEMPO ECONOMIZADO:
  Relatórios: 4h/semana → 16h/mês
  Coordenação: 2h/semana → 8h/mês
  Total: 24h/mês economizadas

VALOR DO TEMPO:
  24h × $50/hora = $1.200/mês

ROI MENSAL:
  Ganho: $1.200
  Custo: $18
  Lucro líquido: $1.182/mês
  ROI: 6.567%
  Payback: <1 mês
```

---

## 9. OUT OF SCOPE (MVP)

**O que NÃO entra no MVP:**
- ❌ Tutorial system completo (apenas básico)
- ❌ Approval workflow avançado (sem canvas)
- ❌ Mobile app nativo (apenas responsive web)
- ❌ Chat em tempo real (apenas mensagens assíncronas)
- ❌ Notifications push (apenas email)
- ❌ API pública
- ❌ White-label
- ❌ Multiple team members (apenas Gilmar)
- ❌ Advanced analytics (apenas métricas core)

**O que ENTRA no MVP:**
- ✅ **Unified task manager** (mata Trello)
- ✅ **Time tracking integrado** (mata Clockify)
- ✅ **Report Generator AI** (LangGraph)
- ✅ **Business Calculator AI** (LangGraph)
- ✅ **Client portal** (transparência total)
- ✅ **ROI tracking** (prova de valor)
- ✅ **Health scoring** (previne churn)

**Integrações Diretas (Sem MCP):**
- Clockify API (HTTP requests)
- Google Sheets API (Google SDK)
- Supabase API (Supabase SDK)

**Por quê este scope?**

MVP foca em **2 pilares principais:**

1. **UNIFICAÇÃO:** Substituir ferramentas fragmentadas
   - Menos context switching
   - Tudo em um lugar
   - Economia de tempo massiva

2. **INTELIGÊNCIA:** IA gera valor automaticamente (LangGraph)
   - Relatórios automáticos
   - ROI calculado
   - Insights acionáveis
   - Prevenção de churn

Resto vem em versões futuras após validação.

---

## 10. RISKS & MITIGATION

```yaml
RISK 1: APIs externas falham
  Probability: Medium
  Impact: High
  Mitigation:
    - Error handling em todos os nodes
    - Retry logic com exponential backoff
    - Fallback para dados cached
    - Alertas automáticos

RISK 2: LLM responses inconsistentes
  Probability: Medium
  Impact: Medium
  Mitigation:
    - Temperature=0.3 (mais determinístico)
    - Structured output com Pydantic
    - Validation de outputs
    - Human review para primeiros 10 reports

RISK 3: Supabase RLS mal configurado
  Probability: Low
  Impact: Critical
  Mitigation:
    - Testes de segurança exhaustivos
    - Audit de todas as policies
    - Row-level testing por role

RISK 4: Performance com múltiplos clients
  Probability: Low (só 4 clientes no MVP)
  Impact: Medium
  Mitigation:
    - Async execution com LangGraph
    - Database indexing
    - Caching quando aplicável
```

---

## 11. NEXT STEPS

### 11.1 Imediato (Esta semana)

```bash
# 1. Setup repositório
mkdir kyrie-os && cd kyrie-os
git init

# 2. Criar estrutura
mkdir -p .docs
mkdir -p apps/web
mkdir -p apps/api

# 3. Copiar PRD
# Colar este documento em .docs/PRD.md

# 4. Setup Supabase
# Criar novo projeto no Supabase dashboard

# 5. Iniciar desenvolvimento
# Seguir Week 1 do roadmap
```

### 11.2 Ferramentas Necessárias

```yaml
Desenvolvimento:
  - Node.js v22 LTS (instalado ✅)
  - Python 3.11+
  - Git
  - VS Code / Antigravity IDE
  - PostgreSQL (via Supabase)

Contas/APIs:
  - Supabase account (free tier)
  - Vercel account (hobby tier)
  - Render account (free tier)
  - OpenAI API key (pay-as-you-go)
  - Clockify API key
  - Google Cloud Console (Sheets API)
```

---

## 12. CONCLUSÃO

### 12.1 O Que Você Tem Agora

✅ **PRD completo e focado** para MVP do Kyrie OS
✅ **Posicionamento claro**: Operating System (não "mais um PM tool")
✅ **Escopo definido**: 3 semanas
✅ **Stack justificada**: Next.js + FastAPI + Supabase + LangGraph
✅ **2 AI Agents (LangGraph)**: Report Generator + Business Calculator
✅ **Roadmap executável**: semana a semana
✅ **Success metrics**: claros e mensuráveis

### 12.2 Diferencial vs. Concorrentes

```yaml
Trello/Jira:
  ❌ Só gestão de tarefas
  ❌ Zero inteligência
  ❌ Sem relatórios
  ❌ Sem portal do cliente

ClickUp/Monday:
  ❌ Genéricos (não focados em consultoria)
  ❌ IA básica (se houver)
  ❌ Ferramentas separadas para tudo
  ❌ Clientes não veem nada

Notion:
  ❌ Tudo manual
  ❌ Zero automação
  ❌ Sem IA real
  ❌ Não é sistema, é wiki

Kyrie OS:
  ✅ Sistema unificado (1 tool mata 10)
  ✅ IA embarcada com LangGraph (workflows determinísticos)
  ✅ Portal do cliente (transparência)
  ✅ Foco 100% em consultoria de performance
  ✅ ROI calculado automaticamente
  ✅ Previne churn com inteligência
```

### 12.3 Por Que Vai Funcionar

**1. Problema Real Validado**
- Você vive isso diariamente
- 10+ ferramentas = caos
- 4h/semana em relatórios = desperdício

**2. Solução Única**
- Não existe nada assim no mercado
- Unificação + IA (LangGraph) + Foco = diferencial brutal

**3. Tech Stack Moderna**
- Next.js + FastAPI = rápido de desenvolver
- LangGraph = IA determinística e debugável
- Supabase = infraestrutura sólida

**4. Validação Imediata**
- 4 clientes prontos para usar
- Valor mensurável (economiza 4h/semana)
- ROI claro (elimina ferramentas pagas)

**5. Timing Perfeito**
- IA está no auge
- Consultores precisam disso
- Mercado desorganizado

### 12.4 Próxima Ação

```
🎯 SETUP ANTIGRAVITY AGORA!

1. Criar pasta kyrie-os/
2. Criar .docs/ e colar este PRD
3. Criar .cursorrules
4. Abrir Antigravity
5. Primeiro prompt: "Analise o PRD..."
6. LET'S BUILD! 🚀

💜 VIBE CODING ACTIVATED!
```

---

**Kyrie OS - Operating System para Consultorias de Performance.**

*"A melhor ferramenta é aquela que você não precisa trocar."*

**LET'S BUILD THIS EMPIRE! 🚀💜**
