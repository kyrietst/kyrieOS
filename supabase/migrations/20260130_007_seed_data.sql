-- ============================================================
-- MIGRATION 007: SEED DATA (CORRECTED V2)
-- ============================================================

-- Ensure projects table has description column
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT;

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
ON CONFLICT (slug) DO UPDATE SET 
    metadata = EXCLUDED.metadata,
    name = EXCLUDED.name, -- Update name in case it changed
    id = EXCLUDED.id; -- Ensure ID matches for foreign keys

-- PROJETOS
-- Fixed: client_id -> organization_id
-- Fixed: status 'completed' -> 'archived'
INSERT INTO public.projects (id, organization_id, name, description, status, created_at) VALUES
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
     'archived', -- Changed from 'completed' to 'archived'
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
ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status;

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
