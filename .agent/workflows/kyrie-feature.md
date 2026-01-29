---
name: kyrie-feature
command: /kyrie
description: Create a feature for Kyrie OS with automatic agent selection
---

# Kyrie Feature Workflow

## Usage
```
/kyrie "Admin Dashboard - Sprint Planning"
/kyrie "Report Generator AI Agent"
/kyrie "Client Portal - Business Metrics"
```

Creates a complete feature with correct agent and skills.

## Process

### Step 1: Feature Type Detection

Analyze the request and categorize:

```yaml
AI/Agent Keywords:
  Triggers: "agent", "AI", "report", "generator", "calculator", "insights", "automation", "LangGraph", "MCP"
  → Route to: @kyrie-ai-specialist
  → Load skills: kyrie-langgraph-mcp, kyrie-architecture

Admin Keywords:
  Triggers: "admin", "dashboard", "sprint", "backlog", "clients overview", "planning", "kyrie dashboard", "all clients", "time tracking"
  → Route to: @kyrie-admin-specialist
  → Load skills: kyrie-role-routing, kyrie-architecture

Client Portal Keywords:
  Triggers: "client", "portal", "metrics", "ROI", "approval", "tutorial", "reports archive", "projects view", "business results"
  → Route to: @kyrie-client-specialist
  → Load skills: kyrie-role-routing, kyrie-architecture

Generic Keywords:
  Triggers: "setup", "database", "deploy", "test", "fix bug"
  → Route based on domain (backend, frontend, database)
```

### Step 2: Clarifying Questions (if needed)

If ambiguous, ask:
```
I detected this might be an [AI/Admin/Client] feature.

Before I start, I need to know:
1. Which role is this for? (KYRIE_ADMIN or CLIENT_OWNER)
2. What data should it display/process?
3. Any specific interactions? (click, drag, real-time)
4. Should it integrate with AI agents?

Please clarify and I'll implement it perfectly.
```

### Step 3: Load Appropriate Skills

#### For AI Features:
```yaml
Primary Skills (MUST load):
  - kyrie-langgraph-apis (custom) - LangGraph patterns
  - kyrie-architecture (custom) - System context

Supporting Skills:
  - api-patterns (standard) - API design
  - testing-patterns (standard) - Unit tests
```

#### For Admin Features:
```yaml
Primary Skills (MUST load):
  - kyrie-role-routing (custom) - Role routing
  - kyrie-architecture (custom) - System context

Supporting Skills:
  - nextjs-react-expert (standard) - Next.js patterns
  - frontend-design (standard) - UI/UX
  - tailwind-patterns (standard) - Styling
```

#### For Client Features:
```yaml
Primary Skills (MUST load):
  - kyrie-role-routing (custom) - Role routing
  - kyrie-architecture (custom) - System context

Supporting Skills:
  - nextjs-react-expert (standard) - Next.js patterns
  - frontend-design (standard) - UI/UX
```

### Step 4: Agent Selection & Delegation

```yaml
AI Feature:
  Primary: @kyrie-ai-specialist
  Delegate to:
    - @backend-specialist (for FastAPI routes)
    - @test-engineer (for testing)

Admin Feature:
  Primary: @kyrie-admin-specialist
  Delegate to:
    - @frontend-specialist (for React implementation)
    - @database-architect (for queries)

Client Feature:
  Primary: @kyrie-client-specialist
  Delegate to:
    - @frontend-specialist (for React implementation)
    - @database-architect (for RLS policies)
```

### Step 5: Implementation Checklist

Execute based on feature type:

#### For AI Agent Feature:
```markdown
1. [ ] Define State (TypedDict)
2. [ ] Create MCP tool wrappers (if needed)
3. [ ] Implement nodes
4. [ ] Build LangGraph
5. [ ] Create FastAPI endpoint
6. [ ] Add tests
7. [ ] Update API docs
```

#### For Admin UI Feature:
```markdown
1. [ ] Define component hierarchy
2. [ ] Create route in app/(kyrie)/
3. [ ] Implement Server Component (data fetching)
4. [ ] Implement Client Component (interactivity)
5. [ ] Add to navigation
6. [ ] Style with Tailwind
7. [ ] Test role routing
8. [ ] Mobile responsive check
```

#### For Client UI Feature:
```markdown
1. [ ] Define component hierarchy
2. [ ] Create route in app/(client)/
3. [ ] Implement Server Component (data fetching with RLS)
4. [ ] Implement Client Component (interactivity)
5. [ ] Add to navigation
6. [ ] Style with Tailwind
7. [ ] Test role routing + data isolation
8. [ ] Mobile responsive check
```

### Step 6: Validation

Before completing, verify:

```yaml
All Features:
  - [ ] TypeScript strict mode (no 'any')
  - [ ] Error handling present
  - [ ] Loading states handled
  - [ ] Tests written

AI Features:
  - [ ] Graph compiles without errors
  - [ ] Nodes are pure functions
  - [ ] MCP tools wrapped in BaseTool
  - [ ] Async execution (ainvoke)

UI Features:
  - [ ] Role routing works correctly
  - [ ] No cross-role data leakage
  - [ ] Proper route group used
  - [ ] Components in correct folder
```

## Example Conversations

### Example 1: AI Feature
```
User: /kyrie "Report Generator AI Agent"

Agent: 🤖 Detected: AI Feature
Loading specialist: @kyrie-ai-specialist
Loading skills: kyrie-langgraph-apis, kyrie-architecture

Creating Report Generator with LangGraph...

✅ Files created:
- apps/api/graphs/report_generator.py
- apps/api/integrations/clockify.py
- apps/api/integrations/google_sheets.py
- apps/api/routes/ai.py
- tests/test_report_generator.py

✅ Features:
- StateGraph with 3 nodes
- Direct API integration (Clockify + Sheets)
- GPT-4o-mini for synthesis
- FastAPI endpoint: POST /api/ai/generate-report

📝 Next: Test with: 
curl -X POST http://localhost:8000/api/ai/generate-report \
  -d '{"client_id":"test","week_start":"2024-01-01","week_end":"2024-01-07"}'
```

### Example 2: Admin Feature
```
User: /kyrie "Admin Dashboard - Client Health Cards"

Agent: 🏠 Detected: Admin Feature
Loading specialist: @kyrie-admin-specialist
Loading skills: kyrie-role-routing, kyrie-architecture

Creating Client Health Cards for admin dashboard...

✅ Files created:
- app/(kyrie)/dashboard/page.tsx
- components/kyrie/dashboard/client-health-cards.tsx
- components/kyrie/dashboard/health-score-badge.tsx

✅ Features:
- Server Component (data fetch from Supabase)
- Real-time updates
- Color-coded health scores (green/yellow/red)
- Click to expand details
- Mobile responsive

📝 Next: Visit http://localhost:3000/kyrie/dashboard
```

### Example 3: Client Feature
```
User: /kyrie "Client Portal - ROI Tracker"

Agent: 🏢 Detected: Client Feature
Loading specialist: @kyrie-client-specialist
Loading skills: kyrie-role-routing, kyrie-architecture

Creating ROI Tracker for client portal...

✅ Files created:
- app/(client)/dashboard/page.tsx (updated)
- components/client/dashboard/roi-tracker.tsx
- components/client/dashboard/roi-chart.tsx

✅ Features:
- Real-time ROI calculation
- Visual chart (Recharts)
- Investment vs Return breakdown
- Payback period display
- RLS enforced (client sees own data only)

📝 Next: Visit http://localhost:3000/client/dashboard
```

## Error Handling

If feature request is unclear:
```
⚠️ I need more information to implement this feature.

Your request: "[ambiguous text]"

Please specify:
1. Is this for Admin (Gilmar) or Client (business owner)?
2. What data should be displayed?
3. Any specific interactions?

Example clear requests:
✅ "Admin dashboard showing all clients with health scores"
✅ "Client portal page for viewing project progress"
✅ "AI agent that calculates ROI from Sheets data"
```

## Success Criteria

Feature implementation should:
- ✅ Route to correct specialist agent
- ✅ Load appropriate skills
- ✅ Create files in correct locations
- ✅ Follow role-based routing patterns
- ✅ Include tests
- ✅ Be production-ready

## Output Format

Always show:
1. **Detection** (what type detected)
2. **Agent & Skills** (who's working + what knowledge loaded)
3. **Files Created** (complete file paths)
4. **Features** (bullet points of what it does)
5. **Next Action** (how to test/use)
