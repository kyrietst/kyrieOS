-- ============================================================
-- MIGRATION 002: TASKS TABLE (CORRECTED)
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
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_ice_score ON public.tasks(ice_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Função helper (idempotent)
CREATE OR REPLACE FUNCTION get_user_org_id(user_id UUID)
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_kyrie_admin(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id 
        AND role IN ('KYRIE_ADMIN', 'KYRIE_TEAM')
    );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Políticas RLS
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
CREATE POLICY "Admins can view all tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.tasks;
CREATE POLICY "Admins can manage all tasks"
ON public.tasks FOR ALL
TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

DROP POLICY IF EXISTS "Clients view own project tasks" ON public.tasks;
CREATE POLICY "Clients view own project tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE p.organization_id = get_user_org_id(auth.uid()) -- Fixed: client_id -> organization_id
    )
);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at ON public.tasks;
CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

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

DROP TRIGGER IF EXISTS tasks_completion_tracker ON public.tasks;
CREATE TRIGGER tasks_completion_tracker
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_task_completed_at();
