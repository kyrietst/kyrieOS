import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper: insert + error check
async function insert<T>(table: string, data: Record<string, unknown> | Record<string, unknown>[]): Promise<T> {
  const { data: result, error } = await supabase.from(table).insert(data).select()
  if (error) { console.error(`❌ Falha ao inserir ${table}:`, error); process.exit(1) }
  console.log(`✅ ${table}:`, Array.isArray(result) ? result.length + ' registros' : result)
  return result as T
}

async function main() {
  // Safety check
  const { count } = await supabase.from('organizations').select('*', { count: 'exact', head: true })
  if (count && count > 0) {
    console.log('⚠️ Banco já tem dados. Abortando seed para não duplicar.')
    process.exit(0)
  }

  // ── CLEANUP EXISTING AUTH USERS ──
  console.log('\n🧹 Limpando auth users existentes...')
  const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers()
  for (const u of existingUsers || []) {
    await supabase.auth.admin.deleteUser(u.id)
    console.log(`🗑️ Auth user deletado: ${u.email}`)
  }

  // ── AUTH USERS ──
  console.log('\n🔑 Criando auth users...')
  const usersData = [
    { email: 'gilmar@kyrie.com.br', password: 'Kyrie@2026!', full_name: 'Gilmar Souza' },
    { email: 'marina@cafeaurora.com.br', password: 'Aurora@2026!', full_name: 'Marina Costa' },
    { email: 'joao@kyrie.com.br', password: 'Kyrie@2026!', full_name: 'João Pedro Alves' },
  ]
  const userIds: string[] = []
  for (const u of usersData) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email, password: u.password, email_confirm: true,
      user_metadata: { full_name: u.full_name }
    })
    if (error) { console.error(`❌ Falha ao criar user ${u.email}:`, error); process.exit(1) }
    console.log(`✅ Auth user: ${u.email} → ${data.user.id}`)
    userIds.push(data.user.id)
  }
  const [gilmarId, marinaId, joaoId] = userIds

  // Wait for trigger handle_new_user
  console.log('\n⏳ Aguardando trigger handle_new_user...')
  await new Promise(r => setTimeout(r, 3000))

  const { data: profiles } = await supabase.from('profiles').select('id, full_name')
  console.log('✅ Profiles criados pelo trigger:', profiles)
  if (!profiles || profiles.length < 3) {
    console.log('⚠️ Trigger não criou profiles, criando manualmente...')
    for (const u of usersData) {
      const uid = userIds[usersData.indexOf(u)]
      await supabase.from('profiles').upsert({ id: uid, full_name: u.full_name })
    }
  }

  // ── ORGANIZATION ──
  console.log('\n🏢 Criando organização...')
  const [org] = await insert<any[]>('organizations', {
    name: 'Café Aurora',
    slug: 'cafe-aurora',
    industry: 'Alimentação',
    monthly_fee: 3000.00,
    contract_start: '2026-01-15',
    contract_end: '2026-07-15',
    status: 'active',
    metadata: { city: 'São Paulo', segment: 'Cafeteria Artesanal' }
  })
  const orgId = org.id
  console.log(`   org_id: ${orgId}`)

  // ── UPDATE PROFILES ──
  console.log('\n👤 Vinculando profiles à organização...')
  const roleMap: Record<string, string> = {
    [gilmarId]: 'KYRIE_ADMIN',
    [marinaId]: 'CLIENT_OWNER',
    [joaoId]: 'KYRIE_TEAM',
  }
  for (const [uid, role] of Object.entries(roleMap)) {
    const { error } = await supabase.from('profiles').update({ organization_id: orgId, role }).eq('id', uid)
    if (error) { console.error(`❌ Falha ao atualizar profile ${uid}:`, error); process.exit(1) }
    console.log(`✅ Profile ${uid} → ${role}`)
  }

  // ── PROJECT ──
  console.log('\n📁 Criando projeto...')
  const [project] = await insert<any[]>('projects', {
    organization_id: orgId,
    name: 'Lançamento Digital Café Aurora',
    description: 'Projeto completo de marketing digital para posicionar o Café Aurora no mercado de cafeterias artesanais em São Paulo.',
    status: 'active'
  })
  const projectId = project.id

  // ── KANBAN COLUMNS ──
  console.log('\n📋 Criando kanban columns...')
  const columnsData = [
    { name: 'Backlog', position: 0, color: '#6B7280', is_done_column: false },
    { name: 'A Fazer', position: 1, color: '#3B82F6', is_done_column: false },
    { name: 'Em Progresso', position: 2, color: '#F59E0B', is_done_column: false, wip_limit: 5 },
    { name: 'Revisão', position: 3, color: '#8B5CF6', is_done_column: false, wip_limit: 3 },
    { name: 'Concluído', position: 4, color: '#10B981', is_done_column: true },
  ]
  const columns = await insert<any[]>('kanban_columns',
    columnsData.map(c => ({ ...c, organization_id: orgId }))
  )
  const colMap: Record<string, string> = {}
  for (const col of columns) colMap[col.name] = col.id

  // ── KANBAN LABELS ──
  console.log('\n🏷️ Criando kanban labels...')
  const labelsData = [
    { name: 'Urgente', color: '#EF4444' },
    { name: 'Design', color: '#8B5CF6' },
    { name: 'Copy', color: '#3B82F6' },
    { name: 'Tráfego', color: '#F59E0B' },
    { name: 'CRM', color: '#10B981' },
    { name: 'Estratégia', color: '#EC4899' },
  ]
  const labels = await insert<any[]>('kanban_labels',
    labelsData.map(l => ({ ...l, organization_id: orgId }))
  )
  const labelMap: Record<string, string> = {}
  for (const l of labels) labelMap[l.name] = l.id

  // ── KANBAN CARDS ──
  console.log('\n🃏 Criando kanban cards...')
  const now = new Date()
  const cardsInput = [
    { title: 'Redesign do logo e identidade visual', column_id: colMap['Backlog'], position: 0, description: 'Criar nova identidade alinhada ao posicionamento artesanal premium. Incluir paleta de cores, tipografia e aplicações.', priority: 'medium', start_date: '2026-02-01T09:00:00Z', due_date: '2026-03-15' },
    { title: 'Criar landing page de delivery', column_id: colMap['Backlog'], position: 1, description: 'LP com cardápio, depoimentos e CTA pro WhatsApp. Responsiva e otimizada para conversão.', priority: 'high', start_date: '2026-02-10T09:00:00Z', due_date: '2026-03-01' },
    { title: 'Configurar Meta Ads — campanha de awareness', column_id: colMap['A Fazer'], position: 0, description: 'Públicos: 25-45, raio 5km, interesse café/gastronomia. Budget: R$50/dia.', priority: 'high', start_date: '2026-02-15T09:00:00Z', due_date: '2026-02-28' },
    { title: 'Escrever scripts de atendimento WhatsApp', column_id: colMap['A Fazer'], position: 1, description: 'Scripts para: boas-vindas, cardápio, pedido e pós-venda.', priority: 'medium', start_date: '2026-02-20T09:00:00Z', due_date: '2026-03-10' },
    { title: 'Fotografia profissional dos produtos', column_id: colMap['Em Progresso'], position: 0, description: 'Sessão de fotos dos cafés especiais e doces artesanais. Estilo lifestyle + produto isolado.', priority: 'medium', start_date: '2026-02-05T09:00:00Z', due_date: '2026-02-25' },
    { title: 'Setup do CRM (pipeline de leads)', column_id: colMap['Em Progresso'], position: 1, description: 'Definir estágios: lead → contato → visita → cliente. Campos customizados por tipo de lead.', priority: 'high', start_date: '2026-01-20T09:00:00Z', due_date: '2026-02-20' },
    { title: 'Revisar textos da página do Google Meu Negócio', column_id: colMap['Revisão'], position: 0, description: 'Otimizar descrição, categorias e fotos para SEO local.', priority: 'low', start_date: '2026-02-25T09:00:00Z', due_date: '2026-03-05' },
    { title: 'Treinamento comercial com a equipe', column_id: colMap['Concluído'], position: 0, description: 'Workshop de abordagem e script de vendas presencial. 2 horas com role-play.', priority: 'medium', start_date: '2026-01-15T09:00:00Z', due_date: '2026-01-30', completed_at: '2026-01-28T17:00:00Z', is_due_date_completed: true },
  ]
  const cards = await insert<any[]>('kanban_cards',
    cardsInput.map(c => ({ ...c, organization_id: orgId, created_by: gilmarId, estimated_minutes: 120 }))
  )
  const cardMap: Record<string, string> = {}
  for (const c of cards) cardMap[c.title] = c.id

  // ── CARD LABELS ──
  console.log('\n🏷️ Associando labels aos cards...')
  const cardLabelAssoc = [
    { card: 'Redesign do logo e identidade visual', labels: ['Design'] },
    { card: 'Criar landing page de delivery', labels: ['Design', 'Copy'] },
    { card: 'Configurar Meta Ads — campanha de awareness', labels: ['Tráfego'] },
    { card: 'Escrever scripts de atendimento WhatsApp', labels: ['Copy', 'CRM'] },
    { card: 'Fotografia profissional dos produtos', labels: ['Design'] },
    { card: 'Setup do CRM (pipeline de leads)', labels: ['CRM', 'Estratégia'] },
    { card: 'Revisar textos da página do Google Meu Negócio', labels: ['Copy'] },
    { card: 'Treinamento comercial com a equipe', labels: ['Estratégia'] },
  ]
  const cardLabelRows: { card_id: string; label_id: string }[] = []
  for (const a of cardLabelAssoc) {
    for (const l of a.labels) {
      cardLabelRows.push({ card_id: cardMap[a.card], label_id: labelMap[l] })
    }
  }
  await insert('kanban_card_labels', cardLabelRows)

  // ── CARD MEMBERS ──
  console.log('\n👥 Associando membros aos cards...')
  const cardMemberAssoc = [
    { card: 'Redesign do logo e identidade visual', members: [joaoId] },
    { card: 'Criar landing page de delivery', members: [gilmarId, joaoId] },
    { card: 'Configurar Meta Ads — campanha de awareness', members: [gilmarId] },
    { card: 'Escrever scripts de atendimento WhatsApp', members: [gilmarId] },
    { card: 'Fotografia profissional dos produtos', members: [joaoId] },
    { card: 'Setup do CRM (pipeline de leads)', members: [gilmarId, marinaId] },
    { card: 'Revisar textos da página do Google Meu Negócio', members: [marinaId] },
    { card: 'Treinamento comercial com a equipe', members: [gilmarId] },
  ]
  const cardMemberRows: { card_id: string; user_id: string }[] = []
  for (const a of cardMemberAssoc) {
    for (const m of a.members) {
      cardMemberRows.push({ card_id: cardMap[a.card], user_id: m })
    }
  }
  await insert('kanban_card_members', cardMemberRows)

  // ── CARD COMMENTS ──
  console.log('\n💬 Criando comentários...')
  await insert('kanban_card_comments', [
    { card_id: cardMap['Criar landing page de delivery'], organization_id: orgId, user_id: gilmarId, content: 'Marina, preciso das fotos dos pratos mais vendidos pra montar a seção de destaques. Consegue até sexta?' },
    { card_id: cardMap['Criar landing page de delivery'], organization_id: orgId, user_id: marinaId, content: 'Consigo sim! Vou separar as fotos do cardápio novo e te mando.' },
    { card_id: cardMap['Configurar Meta Ads — campanha de awareness'], organization_id: orgId, user_id: gilmarId, content: 'Primeira versão dos criativos aprovada. Subindo campanha amanhã com R$50/dia.' },
    { card_id: cardMap['Setup do CRM (pipeline de leads)'], organization_id: orgId, user_id: marinaId, content: 'Não entendi bem a diferença entre lead e prospect. Pode me explicar na próxima call?' },
    { card_id: cardMap['Treinamento comercial com a equipe'], organization_id: orgId, user_id: gilmarId, content: 'Equipe aplicou o script novo e já percebeu diferença no atendimento. Resultado rápido.' },
  ])

  // ── CHECKLISTS + ITEMS ──
  console.log('\n✅ Criando checklists...')
  const checklists = await insert<any[]>('kanban_checklists', [
    { card_id: cardMap['Criar landing page de delivery'], organization_id: orgId, title: 'Elementos da LP', position: 0 },
    { card_id: cardMap['Setup do CRM (pipeline de leads)'], organization_id: orgId, title: 'Etapas de implantação', position: 0 },
  ])

  console.log('\n✅ Criando checklist items...')
  const lpChecklistId = checklists[0].id
  const crmChecklistId = checklists[1].id
  const completedAt = '2026-02-15T14:00:00Z'
  await insert('kanban_checklist_items', [
    { checklist_id: lpChecklistId, organization_id: orgId, content: 'Header com proposta de valor', is_completed: true, completed_at: completedAt, position: 0 },
    { checklist_id: lpChecklistId, organization_id: orgId, content: 'Seção de cardápio com fotos', is_completed: true, completed_at: completedAt, position: 1 },
    { checklist_id: lpChecklistId, organization_id: orgId, content: 'Depoimentos de clientes', is_completed: false, position: 2 },
    { checklist_id: lpChecklistId, organization_id: orgId, content: 'CTA para WhatsApp', is_completed: false, position: 3 },
    { checklist_id: lpChecklistId, organization_id: orgId, content: 'Footer com localização e horários', is_completed: false, position: 4 },
    { checklist_id: crmChecklistId, organization_id: orgId, content: 'Definir estágios do pipeline', is_completed: true, completed_at: completedAt, position: 0 },
    { checklist_id: crmChecklistId, organization_id: orgId, content: 'Criar campos customizados', is_completed: true, completed_at: completedAt, position: 1 },
    { checklist_id: crmChecklistId, organization_id: orgId, content: 'Importar base de contatos existente', is_completed: false, position: 2 },
    { checklist_id: crmChecklistId, organization_id: orgId, content: 'Treinar Marina no uso diário', is_completed: false, position: 3 },
  ])

  // ── KANBAN TIME ENTRIES ──
  console.log('\n⏱️ Criando kanban time entries...')
  await insert('kanban_time_entries', [
    { card_id: cardMap['Criar landing page de delivery'], user_id: joaoId, start_time: '2026-02-12T09:00:00Z', end_time: '2026-02-12T12:00:00Z', duration: 180, description: 'Wireframe e desenvolvimento' },
    { card_id: cardMap['Configurar Meta Ads — campanha de awareness'], user_id: gilmarId, start_time: '2026-02-16T10:00:00Z', end_time: '2026-02-16T12:00:00Z', duration: 120, description: 'Pesquisa de público e setup de campanha' },
    { card_id: cardMap['Escrever scripts de atendimento WhatsApp'], user_id: gilmarId, start_time: '2026-02-21T14:00:00Z', end_time: '2026-02-21T15:30:00Z', duration: 90, description: 'Escrita e revisão dos 4 scripts' },
  ])

  // ── TASKS ──
  console.log('\n📊 Criando tasks...')
  await insert('tasks', [
    { project_id: projectId, assigned_to: gilmarId, created_by: gilmarId, title: 'Definir público-alvo detalhado', description: 'Pesquisa demográfica e psicográfica do público do Café Aurora', status: 'done', priority: 'high', ice_impact: 9, ice_confidence: 8, ice_effort: 7, completed_at: '2026-01-25T16:00:00Z', started_at: '2026-01-16T09:00:00Z' },
    { project_id: projectId, assigned_to: joaoId, created_by: gilmarId, title: 'Mapear concorrentes locais', description: 'Análise de 10 concorrentes num raio de 3km', status: 'done', priority: 'medium', ice_impact: 7, ice_confidence: 9, ice_effort: 8, completed_at: '2026-01-28T17:00:00Z', started_at: '2026-01-18T09:00:00Z' },
    { project_id: projectId, assigned_to: joaoId, created_by: gilmarId, title: 'Criar calendário editorial mensal', description: 'Planejamento de 30 dias de conteúdo para Instagram e WhatsApp', status: 'in_progress', priority: 'high', ice_impact: 8, ice_confidence: 7, ice_effort: 6, started_at: '2026-02-01T09:00:00Z', due_date: '2026-02-28T23:59:59Z' },
    { project_id: projectId, assigned_to: gilmarId, created_by: gilmarId, title: 'Implementar programa de fidelidade', description: 'Cartão digital com recompensas por frequência', status: 'todo', priority: 'medium', ice_impact: 8, ice_confidence: 6, ice_effort: 5, due_date: '2026-04-15T23:59:59Z' },
    { project_id: projectId, assigned_to: joaoId, created_by: gilmarId, title: 'Configurar Google Analytics', description: 'GA4 + GTM no site e landing page', status: 'backlog', priority: 'low', ice_impact: 6, ice_confidence: 9, ice_effort: 9 },
    { project_id: projectId, assigned_to: joaoId, created_by: gilmarId, title: 'Produzir vídeo institucional', description: 'Vídeo de 60s mostrando o processo artesanal do café', status: 'backlog', priority: 'medium', ice_impact: 7, ice_confidence: 5, ice_effort: 4 },
  ])

  // ── TIME ENTRIES (global) ──
  console.log('\n⏱️ Criando time entries globais...')
  await insert('time_entries', [
    { user_id: gilmarId, project_id: projectId, task_description: 'Reunião de onboarding com Marina', start_time: '2026-01-15T10:00:00Z', end_time: '2026-01-15T11:00:00Z', duration: 60, is_running: false },
    { user_id: gilmarId, project_id: projectId, task_description: 'Análise de concorrência e posicionamento', start_time: '2026-01-20T09:00:00Z', end_time: '2026-01-20T11:00:00Z', duration: 120, is_running: false },
    { user_id: joaoId, project_id: projectId, task_description: 'Setup técnico (domínio, hosting, analytics)', start_time: '2026-01-22T14:00:00Z', end_time: '2026-01-22T15:30:00Z', duration: 90, is_running: false },
    { user_id: gilmarId, project_id: projectId, task_description: 'Planejamento de campanha Meta Ads', start_time: '2026-02-01T10:00:00Z', end_time: '2026-02-01T12:30:00Z', duration: 150, is_running: false },
  ])

  // ── BUSINESS METRICS ──
  console.log('\n📈 Criando business metrics...')
  await insert('business_metrics', [
    { organization_id: orgId, period_month: 1, period_year: 2026, revenue: 4200.00, ad_spend: 1500.00, consultancy_fee: 3000.00, new_customers: 8, total_customers: 45, leads_generated: 45, conversion_rate: 17.78, avg_ticket: 525.00, returning_customers: 12, data_source: 'manual' },
    { organization_id: orgId, period_month: 2, period_year: 2026, revenue: 8750.00, ad_spend: 2000.00, consultancy_fee: 3000.00, new_customers: 15, total_customers: 78, leads_generated: 78, conversion_rate: 19.23, avg_ticket: 583.33, returning_customers: 22, data_source: 'manual' },
    { organization_id: orgId, period_month: 3, period_year: 2026, revenue: 13400.00, ad_spend: 2500.00, consultancy_fee: 3000.00, new_customers: 23, total_customers: 112, leads_generated: 112, conversion_rate: 20.54, avg_ticket: 582.61, returning_customers: 35, data_source: 'manual' },
  ])

  // ── CLIENT HEALTH ──
  console.log('\n🏥 Criando client health...')
  await insert('client_health', [{
    organization_id: orgId, health_score: 82, engagement_score: 78, satisfaction_score: 85,
    results_score: 80, churn_risk_percentage: 12, churn_risk_level: 'low',
    insights: JSON.stringify([{ type: 'positive', text: 'Revenue growing 3x in 3 months' }, { type: 'attention', text: 'CRM setup still pending completion' }]),
    recommendations: JSON.stringify([{ priority: 'high', text: 'Finalize CRM to capture Meta Ads leads' }, { priority: 'medium', text: 'Launch loyalty program in Q2' }]),
    calculation_method: 'ai'
  }])

  // ── REPORTS ──
  console.log('\n📄 Criando reports...')
  await insert('reports', [
    { organization_id: orgId, generated_by: gilmarId, title: 'Relatório Semanal — Semana 1', content_markdown: '# Relatório Semanal — Semana 1\n\n## Destaques\n- Onboarding realizado com Marina\n- Análise de concorrência concluída\n- 3 concorrentes mapeados com oportunidades claras\n\n## Métricas\n- Horas investidas: 8h\n- Tasks concluídas: 2/6\n\n## Próximos passos\n- Iniciar setup do CRM\n- Briefing da landing page', summary: 'Semana de onboarding e análise estratégica', report_type: 'weekly', status: 'sent', period_start: '2026-01-15', period_end: '2026-01-21', generation_time_seconds: 12.5, ai_model_used: 'groq-llama3', tokens_used: 1200, viewed_at: '2026-01-22T10:00:00Z', viewed_by: marinaId },
    { organization_id: orgId, generated_by: gilmarId, title: 'Relatório Semanal — Semana 2', content_markdown: '# Relatório Semanal — Semana 2\n\n## Destaques\n- CRM em configuração\n- Landing page wireframe em andamento\n- Calendário editorial 50% definido\n\n## Métricas\n- Horas investidas: 12h\n- Tasks em progresso: 3\n- Leads captados: 12\n\n## Próximos passos\n- Finalizar LP\n- Lançar campanha Meta Ads', summary: 'Progresso em CRM e landing page', report_type: 'weekly', status: 'draft', period_start: '2026-01-22', period_end: '2026-01-28' },
  ])

  // ── APPROVALS ──
  console.log('\n✅ Criando approvals...')
  const approvalsResult = await insert<any[]>('approvals', [
    { organization_id: orgId, project_id: projectId, created_by: joaoId, title: 'Creative: Banner Meta Ads', description: 'Banner 1080x1080 para campanha de awareness no Instagram', content_type: 'creative', status: 'approved', feedback: 'Adorei! Pode subir.', feedback_by: marinaId, feedback_at: '2026-02-17T14:00:00Z', due_date: '2026-02-20T23:59:59Z', version: 1, files: JSON.stringify([{ name: 'banner-meta-ads-v1.png', url: '/storage/approvals/banner-v1.png' }]) },
    { organization_id: orgId, project_id: projectId, created_by: gilmarId, title: 'Copy: Texto Landing Page', description: 'Textos completos da landing page de delivery', content_type: 'copy', status: 'pending', due_date: '2026-03-05T23:59:59Z', version: 1 },
  ])

  // ── APPROVAL HISTORY ──
  console.log('\n📜 Criando approval history...')
  const bannerApprovalId = approvalsResult[0].id
  await insert('approval_history', [
    { approval_id: bannerApprovalId, user_id: joaoId, user_name: 'João Pedro Alves', action: 'pending', comment: 'Submeti o banner para aprovação' },
    { approval_id: bannerApprovalId, user_id: marinaId, user_name: 'Marina Costa', action: 'approved', comment: 'Adorei! Pode subir.' },
  ])

  // ── WIKI PAGES ──
  console.log('\n📖 Criando wiki pages...')
  const [homePage] = await insert<any[]>('wiki_pages', {
    organization_id: orgId, title: 'Home', slug: 'home', created_by: gilmarId,
    content: '# Bem-vindo ao Wiki do Café Aurora\n\nEste é o hub central de documentação do projeto de marketing digital do Café Aurora.\n\n## Seções\n- **Briefing**: Visão geral do negócio e posicionamento\n- **Processos**: Fluxos de atendimento e padrões operacionais',
    is_pinned: true, category: 'other'
  })
  await insert('wiki_pages', [
    { organization_id: orgId, parent_id: homePage.id, title: 'Briefing', slug: 'briefing', created_by: gilmarId, content: '# Briefing — Café Aurora\n\n## O Negócio\nCafeteria artesanal fundada em 2023, localizada na Vila Madalena, São Paulo.\n\n## Público-alvo\nJovens profissionais 25-40 anos, moradores da região, que valorizam café de qualidade e experiências gastronômicas.\n\n## Diferenciais\n- Grãos selecionados de micro-torrefações brasileiras\n- Receitas autorais de doces artesanais\n- Ambiente instagramável com design biofílico\n\n## Posicionamento\n"O café que conecta pessoas ao melhor do Brasil em cada xícara."\n\n## Concorrentes diretos\n1. Coffee Lab (premium, preço alto)\n2. Beluga Café (instagramável, foco em experiência)\n3. Isso É Café (specialty, público técnico)', category: 'strategy' },
    { organization_id: orgId, parent_id: homePage.id, title: 'Processos', slug: 'processos', created_by: gilmarId, content: '# Processos Operacionais\n\n## Atendimento WhatsApp\n1. Responder em até 5 minutos durante horário comercial\n2. Usar script padrão de boas-vindas\n3. Enviar cardápio digital como catálogo\n4. Confirmar pedido com resumo + valor total\n5. Informar tempo de preparo e entrega\n\n## Pós-venda\n1. Enviar pesquisa de satisfação 24h após entrega\n2. Oferecer cupom de 10% na segunda compra\n3. Adicionar ao CRM como cliente ativo\n\n## Gestão de Redes Sociais\n- 5 posts/semana no Instagram\n- Stories diários (bastidores)\n- Reels semanais (processo do café)', category: 'operational' },
  ])

  // ── AI CONVERSATIONS + MESSAGES ──
  console.log('\n🤖 Criando AI conversation...')
  const [conv] = await insert<any[]>('ai_conversations', {
    user_id: gilmarId, title: 'Próximos passos Café Aurora'
  })
  await insert('ai_messages', [
    { conversation_id: conv.id, role: 'user', content: 'Quais são os próximos passos mais importantes pro Café Aurora?' },
    { conversation_id: conv.id, role: 'assistant', content: 'Com base no projeto atual, os 3 próximos passos de maior impacto seriam:\n\n1. **Finalizar a landing page de delivery** — já tem wireframe e 40% dos conteúdos prontos\n2. **Lançar a campanha de Meta Ads** com o orçamento aprovado de R$50/dia\n3. **Concluir o setup do CRM** para capturar os leads que a campanha vai gerar\n\nEssa sequência cria um funil completo: atração → conversão → captura.', model_used: 'groq-llama3', tokens_used: 350 },
    { conversation_id: conv.id, role: 'user', content: 'E sobre o programa de fidelidade?' },
    { conversation_id: conv.id, role: 'assistant', content: 'O programa de fidelidade é estratégico para **retenção**, mas agora o foco deve ser **aquisição**.\n\nSugiro implementá-lo na Fase 2, quando já tivermos uma base de clientes recorrentes para engajar. A prioridade atual é construir o funil de aquisição primeiro.\n\nRecomendação: agendar para abril/2026, após estabilizar os primeiros 100 clientes ativos.', model_used: 'groq-llama3', tokens_used: 280 },
  ])

  // ── ACTIVITIES ──
  console.log('\n📣 Criando activities...')
  await insert('activities', [
    { user_id: gilmarId, user_name: 'Gilmar Souza', organization_id: orgId, activity_type: 'project_created', title: 'Projeto criado', description: 'Projeto "Lançamento Digital Café Aurora" criado', target_type: 'project', target_id: projectId, target_name: 'Lançamento Digital Café Aurora' },
    { user_id: gilmarId, user_name: 'Gilmar Souza', organization_id: orgId, activity_type: 'task_completed', title: 'Task concluída', description: 'Task "Definir público-alvo detalhado" concluída', target_type: 'task', target_name: 'Definir público-alvo detalhado' },
    { user_id: joaoId, user_name: 'João Pedro Alves', organization_id: orgId, activity_type: 'task_completed', title: 'Task concluída', description: 'Task "Mapear concorrentes locais" concluída', target_type: 'task', target_name: 'Mapear concorrentes locais' },
    { user_id: gilmarId, user_name: 'Gilmar Souza', organization_id: orgId, activity_type: 'report_generated', title: 'Relatório gerado', description: 'Relatório Semanal Semana 1 gerado', target_type: 'report', target_name: 'Relatório Semanal — Semana 1' },
    { user_id: joaoId, user_name: 'João Pedro Alves', organization_id: orgId, activity_type: 'time_logged', title: 'Tempo registrado', description: '3h registradas em "Landing page delivery"', target_type: 'kanban_card', target_name: 'Criar landing page de delivery' },
  ])

  // ── NOTIFICATIONS ──
  console.log('\n🔔 Criando notifications...')
  await insert('notifications', [
    { user_id: marinaId, organization_id: orgId, title: 'Nova aprovação pendente', message: '"Copy: Texto Landing Page" aguarda sua revisão', type: 'approval', category: 'action_required', action_url: '/client/approvals' },
    { user_id: gilmarId, organization_id: orgId, title: 'Aprovação concluída', message: 'Marina aprovou "Banner Meta Ads"', type: 'approval', category: 'info', read_at: '2026-02-17T15:00:00Z' },
    { user_id: joaoId, organization_id: orgId, title: 'Novo comentário', message: 'Gilmar comentou em "Landing page delivery"', type: 'comment', category: 'info' },
  ])

  // ── INBOX ITEMS ──
  console.log('\n📥 Criando inbox items...')
  await insert('inbox_items', [
    { user_id: marinaId, organization_id: orgId, item_type: 'notification', title: 'Bem-vinda ao kOS!', description: 'Seu projeto Café Aurora foi criado. Explore o Kanban para acompanhar as tarefas e o Wiki para documentação.', is_read: true, read_at: '2026-01-15T12:00:00Z', priority: 'normal' },
    { user_id: gilmarId, organization_id: orgId, item_type: 'task_assigned', title: 'Reminder: Review pendente', description: 'A landing page precisa de revisão antes do lançamento', is_read: false, priority: 'high' },
    { user_id: joaoId, organization_id: orgId, item_type: 'task_assigned', title: 'Novo assignment', description: 'Você foi adicionado ao card "Fotografia profissional dos produtos"', is_read: false, priority: 'normal', reference_type: 'kanban_card' },
  ])

  console.log('\n🎉 SEED COMPLETO! Todos os dados foram inseridos com sucesso.')
}

main().catch(err => { console.error('💥 Erro fatal:', err); process.exit(1) })
