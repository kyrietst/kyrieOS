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
DROP TRIGGER IF EXISTS organizations_updated_at ON public.organizations;
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
