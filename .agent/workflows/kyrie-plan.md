---
name: kyrie-plan-mvp
command: /kyrie-plan
description: Create comprehensive implementation plan for Kyrie OS MVP
---

# Kyrie MVP Planning Workflow

## Usage
```
/kyrie-plan
```

Generates a complete 3-week MVP implementation plan for Kyrie OS.

## Process

### Step 1: Load Context
```yaml
Load Files:
  - .docs/PRD.md (complete requirements)
  
Load Skills:
  - kyrie-architecture (system context)
  - kyrie-role-routing (architecture pattern)
  - kyrie-langgraph-apis (AI patterns)
```

### Step 2: Confirm Understanding (Socratic Gate)

Ask user to confirm:
```
1. Do you want the full 3-week MVP plan from the PRD?
2. Or a specific milestone (Week 1, 2, 3, or 4)?
3. Should I include:
   ✅ Database migrations
   ✅ API endpoints
   ✅ Frontend components
   ✅ AI agents (LangGraph)
```

### Step 3: Generate Plan Structure

Create 4 documents:

#### A. IMPLEMENTATION_PLAN.md
```markdown
# Kyrie OS MVP - Implementation Plan

## Timeline: 3 Weeks (120h total)

### Week 1: Foundation (40h)
**Goal:** Authentication + role-based routing + database

**Deliverables:**
- [ ] Supabase project setup
- [ ] Database schema + migrations
- [ ] Next.js 14 app with route groups
- [ ] Middleware role-based routing
- [ ] Login flow working
- [ ] Admin and Client layouts

**Success Criteria:**
- User can login
- Redirected based on role
- Layouts render correctly

### Week 2: AI Agents (40h)
**Goal:** LangGraph agents + MCP integration

**Deliverables:**
- [ ] FastAPI backend setup
- [ ] MCP tool wrappers (Clockify, Sheets, Supabase)
- [ ] Report Generator Graph
- [ ] Business Calculator Graph
- [ ] API endpoints for AI
- [ ] Integration tests

**Success Criteria:**
- Report generates in <15s
- ROI calculates correctly
- MCP tools work

### Week 3: Admin Dashboard (40h)
**Goal:** Kyrie admin view complete

**Deliverables:**
- [ ] Dashboard page (sprint overview)
- [ ] Client health cards
- [ ] AI insights panel
- [ ] Intelligent backlog
- [ ] Sprint planning interface
- [ ] Real-time updates (Supabase)

**Success Criteria:**
- All clients visible
- Health scores display
- Backlog auto-prioritizes

### Week 4: Client Portal (40h)
**Goal:** Client-facing portal complete

**Deliverables:**
- [ ] Client dashboard (metrics)
- [ ] Project progress tracking
- [ ] Reports archive
- [ ] ROI tracker
- [ ] Approval queue (basic)
- [ ] Mobile responsive

**Success Criteria:**
- Client sees their data only
- ROI displays correctly
- Reports accessible
```

#### B. USER_STORIES.md
```markdown
# User Stories - Week 1

## Story 1: Authentication
**As a** user
**I want to** log in with email/password
**So that** I can access my dashboard

**Acceptance Criteria:**
- [ ] Login page exists
- [ ] Email/password validation
- [ ] Success redirects to dashboard
- [ ] Error shows message

**Technical:**
- Supabase Auth
- Next.js login page
- Middleware redirect

---

## Story 2: Role-Based Routing
**As an** admin
**I want to** see admin dashboard
**So that** I can manage all clients

**Acceptance Criteria:**
- [ ] Admin redirects to /kyrie/dashboard
- [ ] Client redirects to /client/dashboard
- [ ] Cannot access wrong routes

**Technical:**
- middleware.ts
- Route groups (kyrie) and (client)
- Role checking
```

#### C. API_SPEC.md
```markdown
# API Specification

## POST /api/ai/generate-report

**Request:**
```json
{
  "client_id": "adega-anitas",
  "week_start": "2024-12-10",
  "week_end": "2024-12-16"
}
```

**Response:**
```json
{
  "success": true,
  "report_markdown": "# Weekly Report...",
  "execution_time": 12.5,
  "time_spent": {
    "total_hours": 16,
    "by_project": {...}
  }
}
```

**Implementation:**
- LangGraph: report_generator.py
- Nodes: gather_time, gather_metrics, generate_report
- MCP Tools: Clockify, Sheets
```

#### D. DATABASE_MIGRATIONS.md
```markdown
# Database Migrations

## Migration 001: Initial Schema

```sql
-- Organizations
CREATE TABLE organizations (...);

-- Users
CREATE TABLE users (...);

-- Projects
CREATE TABLE projects (...);

-- Tasks
CREATE TABLE tasks (...);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
...
```

**Apply:**
```bash
supabase migration new initial_schema
supabase db push
```
```

### Step 4: Assign Agents to Tasks

```yaml
Week 1 Tasks:
  - Database schema → @database-architect
  - Next.js setup → @frontend-specialist
  - Middleware → Use kyrie-role-routing skill
  - Layouts → @kyrie-admin-specialist, @kyrie-client-specialist

Week 2 Tasks:
  - FastAPI setup → @backend-specialist
  - LangGraph agents → @kyrie-ai-specialist
  - MCP tools → @kyrie-ai-specialist (use kyrie-langgraph-mcp skill)

Week 3 Tasks:
  - Admin dashboard → @kyrie-admin-specialist
  - Components → @frontend-specialist
  - Real-time → @database-architect

Week 4 Tasks:
  - Client portal → @kyrie-client-specialist
  - Components → @frontend-specialist
  - Testing → @test-engineer
```

### Step 5: Create Checklist

```markdown
# MVP Checklist

## Week 1: Foundation
- [ ] Supabase project created
- [ ] .env variables set
- [ ] Database schema applied
- [ ] Next.js app initialized
- [ ] Login page working
- [ ] Middleware routing working
- [ ] Layouts rendering

## Week 2: AI Layer
- [ ] FastAPI running locally
- [ ] MCP servers configured
- [ ] Report Generator tested
- [ ] Business Calculator tested
- [ ] API endpoints responding

## Week 3: Admin Dashboard
- [ ] Dashboard page live
- [ ] Health cards showing data
- [ ] AI insights displaying
- [ ] Backlog loads tasks
- [ ] Sprint planning works

## Week 4: Client Portal
- [ ] Client dashboard live
- [ ] Metrics displaying
- [ ] ROI tracker working
- [ ] Reports archive accessible
- [ ] Mobile responsive
- [ ] Deploy to production
```

## Output Format

Present plan as:
1. **Executive Summary** (2-3 sentences)
2. **Timeline** (visual representation)
3. **Milestones** (4 weeks with goals)
4. **Next Action** (what to do NOW)

Example:
```
📋 Kyrie OS MVP - 3 Week Plan Generated

🎯 GOAL: Build Operating System for Performance Consultancies
⏱️ TIMELINE: 3 weeks (120h total)
🚀 DELIVERABLES: Admin dashboard + Client portal + AI agents

WEEK 1: Foundation (auth + routing + database)
WEEK 2: AI Layer (LangGraph + MCP)
WEEK 3: Admin Dashboard
WEEK 4: Client Portal

✅ NEXT ACTION:
Run: /kyrie "Setup Supabase database schema"
This will create the initial database with all tables.

Full plan saved to:
- .docs/IMPLEMENTATION_PLAN.md
- .docs/USER_STORIES.md
- .docs/API_SPEC.md
- .docs/DATABASE_MIGRATIONS.md
```

## Success Criteria

Plan should:
- ✅ Be actionable (clear next steps)
- ✅ Be realistic (3 weeks, 120h)
- ✅ Be complete (all MVP features)
- ✅ Use specialist agents correctly
- ✅ Reference skills appropriately
