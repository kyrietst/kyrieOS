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
CREATE INDEX IF NOT EXISTS idx_reports_organization_id ON public.reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_period ON public.reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
TO authenticated
USING (is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage reports" ON public.reports;
CREATE POLICY "Admins can manage reports"
ON public.reports FOR ALL
TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Clients view own reports" ON public.reports;
CREATE POLICY "Clients view own reports"
ON public.reports FOR SELECT
TO authenticated
USING (organization_id = get_user_org_id(auth.uid()));

-- Trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reports_updated_at ON public.reports;
CREATE TRIGGER reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE public.reports IS 'Relatórios gerados pela IA, vinculados a organizações';
