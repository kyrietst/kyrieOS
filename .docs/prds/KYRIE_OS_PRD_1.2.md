# 🚀 KYRIE OS - MVP PRD 1.2 [COMPLETED]

> **UPDATE (2026-01-30):** All core features (Database Schema, Client Portal,
> Admin Dashboard with Real Data, Report Persistence) have been verified as
> IMPLEMENTED.

## Product Requirements Document

**Versão:** MVP 1.2 (Conexão Total + Portal do Cliente)\
**Data:** 30 de Janeiro de 2026\
**Autor:** Gilmar (Kyrie Performance & Resultados)\
**Dependência:** PRD 1.1 (Concluído)\
**Status:** Completed (MVP 1.2 Delivered)

---

## 📋 ÍNDICE

1. [Contexto e Gap Analysis](#1-contexto-e-gap-analysis)
2. [Objetivos do PRD 1.2](#2-objetivos-do-prd-12)
3. [Migrations SQL Completas](#3-migrations-sql-completas)
4. [Portal do Cliente - Implementação](#4-portal-do-cliente---implementação)
5. [Admin Dashboard - Dados Reais](#5-admin-dashboard---dados-reais)
6. [Persistência de Relatórios](#6-persistência-de-relatórios)
7. [Roadmap de Execução](#7-roadmap-de-execução)
8. [Critérios de Sucesso](#8-critérios-de-sucesso)

---

## 1. CONTEXTO E GAP ANALYSIS

### 1.1 O Que Foi Concluído (PRD 1.1)

```yaml
✅ FASE 1 - CORAÇÃO (Dados):
  - Migration time_entries no Supabase
  - GlobalTimer.tsx funcional
  - client-table.tsx conectada ao banco real

✅ FASE 2 - CÉREBRO (IA):
  - FastAPI buscando time_entries reais
  - Google Gemini substituiu OpenAI
  - LangGraph com StateGraph real

⏳ FASE 3 - ENTREGA (Cliente):
  - Portal do Cliente incompleto
  - Dados mockados no Admin
  - Relatórios não persistem
```

### 1.2 Gap Analysis Detalhado

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTADO ATUAL vs. MVP COMPLETO                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  O que existe:                 │  O que falta:                  │
│  ─────────────────────────────────────────────────────────────  │
│  ✅ time_entries              │  ❌ tasks (completa)            │
│  ✅ organizations             │  ❌ reports                     │
│  ✅ profiles                  │  ❌ business_metrics            │
│  ✅ projects                  │  ❌ client_health               │
│                               │  ❌ activities                  │
│  ─────────────────────────────────────────────────────────────  │
│  ✅ /kyrie/dashboard (real)   │  ✅ Dados reais do Supabase     │
│  ✅ /kyrie/clients (real)     │  ⏳ ROI calculado               │
│  ✅ /kyrie/insights (mock)    │  ⏳ Health Score real           │
│  ─────────────────────────────────────────────────────────────  │
│  ✅ /client/dashboard (mock)  │  ⏳ Métricas reais              │
│  ✅ /client/projects          │  ✅ Página existe               │
│  ✅ /client/reports           │  ✅ Histórico existe            │
│  ✅ /client/tutorials         │  ✅ Página placeholder          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Impacto dos Gaps

| Gap                          | Impacto                             | Prioridade |
| ---------------------------- | ----------------------------------- | ---------- |
| Tabela `reports` não existe  | Relatórios gerados são perdidos     | 🔴 CRÍTICO |
| Tabela `tasks` incompleta    | Sem gestão de tarefas por projeto   | 🟡 ALTO    |
| Portal do Cliente incompleto | Cliente não vê valor, aumenta churn | 🔴 CRÍTICO |
| Admin com dados mockados     | Gilmar não tem visão real           | 🟡 ALTO    |
| ROI não calculado            | Não prova valor para o cliente      | 🟡 ALTO    |

---

## 2. OBJETIVOS DO PRD 1.2

> **UPDATE (2026-01-30):** All core features (Database Schema, Client Portal,
> Admin Dashboard with Real Data, Report Persistence) have been verified as
> IMPLEMENTED.

### 2.1 Objetivo Principal

**Transformar o Kyrie OS de um protótipo funcional (65%) em um MVP completo
(100%) com dados reais em todas as telas.**

### 2.2 Entregáveis Específicos

```yaml
ENTREGÁVEL 1: Database Completo
  - 5 novas tabelas com RLS
  - Seed data para 3 clientes reais
  - Triggers de automação

ENTREGÁVEL 2: Portal do Cliente Completo
  - /client/reports - Histórico de relatórios
  - /client/projects - Lista de projetos com progresso
  - /client/dashboard - Métricas reais

ENTREGÁVEL 3: Admin com Dados Reais
  - Dashboard buscando do Supabase
  - Activity Feed funcional
  - Health Scores calculados

ENTREGÁVEL 4: Persistência de Relatórios
  - Backend salva no Supabase após geração
  - Frontend exibe histórico
  - Download em Markdown
```

### 2.3 O Que NÃO Entra

```yaml
OUT OF SCOPE (Próximas versões):
  ❌ Sistema de Aprovações completo
  ❌ Tutoriais com tracking
  ❌ Chat em tempo real
  ❌ Business Calculator Agent (apenas estrutura)
  ❌ Notificações push
  ❌ Deploy em produção
```

---

## 3. MIGRATIONS SQL COMPLETAS

### 3.1 Visão Geral do Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                     KYRIE OS DATABASE SCHEMA                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │organizations │────▶│   projects   │────▶│    tasks     │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                    │                    │              │
│         │                    │                    ▼              │
│         │                    │           ┌──────────────┐       │
│         │                    └──────────▶│ time_entries │       │
│         │                                └──────────────┘       │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   profiles   │     │   reports    │     │  activities  │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                              │                                   │
│                              ▼                                   │
│                       ┌──────────────┐     ┌──────────────┐     │
│                       │business_     │     │client_health │     │
│                       │metrics       │     └──────────────┘     │
│                       └──────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Migration 002: Tasks Table (Completa)

**Arquivo:** `supabase/migrations/20260130_002_create_tasks.sql`

```sql
-- ============================================================
-- MIGRATION 002: TASKS TABLE
-- ============================================================

-- ENUMs para status e prioridade
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamentos
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Conteúdo
    title TEXT NOT NULL,
    description TEXT,
    
    -- Status e Prioridade
    status task_status DEFAULT 'backlog',
    priority task_priority DEFAULT 'medium',
    
    -- ICE Score (calculado)
    ice_impact INTEGER CHECK (ice_impact >= 1 AND ice_impact <= 10),
    ice_confidence INTEGER CHECK (ice_confidence >= 1 AND ice_confidence <= 10),
    ice_effort INTEGER CHECK (ice_effort >= 1 AND ice_effort <= 10),
    ice_score NUMERIC GENERATED ALWAYS AS (
        CASE 
            WHEN ice_impact IS NOT NULL AND ice_confidence IS NOT NULL AND ice_effort IS NOT NULL 
            THEN (ice_impact * ice_confidence)::numeric / NULLIF(ice_effort, 0)
            ELSE NULL 
        END
    ) STORED,
    
    -- Datas
    due_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Metadados
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_ice_score ON public.tasks(ice_score DESC NULLS LAST);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Função helper para verificar acesso à organização
CREATE OR REPLACE FUNCTION get_user_org_id(user_id UUID)
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Função helper para verificar se é admin
CREATE OR REPLACE FUNCTION is_kyrie_admin(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id 
        AND role IN ('KYRIE_ADMIN', 'KYRIE_TEAM')
    );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Políticas RLS para tasks
CREATE POLICY "Admins can view all tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (is_kyrie_admin(auth.uid()));

CREATE POLICY "Admins can manage all tasks"
ON public.tasks FOR ALL
TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

CREATE POLICY "Clients view own project tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE p.client_id = get_user_org_id(auth.uid())
    )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger para registrar quando task é concluída
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
        NEW.completed_at = NOW();
    END IF;
    IF NEW.status = 'in_progress' AND OLD.status NOT IN ('in_progress', 'review', 'done') THEN
        NEW.started_at = COALESCE(NEW.started_at, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_completion_tracker
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_task_completed_at();

COMMENT ON TABLE public.tasks IS 'Tarefas vinculadas a projetos com ICE score automático';
```

### 3.3 Migration 003: Reports Table

**Arquivo:** `supabase/migrations/20260130_003_create_reports.sql`

```sql
-- ============================================================
-- MIGRATION 003: REPORTS TABLE
-- ============================================================

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('draft', 'generated', 'sent', 'viewed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_type AS ENUM ('weekly', 'monthly', 'quarterly', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamento com organização
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Conteúdo
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    summary TEXT,
    
    -- Tipo e Status
    report_type report_type DEFAULT 'weekly',
    status report_status DEFAULT 'generated',
    
    -- Período do Relatório
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Métricas capturadas no momento da geração
    metrics_snapshot JSONB DEFAULT '{}'::jsonb,
    
    -- Metadados de geração
    generation_time_seconds NUMERIC,
    ai_model_used TEXT DEFAULT 'gemini-1.5-flash',
    tokens_used INTEGER,
    
    -- Visualização
    viewed_at TIMESTAMPTZ,
    viewed_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reports_organization_id ON public.reports(organization_id);
CREATE INDEX idx_reports_period ON public.reports(period_start, period_end);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_reports_status ON public.reports(status);

-- RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
TO authenticated
USING (is_kyrie_admin(auth.uid()));

CREATE POLICY "Admins can manage reports"
ON public.reports FOR ALL
TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

CREATE POLICY "Clients view own reports"
ON public.reports FOR SELECT
TO authenticated
USING (organization_id = get_user_org_id(auth.uid()));

CREATE TRIGGER reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE public.reports IS 'Relatórios gerados pela IA, vinculados a organizações';
```

### 3.4 Migration 004: Business Metrics Table

**Arquivo:** `supabase/migrations/20260130_004_create_business_metrics.sql`

```sql
-- ============================================================
-- MIGRATION 004: BUSINESS METRICS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.business_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamento
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Período (mês/ano)
    period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
    period_year INTEGER NOT NULL CHECK (period_year >= 2020),
    
    -- Métricas Financeiras
    revenue NUMERIC(12,2),
    ad_spend NUMERIC(12,2),
    consultancy_fee NUMERIC(12,2),
    
    -- Métricas de Aquisição
    new_customers INTEGER,
    total_customers INTEGER,
    leads_generated INTEGER,
    conversion_rate NUMERIC(5,2),
    
    -- ROI Calculado
    roi_multiplier NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN consultancy_fee > 0 AND revenue > 0 
            THEN (revenue - COALESCE(ad_spend, 0))::numeric / consultancy_fee
            ELSE NULL 
        END
    ) STORED,
    
    -- Métricas de Engajamento
    avg_ticket NUMERIC(10,2),
    returning_customers INTEGER,
    
    -- Fonte dos dados
    data_source TEXT DEFAULT 'manual',
    source_reference TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint única
    UNIQUE(organization_id, period_month, period_year)
);

-- Índices
CREATE INDEX idx_business_metrics_org ON public.business_metrics(organization_id);
CREATE INDEX idx_business_metrics_period ON public.business_metrics(period_year, period_month);

-- RLS
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all metrics"
ON public.business_metrics FOR SELECT
TO authenticated
USING (is_kyrie_admin(auth.uid()));

CREATE POLICY "Admins can manage metrics"
ON public.business_metrics FOR ALL
TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

CREATE POLICY "Clients view own metrics"
ON public.business_metrics FOR SELECT
TO authenticated
USING (organization_id = get_user_org_id(auth.uid()));

CREATE TRIGGER business_metrics_updated_at
    BEFORE UPDATE ON public.business_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE public.business_metrics IS 'Métricas de negócio mensais por organização';
```

### 3.5 Migration 005: Client Health Table

**Arquivo:** `supabase/migrations/20260130_005_create_client_health.sql`

```sql
-- ============================================================
-- MIGRATION 005: CLIENT HEALTH TABLE
-- ============================================================

DO $$ BEGIN
    CREATE TYPE churn_risk_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.client_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamento
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Health Score (0-100)
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    
    -- Componentes do Score
    engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
    satisfaction_score INTEGER CHECK (satisfaction_score >= 0 AND satisfaction_score <= 100),
    results_score INTEGER CHECK (results_score >= 0 AND results_score <= 100),
    
    -- Churn Risk
    churn_risk_percentage INTEGER CHECK (churn_risk_percentage >= 0 AND churn_risk_percentage <= 100),
    churn_risk_level churn_risk_level,
    
    -- Insights gerados pela IA
    insights JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Metadados de cálculo
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    calculation_method TEXT DEFAULT 'ai',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_client_health_org ON public.client_health(organization_id);
CREATE INDEX idx_client_health_calculated ON public.client_health(calculated_at DESC);
CREATE INDEX idx_client_health_score ON public.client_health(health_score);
CREATE INDEX idx_client_health_churn ON public.client_health(churn_risk_level);

-- RLS
ALTER TABLE public.client_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view health"
ON public.client_health FOR SELECT
TO authenticated
USING (is_kyrie_admin(auth.uid()));

CREATE POLICY "Only admins can manage health"
ON public.client_health FOR ALL
TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

COMMENT ON TABLE public.client_health IS 'Health scores calculados pela IA para cada cliente';
```

### 3.6 Migration 006: Activities Table

**Arquivo:** `supabase/migrations/20260130_006_create_activities.sql`

```sql
-- ============================================================
-- MIGRATION 006: ACTIVITIES TABLE (Audit Log)
-- ============================================================

DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM (
        'report_generated',
        'report_viewed',
        'task_created',
        'task_completed',
        'project_created',
        'project_updated',
        'time_logged',
        'metric_updated',
        'health_calculated',
        'user_login',
        'user_action'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Quem fez
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT,
    
    -- Contexto
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- O que aconteceu
    activity_type activity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Referência ao objeto
    target_type TEXT,
    target_id UUID,
    target_name TEXT,
    
    -- Metadados extras
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_activities_user ON public.activities(user_id);
CREATE INDEX idx_activities_org ON public.activities(organization_id);
CREATE INDEX idx_activities_type ON public.activities(activity_type);
CREATE INDEX idx_activities_created ON public.activities(created_at DESC);
CREATE INDEX idx_activities_target ON public.activities(target_type, target_id);

-- RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all activities"
ON public.activities FOR SELECT
TO authenticated
USING (is_kyrie_admin(auth.uid()));

CREATE POLICY "Admins can create activities"
ON public.activities FOR INSERT
TO authenticated
WITH CHECK (is_kyrie_admin(auth.uid()));

CREATE POLICY "Clients view own org activities"
ON public.activities FOR SELECT
TO authenticated
USING (organization_id = get_user_org_id(auth.uid()));

-- Função para logar atividade
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_user_name TEXT,
    p_org_id UUID,
    p_type activity_type,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_target_type TEXT DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_target_name TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    INSERT INTO public.activities (
        user_id, user_name, organization_id, activity_type,
        title, description, target_type, target_id, target_name, metadata
    ) VALUES (
        p_user_id, p_user_name, p_org_id, p_type,
        p_title, p_description, p_target_type, p_target_id, p_target_name, p_metadata
    ) RETURNING id INTO v_activity_id;
    
    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.activities IS 'Log de atividades do sistema (audit trail)';
```

### 3.7 Migration 007: Seed Data (Clientes Reais)

**Arquivo:** `supabase/migrations/20260130_007_seed_data.sql`

```sql
-- ============================================================
-- MIGRATION 007: SEED DATA
-- ============================================================

-- ORGANIZAÇÕES (Clientes Reais da Kyrie)
INSERT INTO public.organizations (id, name, slug, metadata, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 
     'Adega Anita''s', 
     'adega-anitas',
     '{"monthly_fee": 1500, "contract_start": "2024-09-01", "industry": "beverage_retail", "location": "Vila São Pedro, São Bernardo do Campo"}',
     '2024-09-01'),
    
    ('22222222-2222-2222-2222-222222222222', 
     'MontMassas', 
     'montmassas',
     '{"monthly_fee": 1200, "contract_start": "2024-10-01", "industry": "food_distribution", "location": "ABC Paulista"}',
     '2024-10-01'),
    
    ('33333333-3333-3333-3333-333333333333', 
     'Libertare', 
     'libertare',
     '{"monthly_fee": 1000, "contract_start": "2026-01-01", "industry": "jewelry", "location": "São Paulo"}',
     '2026-01-01')
ON CONFLICT (slug) DO NOTHING;

-- PROJETOS
INSERT INTO public.projects (id, client_id, name, description, status, created_at) VALUES
    -- Adega Anita's
    ('aaaa1111-1111-1111-1111-111111111111',
     '11111111-1111-1111-1111-111111111111',
     'Sistema ERP + NFC-e',
     'Desenvolvimento do sistema interno com módulo fiscal',
     'active',
     '2024-09-15'),
    
    ('aaaa2222-2222-2222-2222-222222222222',
     '11111111-1111-1111-1111-111111111111',
     'Gestão de Tráfego Pago',
     'Campanhas Meta Ads e Google Ads',
     'active',
     '2024-10-01'),
    
    ('aaaa3333-3333-3333-3333-333333333333',
     '11111111-1111-1111-1111-111111111111',
     'Identidade Visual',
     'Rebranding completo da marca',
     'completed',
     '2024-09-01'),
    
    -- MontMassas
    ('bbbb1111-1111-1111-1111-111111111111',
     '22222222-2222-2222-2222-222222222222',
     'Catálogo Digital',
     'Catálogo de produtos para distribuidores',
     'active',
     '2024-10-15'),
    
    ('bbbb2222-2222-2222-2222-222222222222',
     '22222222-2222-2222-2222-222222222222',
     'Google Ads',
     'Campanhas de busca para captação B2B',
     'active',
     '2024-11-01'),
    
    -- Libertare
    ('cccc1111-1111-1111-1111-111111111111',
     '33333333-3333-3333-3333-333333333333',
     'Onboarding Q1 2026',
     'Setup inicial: branding, redes sociais, primeiras campanhas',
     'active',
     '2026-01-06')
ON CONFLICT DO NOTHING;

-- TASKS (Exemplos com ICE Score)
INSERT INTO public.tasks (project_id, title, description, status, priority, ice_impact, ice_confidence, ice_effort, due_date) VALUES
    -- Adega Anita's - ERP
    ('aaaa1111-1111-1111-1111-111111111111', 
     'Corrigir bug de emissão NFC-e', 
     'Erro ao emitir nota quando CPF não informado', 
     'in_progress', 'urgent', 9, 9, 3, NOW() + INTERVAL '2 days'),
    
    ('aaaa1111-1111-1111-1111-111111111111', 
     'Implementar relatório de vendas', 
     'Dashboard com vendas por período, produto e forma de pagamento', 
     'todo', 'high', 8, 8, 6, NOW() + INTERVAL '7 days'),
    
    -- Adega Anita's - Tráfego
    ('aaaa2222-2222-2222-2222-222222222222', 
     'Criar campanha Carnaval 2026', 
     'Anúncios focados em bebidas para o Carnaval', 
     'todo', 'high', 9, 8, 5, '2026-02-10'),
    
    -- MontMassas
    ('bbbb1111-1111-1111-1111-111111111111', 
     'Atualizar fotos do catálogo', 
     'Fotografar novos produtos da linha premium', 
     'todo', 'high', 8, 9, 5, NOW() + INTERVAL '10 days'),
    
    ('bbbb2222-2222-2222-2222-222222222222', 
     'Revisar keywords negativas', 
     'Limpar termos irrelevantes das campanhas', 
     'done', 'medium', 6, 8, 2, NOW() - INTERVAL '3 days'),
    
    -- Libertare
    ('cccc1111-1111-1111-1111-111111111111', 
     'Definir paleta de cores', 
     'Workshop de branding com a cliente', 
     'in_progress', 'high', 8, 9, 3, NOW() + INTERVAL '3 days'),
    
    ('cccc1111-1111-1111-1111-111111111111', 
     'Configurar Meta Business', 
     'Criar conta de anúncios e pixel', 
     'todo', 'high', 9, 10, 2, NOW() + INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- BUSINESS METRICS (Dados históricos)
INSERT INTO public.business_metrics 
    (organization_id, period_month, period_year, revenue, ad_spend, consultancy_fee, new_customers, total_customers, leads_generated, conversion_rate, avg_ticket)
VALUES
    -- Adega Anita's
    ('11111111-1111-1111-1111-111111111111', 9, 2024, 95000, 800, 1500, 45, 450, 120, 37.5, 28.50),
    ('11111111-1111-1111-1111-111111111111', 10, 2024, 102000, 1000, 1500, 52, 502, 140, 37.1, 29.20),
    ('11111111-1111-1111-1111-111111111111', 11, 2024, 107564, 1200, 1500, 58, 560, 155, 37.4, 28.20),
    ('11111111-1111-1111-1111-111111111111', 12, 2024, 114491, 1500, 1500, 65, 625, 180, 36.1, 32.60),
    ('11111111-1111-1111-1111-111111111111', 1, 2026, 98000, 1200, 1500, 48, 673, 135, 35.6, 30.10),
    
    -- MontMassas
    ('22222222-2222-2222-2222-222222222222', 10, 2024, 45000, 500, 1200, 8, 120, 25, 32.0, 375.00),
    ('22222222-2222-2222-2222-222222222222', 11, 2024, 52000, 600, 1200, 10, 130, 32, 31.3, 400.00),
    ('22222222-2222-2222-2222-222222222222', 12, 2024, 58000, 700, 1200, 12, 142, 38, 31.6, 408.45),
    ('22222222-2222-2222-2222-222222222222', 1, 2026, 48000, 600, 1200, 9, 151, 28, 32.1, 317.88),
    
    -- Libertare
    ('33333333-3333-3333-3333-333333333333', 1, 2026, 12000, 300, 1000, 15, 15, 45, 33.3, 800.00)
ON CONFLICT (organization_id, period_month, period_year) DO NOTHING;

-- CLIENT HEALTH (Estado atual)
INSERT INTO public.client_health 
    (organization_id, health_score, engagement_score, satisfaction_score, results_score, 
     churn_risk_percentage, churn_risk_level, insights, recommendations)
VALUES
    ('11111111-1111-1111-1111-111111111111', 
     85, 90, 80, 85, 
     8, 'low',
     '[{"type": "positive", "message": "ROI consistente acima de 4x nos últimos 3 meses"}, {"type": "warning", "message": "Calendário editorial pausado desde dezembro"}]',
     '[{"action": "upsell", "confidence": "medium", "message": "Propor gestão completa de redes sociais"}]'),
    
    ('22222222-2222-2222-2222-222222222222', 
     72, 65, 75, 76, 
     18, 'medium',
     '[{"type": "warning", "message": "Engajamento caiu 15% no último mês"}, {"type": "positive", "message": "ROI melhorando constantemente"}]',
     '[{"action": "alignment", "confidence": "high", "message": "Agendar call de alinhamento estratégico"}]'),
    
    ('33333333-3333-3333-3333-333333333333', 
     88, 95, 85, 84, 
     5, 'low',
     '[{"type": "positive", "message": "Cliente novo com alto engajamento"}, {"type": "info", "message": "Primeiro mês de operação"}]',
     '[{"action": "onboarding", "confidence": "high", "message": "Manter cadência de reuniões semanais"}]')
ON CONFLICT DO NOTHING;
```

### 3.8 Migration 008: Update Organizations Table

**Arquivo:** `supabase/migrations/20260130_008_update_organizations.sql`

```sql
-- ============================================================
-- MIGRATION 008: UPDATE ORGANIZATIONS TABLE
-- ============================================================

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive', 'suspended', 'churned'));

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10,2);

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS contract_start DATE;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS contract_end DATE;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS industry TEXT;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger para updated_at
CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Atualizar dados existentes do seed
UPDATE public.organizations SET
    monthly_fee = (metadata->>'monthly_fee')::numeric,
    contract_start = (metadata->>'contract_start')::date,
    industry = metadata->>'industry',
    status = 'active'
WHERE metadata IS NOT NULL AND metadata->>'monthly_fee' IS NOT NULL;

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON public.organizations(industry);
```

---

## 4. PORTAL DO CLIENTE - IMPLEMENTAÇÃO

### 4.1 Página de Histórico de Relatórios

**Arquivo:** `app/client/reports/page.tsx`

```tsx
import { createClient } from "@/utils/supabase/server";
import { ReportsList } from "@/components/client/reports-list";
import { FileText } from "lucide-react";

export default async function ClientReportsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Não autorizado</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return <div>Organização não encontrada</div>;
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-400" />
            Relatórios Semanais
          </h2>
          <p className="text-muted-foreground mt-1">
            Histórico completo de relatórios gerados pela Kyrie
          </p>
        </div>
      </div>

      <ReportsList reports={reports || []} />
    </div>
  );
}
```

### 4.2 Página de Projetos

**Arquivo:** `app/client/projects/page.tsx`

```tsx
import { createClient } from "@/utils/supabase/server";
import { ProjectsList } from "@/components/client/projects-list";
import { FolderKanban } from "lucide-react";

export default async function ClientProjectsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Não autorizado</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return <div>Organização não encontrada</div>;
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", profile.organization_id)
    .order("created_at", { ascending: false });

  const { data: allTasks } = await supabase
    .from("tasks")
    .select("project_id, status")
    .in("project_id", projects?.map((p) => p.id) || []);

  const projectsWithProgress = projects?.map((project) => {
    const projectTasks = allTasks?.filter((t) => t.project_id === project.id) ||
      [];
    const totalTasks = projectTasks.length;
    const doneTasks = projectTasks.filter((t) => t.status === "done").length;
    const inProgressTasks = projectTasks.filter((t) =>
      t.status === "in_progress"
    ).length;

    return {
      ...project,
      total_tasks: totalTasks,
      done_tasks: doneTasks,
      in_progress_tasks: inProgressTasks,
      progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    };
  }) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-emerald-400" />
            Meus Projetos
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe o progresso de todos os seus projetos
          </p>
        </div>
      </div>

      <ProjectsList projects={projectsWithProgress} />
    </div>
  );
}
```

---

## 5. ADMIN DASHBOARD - DADOS REAIS

### 5.1 Dashboard com Queries Reais

**Arquivo:** `app/kyrie/dashboard/page.tsx` (Atualizado)

```tsx
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminMetricsCard } from "@/components/admin/admin-metrics-card";
import { RecentActivityFeed } from "@/components/admin/recent-activity-feed";
import { ClientHealthList } from "@/components/admin/client-health-list";
import {
  Activity,
  AlertTriangle,
  DollarSign,
  FileText,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Contar clientes ativos
  const { count: clientCount } = await supabase
    .from("organizations")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // 2. Calcular MRR
  const { data: orgsWithFee } = await supabase
    .from("organizations")
    .select("monthly_fee")
    .eq("status", "active");

  const mrr =
    orgsWithFee?.reduce((sum, org) => sum + (org.monthly_fee || 0), 0) || 0;

  // 3. Contar projetos ativos
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // 4. Contar relatórios (este mês)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: reportCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());

  // 5. Buscar últimas atividades
  const { data: activities } = await supabase
    .from("activities")
    .select("*, organizations(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  // 6. Buscar health scores
  const { data: healthScores } = await supabase
    .from("client_health")
    .select("*, organizations(name, slug)")
    .order("calculated_at", { ascending: false });

  const latestHealthByOrg = healthScores?.reduce((acc, curr) => {
    if (!acc[curr.organization_id]) {
      acc[curr.organization_id] = curr;
    }
    return acc;
  }, {} as Record<string, typeof healthScores[0]>);

  const healthList = Object.values(latestHealthByOrg || {});

  const alertCount =
    healthList.filter((h) =>
      h.churn_risk_level === "high" || h.churn_risk_level === "critical"
    ).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Geral</h2>
          <p className="text-muted-foreground mt-1">
            Visão completa do ecossistema Kyrie OS
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Zap className="mr-2 h-4 w-4" />
          Ações Rápidas IA
        </Button>
      </div>

      {/* KPI Cards - DADOS REAIS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminMetricsCard
          title="Clientes Ativos"
          value={clientCount || 0}
          icon={Users}
          trend="up"
        />
        <AdminMetricsCard
          title="MRR"
          value={`R$ ${mrr.toLocaleString("pt-BR")}`}
          icon={DollarSign}
          trend="up"
        />
        <AdminMetricsCard
          title="Projetos Ativos"
          value={projectCount || 0}
          icon={Activity}
        />
        <AdminMetricsCard
          title="Relatórios (Mês)"
          value={reportCount || 0}
          icon={FileText}
          trend="up"
        />
      </div>

      {/* Alerta */}
      {alertCount > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <div>
              <p className="font-semibold text-orange-200">
                {alertCount} cliente{alertCount > 1 ? "s" : ""}{" "}
                precisa de atenção
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityFeed activities={activities || []} />
          </CardContent>
        </Card>

        <Card className="col-span-3 border-purple-500/20 bg-purple-950/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Saúde dos Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientHealthList healthData={healthList} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 6. PERSISTÊNCIA DE RELATÓRIOS

### 6.1 Backend Atualizado

O `report_generator.py` deve ser atualizado para:

1. Carregar dados da organização
2. Buscar time_entries, tasks e métricas
3. Gerar relatório com Gemini
4. **SALVAR no Supabase** automaticamente
5. Logar atividade

Ver código completo no documento anexo de implementação.

---

## 7. ROADMAP DE EXECUÇÃO

### Timeline: 5 Dias

```
DIA 1: DATABASE (4-6h)
├── Executar migrations 002-008
├── Validar RLS policies
└── Verificar seed data

DIA 2: BACKEND (3-4h)
├── Atualizar report_generator.py
├── Atualizar main.py
└── Testar endpoint

DIA 3: PORTAL CLIENTE (4-5h)
├── /client/reports
├── /client/projects
└── Componentes auxiliares

DIA 4: ADMIN DASHBOARD (3-4h)
├── Dashboard com queries reais
├── Activity Feed funcional
└── Health List

DIA 5: INTEGRAÇÃO (3-4h)
├── Testar fluxo completo
├── Validar RLS
└── Bug fixes
```

---

## 8. CRITÉRIOS DE SUCESSO

### Definição de "Pronto"

```yaml
DATABASE:
  ✅ 5 novas tabelas criadas
  ✅ RLS testado e validado
  ✅ Seed data presente

PORTAL DO CLIENTE:
  ✅ /client/dashboard com métricas REAIS
  ✅ /client/reports lista relatórios
  ✅ /client/projects mostra progresso

ADMIN DASHBOARD:
  ✅ KPIs com dados reais
  ✅ Activity Feed funcional
  ✅ Health List funcionando

PERSISTÊNCIA:
  ✅ Relatórios salvos automaticamente
  ✅ Atividades logadas
```

### Métricas de Validação

| Métrica            | Meta  |
| ------------------ | ----- |
| Tabelas criadas    | 5/5   |
| RLS funcionando    | 100%  |
| Páginas do cliente | 3/3   |
| Dados mockados     | 0     |
| Tempo de geração   | < 30s |

---

## CONCLUSÃO

O PRD 1.2 leva o Kyrie OS de **65% para 100%** funcional.

**Entregáveis:**

- Database completo (11 tabelas)
- Portal do Cliente funcional
- Admin com dados reais
- Persistência de relatórios

**Estimativa:** 17-23 horas de desenvolvimento

---

**Kyrie OS PRD 1.2 - Conexão Total + Portal do Cliente**

_"Do mockado ao real. Do protótipo ao MVP."_

**LET'S FINISH THIS! 🚀💜**
