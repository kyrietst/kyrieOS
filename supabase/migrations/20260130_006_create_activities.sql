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
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_org ON public.activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_target ON public.activities(target_type, target_id);

-- RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all activities" ON public.activities;
CREATE POLICY "Admins can view all activities"
ON public.activities FOR SELECT
TO authenticated
USING (is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can create activities" ON public.activities;
CREATE POLICY "Admins can create activities"
ON public.activities FOR INSERT
TO authenticated
WITH CHECK (is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Clients view own org activities" ON public.activities;
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
