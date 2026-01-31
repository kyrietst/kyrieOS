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
CREATE INDEX IF NOT EXISTS idx_client_health_org ON public.client_health(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_health_calculated ON public.client_health(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_health_score ON public.client_health(health_score);
CREATE INDEX IF NOT EXISTS idx_client_health_churn ON public.client_health(churn_risk_level);

-- RLS
ALTER TABLE public.client_health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view health" ON public.client_health;
CREATE POLICY "Only admins can view health"
ON public.client_health FOR SELECT
TO authenticated
USING (is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage health" ON public.client_health;
CREATE POLICY "Only admins can manage health"
ON public.client_health FOR ALL
TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

COMMENT ON TABLE public.client_health IS 'Health scores calculados pela IA para cada cliente';
