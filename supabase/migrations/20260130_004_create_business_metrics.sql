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
CREATE INDEX IF NOT EXISTS idx_business_metrics_org ON public.business_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_period ON public.business_metrics(period_year, period_month);

-- RLS
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all metrics" ON public.business_metrics;
CREATE POLICY "Admins can view all metrics"
ON public.business_metrics FOR SELECT
TO authenticated
USING (is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage metrics" ON public.business_metrics;
CREATE POLICY "Admins can manage metrics"
ON public.business_metrics FOR ALL
TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Clients view own metrics" ON public.business_metrics;
CREATE POLICY "Clients view own metrics"
ON public.business_metrics FOR SELECT
TO authenticated
USING (organization_id = get_user_org_id(auth.uid()));

DROP TRIGGER IF EXISTS business_metrics_updated_at ON public.business_metrics;
CREATE TRIGGER business_metrics_updated_at
    BEFORE UPDATE ON public.business_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE public.business_metrics IS 'Métricas de negócio mensais por organização';
