-- ============================================================
-- MIGRATION: PRD 2.0 SCHEMA (Approvals, Business Agent, Notifications)
-- ============================================================

-- Enable pgcrypto if not already enabled (standard for UUIDs)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. APPROVALS SYSTEM
-- ------------------------------------------------------------

-- Tipos de conteúdo para aprovação
DO $$ BEGIN
    CREATE TYPE approval_content_type AS ENUM (
        'creative',      -- Imagem/vídeo de anúncio
        'copy',          -- Texto de anúncio
        'post',          -- Post para redes sociais
        'landing_page',  -- Página de vendas
        'email',         -- Email marketing
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de aprovação
DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM (
        'pending',       -- Aguardando revisão
        'approved',      -- Aprovado pelo cliente
        'rejected',      -- Rejeitado (precisa refazer)
        'revision',      -- Precisa de ajustes
        'expired'        -- Expirou sem resposta
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela principal de aprovações
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamentos
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Conteúdo
    title TEXT NOT NULL,
    description TEXT,
    content_type approval_content_type NOT NULL,
    
    -- Arquivos (URLs do Supabase Storage)
    files JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status approval_status DEFAULT 'pending',
    
    -- Feedback do cliente
    feedback TEXT,
    feedback_by UUID REFERENCES auth.users(id),
    feedback_at TIMESTAMPTZ,
    
    -- Prazos
    due_date TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Versionamento
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES public.approvals(id), -- Para revisões
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices Approvals
CREATE INDEX IF NOT EXISTS idx_approvals_org ON public.approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_project ON public.approvals(project_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_created_by ON public.approvals(created_by);
CREATE INDEX IF NOT EXISTS idx_approvals_due_date ON public.approvals(due_date);

-- Histórico de ações nas aprovações
CREATE TABLE IF NOT EXISTS public.approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID NOT NULL REFERENCES public.approvals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    action TEXT NOT NULL, -- 'created', 'viewed', 'approved', 'rejected', 'commented'
    comment TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_history_approval ON public.approval_history(approval_id);

-- RLS Approvals
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- Políticas: Admin vê tudo, Cliente vê só da sua org
DROP POLICY IF EXISTS "Admins can manage all approvals" ON public.approvals;
CREATE POLICY "Admins can manage all approvals"
ON public.approvals FOR ALL
TO authenticated
USING (public.is_kyrie_admin(auth.uid()))
WITH CHECK (public.is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Clients view own approvals" ON public.approvals;
CREATE POLICY "Clients view own approvals"
ON public.approvals FOR SELECT
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Clients can update own approvals" ON public.approvals;
CREATE POLICY "Clients can update own approvals"
ON public.approvals FOR UPDATE
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- ------------------------------------------------------------
-- 2. BUSINESS CALCULATOR AGENT
-- ------------------------------------------------------------

-- Tabela de Métricas de Negócio (Mensal)
CREATE TABLE IF NOT EXISTS public.business_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Período
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INTEGER NOT NULL,
    
    -- Dados Financeiros
    revenue NUMERIC(15, 2) DEFAULT 0,    -- Faturamento
    ad_spend NUMERIC(15, 2) DEFAULT 0,   -- Gasto em Anúncios
    consultancy_fee NUMERIC(15, 2) DEFAULT 0, -- Fee da Kyrie
    
    -- Dados de Performance
    new_customers INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    conversion_rate NUMERIC(5, 2), -- %
    
    -- Métricas Calculadas (Persistidas para histórico)
    roi NUMERIC(10, 2), -- Return on Investment (ex: 5.4)
    cac NUMERIC(10, 2), -- Customer Acquisition Cost
    ltv NUMERIC(10, 2), -- Lifetime Value Estimado
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(organization_id, period_month, period_year)
);

CREATE INDEX IF NOT EXISTS idx_metrics_org_period ON public.business_metrics(organization_id, period_year, period_month);

-- Tabela de Saúde do Cliente (Snapshot mais recente)
CREATE TABLE IF NOT EXISTS public.client_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Score Geral (0-100)
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    status TEXT, -- 'healthy', 'at_risk', 'critical'
    
    -- Detalhes do Agente
    insights JSONB DEFAULT '[]'::jsonb, -- Lista de insights gerados
    anomalies JSONB DEFAULT '[]'::jsonb, -- Lista de anomalias detectadas
    recommendations JSONB DEFAULT '[]'::jsonb, -- Ações sugeridas
    
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_health_org ON public.client_health(organization_id);

-- RLS Business
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage metrics" ON public.business_metrics;
CREATE POLICY "Admins manage metrics" ON public.business_metrics FOR ALL TO authenticated USING (public.is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Clients view metrics" ON public.business_metrics;
CREATE POLICY "Clients view metrics" ON public.business_metrics FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage health" ON public.client_health;
CREATE POLICY "Admins manage health" ON public.client_health FOR ALL TO authenticated USING (public.is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Clients view health" ON public.client_health;
CREATE POLICY "Clients view health" ON public.client_health FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- ------------------------------------------------------------
-- 3. NOTIFICATIONS SYSTEM
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Destinatário
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id),
    
    -- Conteúdo
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'info', 'warning', 'success', 'error'
    category TEXT, -- 'approval', 'report', 'anomaly', 'system'
    
    -- Link para ação
    action_url TEXT,
    action_label TEXT,
    
    -- Status
    read_at TIMESTAMPTZ,
    sent_email_at TIMESTAMPTZ,
    sent_whatsapp_at TIMESTAMPTZ,
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read_at);

-- RLS Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins send notifications" ON public.notifications;
CREATE POLICY "Admins send notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_kyrie_admin(auth.uid()));
