---
name: kyrie-architecture
description: Core architecture and context for Kyrie OS MVP
tags: [architecture, kyrie, context, database, api]
version: 1.0.0
---

# Kyrie OS Architecture

## Overview
Kyrie OS is an **Operating System for Performance Consultancies** that:
- Replaces 10+ fragmented tools (Trello, Clockify, Sheets, WhatsApp, etc)
- Provides AI-powered automation (reports, insights, ROI calculations)
- Delivers client transparency through real-time dashboards

## Tech Stack

```yaml
Frontend:
  Framework: Next.js 14 (App Router)
  Language: TypeScript (strict mode)
  Styling: Tailwind CSS + shadcn/ui
  State: React Context + SWR
  Auth: Supabase Auth

Backend:
  Framework: FastAPI (Python 3.11+)
  Language: Python with type hints
  AI: LangGraph + LangChain
  LLM: OpenAI GPT-4o-mini

Database:
  Primary: Supabase (PostgreSQL)
  Auth: Supabase Auth
  Realtime: Supabase Realtime subscriptions

AI Layer:
  Orchestration: LangGraph (StateGraph)
  LLM: GPT-4o-mini via LangChain
  Tools: MCP servers (Clockify, Sheets, Supabase)

Deployment:
  Frontend: Vercel
  Backend: Render (Docker)
  Database: Supabase Cloud
```

## Database Schema

### Core Tables

```sql
-- Organizations (clients)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  monthly_fee DECIMAL(10,2),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  churn_risk INTEGER CHECK (churn_risk >= 0 AND churn_risk <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('KYRIE_ADMIN', 'KYRIE_TEAM', 'CLIENT_OWNER', 'CLIENT_VIEWER')),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'paused', 'completed')),
  progress INTEGER CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ice_score DECIMAL(5,2), -- Impact × Confidence × Effort
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Metrics (from Google Sheets)
CREATE TABLE business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  date DATE NOT NULL,
  revenue DECIMAL(10,2),
  new_customers INTEGER,
  conversion_rate DECIMAL(5,2),
  ads_spend DECIMAL(10,2),
  roi DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Generated Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  report_markdown TEXT NOT NULL,
  generated_by TEXT DEFAULT 'report_generator',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Health Scores (calculated by AI)
CREATE TABLE client_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  date DATE NOT NULL,
  health_score INTEGER NOT NULL,
  engagement_score INTEGER,
  satisfaction_score INTEGER,
  results_score INTEGER,
  churn_risk INTEGER,
  insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Entries (from Clockify)
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  user_id UUID NOT NULL REFERENCES users(id),
  description TEXT,
  hours DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/user
```

### Organizations (Clients)
```
GET    /api/organizations          # List all (admin only)
GET    /api/organizations/:id      # Get one
PUT    /api/organizations/:id      # Update
```

### Projects
```
GET    /api/projects?org_id=:id    # List by org
POST   /api/projects               # Create
PUT    /api/projects/:id           # Update
DELETE /api/projects/:id           # Delete
```

### Tasks
```
GET    /api/tasks?project_id=:id   # List by project
POST   /api/tasks                  # Create
PUT    /api/tasks/:id              # Update (including status)
DELETE /api/tasks/:id              # Delete
```

### Business Metrics
```
GET    /api/metrics?org_id=:id&date=:date  # Get metrics
POST   /api/metrics/sync                   # Sync from Sheets
```

### AI Endpoints
```
POST   /api/ai/generate-report
  Body: { client_id, week_start, week_end }
  Returns: { report_markdown, execution_time }

POST   /api/ai/calculate-roi
  Body: { client_id, period_days }
  Returns: { investment, revenue, roi, roi_percentage }

POST   /api/ai/health-score
  Body: { client_id }
  Returns: { health_score, classification, churn_risk, insights }
```

## Application Structure

```
kyrie-os/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   ├── (kyrie)/          # Admin routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── clients/
│   │   │   │   └── backlog/
│   │   │   ├── (client)/         # Client routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── projects/
│   │   │   │   └── reports/
│   │   │   └── middleware.ts
│   │   ├── components/
│   │   │   ├── kyrie/            # Admin components
│   │   │   └── client/           # Client components
│   │   └── lib/
│   │       ├── supabase/
│   │       └── utils/
│   │
│   └── api/                      # FastAPI backend
│       ├── main.py
│       ├── routes/
│       │   ├── auth.py
│       │   ├── organizations.py
│       │   ├── projects.py
│       │   └── ai.py
│       ├── graphs/               # LangGraph AI agents
│       │   ├── report_generator.py
│       │   └── business_calculator.py
│       ├── tools/                # MCP tool wrappers
│       │   └── mcp_tools.py
│       └── models/
│           └── schemas.py
│
└── .agent/                       # Antigravity Kit
    ├── agents/
    ├── skills/
    └── workflows/
```

## Data Flow

### Report Generation Flow
```
1. User clicks "Generate Report" in dashboard
   ↓
2. Frontend: POST /api/ai/generate-report
   ↓
3. Backend: Execute report_graph.ainvoke()
   ↓
4. LangGraph nodes:
   ├─ gather_time_data (Clockify MCP)
   ├─ gather_metrics (Sheets MCP)
   └─ generate_report (GPT-4o-mini)
   ↓
5. Save to database: reports table
   ↓
6. Return markdown to frontend
   ↓
7. Display in UI + download option
```

### Client Dashboard Data Flow
```
1. Client logs in → middleware checks role
   ↓
2. Redirect to /client/dashboard
   ↓
3. Server Component fetches:
   ├─ organization data (Supabase)
   ├─ projects with progress (Supabase)
   ├─ latest metrics (Supabase)
   └─ recent reports (Supabase)
   ↓
4. Render dashboard with data
   ↓
5. Real-time updates via Supabase subscriptions
```

## Key Differentiators

### vs. Traditional PM Tools (Trello, Jira)
- ❌ They: Task management only, no AI, no client portal
- ✅ Kyrie: Full business OS, AI automation, transparency

### vs. Generic Tools (ClickUp, Monday)
- ❌ They: One-size-fits-all, manual everything
- ✅ Kyrie: Built for consultancies, AI-first, auto-reports

### vs. DIY (Notion, Sheets)
- ❌ They: Manual, fragmented, no automation
- ✅ Kyrie: Unified, automated, intelligent

## Success Metrics

```yaml
Efficiency (Gilmar):
  Report time: 4h/week → 30min/week (87.5% reduction)
  Context switching: 10+ tools → 1 tool
  Interruptions: 20/week → 5/week

Intelligence (AI):
  Reports generated: 100% automated
  ROI calculated: Real-time
  Health scores: Daily updates

Satisfaction (Clients):
  Active usage: 80%+ (3x/week)
  "Where's the work?" messages: Zero
  NPS: 9/10 target
```

## Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Backend (.env)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...
OPENAI_API_KEY=sk-...

# MCP Servers
CLOCKIFY_API_KEY=...
CLOCKIFY_WORKSPACE_ID=...
GOOGLE_SHEETS_CREDENTIALS=...
```
