# 🚀 PRD 2.0: KYRIE OS - FEATURES AVANÇADAS - [PARTIAL / IN PROGRESS]

> **Audit Status (2026-01-30):**
>
> - **✅ Approvals System:** Partially Implemented. UI exists
>   (`ClientApprovalsPage`) and fetches from `approvals` table.
> - **⚠️ Business Calculator:** "Shell" Implementation.
>   `calculateBusinessMetrics` exists but uses static logic, not the full
>   Agent/LLM integration described.
> - **❌ Notifications:** Not Implemented (Only basic email utility exists, no
>   smart notification system).
> - **✅ Real Dashboard Metrics:** Frontend IS using real data! (Verified
>   `AdminDashboard` and `ClientDashboard` fetching from Supabase). The previous
>   "hardcoded" status was incorrect.

## Product Requirements Document

**Versão:** MVP 2.0 (Automação + Inteligência + Produção)\
**Data:** 30 de Janeiro de 2026\
**Autor:** Gilmar (Kyrie Performance & Resultados)\
**Dependência:** PRD 1.2 (Concluído ✅)\
**Status:** In Progress

---

## 📋 ÍNDICE

1. [Contexto e Evolução](#1-contexto-e-evolução)
2. [Objetivos do PRD 2.0](#2-objetivos-do-prd-20)
3. [Feature 1: Sistema de Aprovações](#3-feature-1-sistema-de-aprovações)
4. [Feature 2: Business Calculator Agent](#4-feature-2-business-calculator-agent)
5. [Feature 3: Dashboard Cliente Completo](#5-feature-3-dashboard-cliente-completo)
6. [Feature 4: Notificações Inteligentes](#6-feature-4-notificações-inteligentes)
7. [Feature 5: Deploy em Produção](#7-feature-5-deploy-em-produção)
8. [Roadmap de Execução](#8-roadmap-de-execução)
9. [Critérios de Sucesso](#9-critérios-de-sucesso)

---

## 1. CONTEXTO E EVOLUÇÃO

### 1.1 O Que Foi Entregue (PRD 1.0 → 1.2)

```yaml
PRD 1.0 - Fundação:
  ✅ Estrutura Next.js + Supabase
  ✅ Autenticação com roles (KYRIE_ADMIN, CLIENT_OWNER)
  ✅ Layout Admin vs Cliente

PRD 1.1 - Coração + Cérebro:
  ✅ Kyrie Time Tracker (nativo)
  ✅ Integração Groq/Gemini para IA
  ✅ LangGraph para fluxos de agente

PRD 1.2 - Conexão Total:
  ✅ Database completo (11 tabelas)
  ✅ Portal do Cliente funcional
  ✅ Persistência de relatórios
  ✅ Admin Dashboard com dados reais
```

### 1.2 Estado Atual do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    KYRIE OS - ESTADO ATUAL                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FUNCIONAL (100%):                                              │
│  ├── Auth + RBAC                                                │
│  ├── Time Tracker                                               │
│  ├── Geração de Relatórios (IA)                                 │
│  ├── Portal Admin (Dashboard, Clientes, Insights, Aprovações)   │
│  └── Portal Cliente (Dashboard, Relatórios, Projetos, Aprovações)│
│                                                                  │
│  PARCIAL (Seed Data / Mock):                                    │
│  ├── Health Scores (estático, não calculado)                    │
│  ├── Business Metrics (manual, não automático)                  │
│  └── Insights (mockados)                                        │
│                                                                  │
│  FUNCIONAL (100%):                                              │
│  ├── Sistema de Aprovações                                      │
│  ├── Business Calculator Agent                                  │
│  ├── Notificações (email/WhatsApp)                              │
│  ├── Chat com IA                                                │
│  └── Deploy em Produção                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Visão do PRD 2.0

O PRD 2.0 transforma o Kyrie OS de um **MVP funcional** para uma **plataforma de
produção** com:

1. **Automação** - Fluxos de aprovação que eliminam WhatsApp
2. **Inteligência** - Agentes que calculam ROI e detectam anomalias
3. **Comunicação** - Notificações proativas para clientes
4. **Escala** - Deploy em produção para clientes reais

---

## 2. OBJETIVOS DO PRD 2.0

### 2.1 Objetivo Principal

**Transformar o Kyrie OS em uma plataforma de produção que automatiza 80% da
comunicação cliente-consultoria e fornece inteligência de negócio em tempo
real.**

### 2.2 Entregáveis Específicos

```yaml
ENTREGÁVEL 1: Sistema de Aprovações
  - Fila de aprovações para criativos/copies
  - Upload de arquivos (imagens, PDFs)
  - Feedback estruturado do cliente
  - Histórico de versões

ENTREGÁVEL 2: Business Calculator Agent
  - Cálculo automático de ROI
  - Detecção de anomalias
  - Previsões de performance
  - Recomendações proativas

ENTREGÁVEL 3: Dashboard Cliente Completo
  - Métricas reais (não mock)
  - Gráficos de evolução
  - ROI visual
  - Download de relatórios

ENTREGÁVEL 4: Notificações Inteligentes
  - Email transacional (relatórios, aprovações)
  - Integração WhatsApp (opcional)
  - Alertas de anomalias

ENTREGÁVEL 5: Deploy em Produção
  - Frontend: Vercel
  - Backend: Render/Railway
  - Domínio personalizado
  - SSL/HTTPS
```

### 2.3 O Que NÃO Entra (PRD 3.0+)

```yaml
OUT OF SCOPE:
  ❌ Chat em tempo real com IA
  ❌ App mobile nativo
  ❌ Integração com Meta Ads API
  ❌ Integração com Google Ads API
  ❌ Multi-tenancy completo (white-label)
  ❌ Gamificação avançada
```

---

## 3. FEATURE 1: SISTEMA DE APROVAÇÕES

### 3.1 Problema que Resolve

```
HOJE (Caótico):
├── Gilmar cria criativo no Canva
├── Envia pelo WhatsApp para cliente
├── Cliente responde "ok" ou "muda isso"
├── Gilmar perde histórico
├── Não sabe o que foi aprovado/rejeitado
└── Zero rastreabilidade

COM APROVAÇÕES (Organizado):
├── Gilmar faz upload no Kyrie OS
├── Cliente recebe notificação
├── Cliente aprova/rejeita com feedback estruturado
├── Sistema salva histórico de versões
├── Relatório mostra taxa de aprovação
└── 100% rastreável
```

### 3.2 Database Schema

```sql
-- ============================================================
-- MIGRATION: APPROVALS SYSTEM
-- ============================================================

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
    -- Exemplo: [{"url": "...", "name": "criativo-v1.png", "type": "image/png", "size": 123456}]
    
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

-- Índices
CREATE INDEX idx_approvals_org ON public.approvals(organization_id);
CREATE INDEX idx_approvals_project ON public.approvals(project_id);
CREATE INDEX idx_approvals_status ON public.approvals(status);
CREATE INDEX idx_approvals_created_by ON public.approvals(created_by);
CREATE INDEX idx_approvals_due_date ON public.approvals(due_date);

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

CREATE INDEX idx_approval_history_approval ON public.approval_history(approval_id);

-- RLS
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- Políticas: Admin vê tudo, Cliente vê só da sua org
CREATE POLICY "Admins can manage all approvals"
ON public.approvals FOR ALL
TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

CREATE POLICY "Clients view own approvals"
ON public.approvals FOR SELECT
TO authenticated
USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Clients can update own approvals"
ON public.approvals FOR UPDATE
TO authenticated
USING (organization_id = get_user_org_id(auth.uid()))
WITH CHECK (organization_id = get_user_org_id(auth.uid()));
```

### 3.3 Interface do Admin

**Página:** `/kyrie/approvals`

```tsx
// Funcionalidades:
// 1. Lista de aprovações pendentes (todas as orgs)
// 2. Criar nova aprovação
// 3. Upload de arquivos
// 4. Definir prazo
// 5. Ver histórico de feedback
```

**Componentes necessários:**

- `ApprovalsList` - Lista com filtros por status/cliente
- `CreateApprovalModal` - Form de criação com upload
- `ApprovalCard` - Card com preview e ações
- `ApprovalTimeline` - Histórico de versões

### 3.4 Interface do Cliente

**Página:** `/client/approvals`

```tsx
// Funcionalidades:
// 1. Lista de itens pendentes de aprovação
// 2. Visualizar conteúdo (imagem, PDF, texto)
// 3. Aprovar com um clique
// 4. Rejeitar com feedback obrigatório
// 5. Pedir revisão com comentários
```

**Fluxo do Cliente:**

```
1. Vê badge "3 pendentes" no menu
2. Abre /client/approvals
3. Clica no item
4. Vê preview do criativo
5. Clica "Aprovar" ou "Pedir Ajustes"
6. Se ajustes: escreve feedback
7. Gilmar recebe notificação
```

### 3.5 Supabase Storage

```yaml
Bucket: approvals
Estrutura:
  /approvals
  /{organization_id}
  /{approval_id}
  /v1
  - criativo.png
  - copy.txt
  /v2
  - criativo-revisado.png
```

---

## 4. FEATURE 2: BUSINESS CALCULATOR AGENT

### 4.1 Problema que Resolve

```
HOJE:
├── Gilmar calcula ROI manualmente no Excel
├── Cliente pergunta "qual meu ROI?" no WhatsApp
├── Gilmar precisa parar tudo pra calcular
├── Dados desatualizados
└── Sem previsões

COM CALCULATOR AGENT:
├── IA calcula ROI automaticamente
├── Cliente vê ROI em tempo real no dashboard
├── Sistema detecta anomalias ("ROI caiu 20%!")
├── Previsões: "Se manter, ROI será 5.2x no próximo mês"
└── Recomendações: "Aumentar budget em 15% pode elevar ROI para 6x"
```

### 4.2 Arquitetura do Agente

```python
# api/agents/business_calculator.py

from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Optional

class CalculatorState(TypedDict):
    organization_id: str
    
    # Dados coletados
    revenue: float
    ad_spend: float
    consultancy_fee: float
    new_customers: int
    
    # Cálculos
    roi: float
    cac: float  # Custo de Aquisição de Cliente
    ltv: float  # Lifetime Value estimado
    
    # Análises
    anomalies: List[dict]
    predictions: dict
    recommendations: List[str]
    
    # Output
    health_score: int
    report_markdown: str

# Nodes do Agente:
# 1. fetch_metrics - Busca dados do Supabase
# 2. calculate_roi - Calcula ROI e outras métricas
# 3. detect_anomalies - Identifica variações anormais
# 4. generate_predictions - Previsão para próximo mês
# 5. create_recommendations - Sugestões de ação
# 6. update_health_score - Atualiza score do cliente
# 7. save_results - Salva no Supabase
```

### 4.3 Fórmulas de Cálculo

```yaml
ROI (Return on Investment):
  formula: (revenue - ad_spend) / consultancy_fee
  exemplo: (100000 - 1500) / 1500 = 65.67x

CAC (Custo de Aquisição de Cliente):
  formula: (ad_spend + consultancy_fee) / new_customers
  exemplo: (1500 + 1500) / 50 = R$ 60 por cliente

LTV (Lifetime Value):
  formula: avg_ticket * avg_purchases_per_year * avg_retention_years
  exemplo: R$ 30 * 12 * 2 = R$ 720

Health Score (0-100):
  componentes:
    - ROI trend (30%)
    - Engagement (20%)
    - Payment history (20%)
    - Growth rate (30%)
```

### 4.4 Detecção de Anomalias

```yaml
Anomalias Detectadas:
  - ROI caiu mais de 15% vs mês anterior
  - CAC subiu mais de 20%
  - Novos clientes caiu mais de 25%
  - Conversão abaixo da média do setor

Ações Automáticas:
  - Alerta para Gilmar (email/notificação)
  - Flag no dashboard do cliente
  - Sugestão de reunião de alinhamento
```

### 4.5 Endpoint da API

```python
# POST /api/ai/calculate-business
{
    "organization_id": "uuid",
    "period_month": 1,
    "period_year": 2026
}

# Response
{
    "success": true,
    "metrics": {
        "roi": 65.67,
        "cac": 60.00,
        "health_score": 85
    },
    "anomalies": [
        {"type": "warning", "message": "CAC subiu 18% vs dezembro"}
    ],
    "predictions": {
        "next_month_roi": 68.5,
        "confidence": 0.75
    },
    "recommendations": [
        "Considerar aumento de 10% no budget de Meta Ads",
        "Testar novo público lookalike baseado em compradores recentes"
    ]
}
```

---

## 5. FEATURE 3: DASHBOARD CLIENTE COMPLETO

### 5.1 Problema que Resolve

```
HOJE:
├── Dashboard com dados mockados
├── Cliente não vê ROI real
├── Sem gráficos de evolução
└── Não consegue baixar relatórios

COM DASHBOARD COMPLETO:
├── ROI calculado em tempo real
├── Gráficos interativos (Recharts)
├── Comparativo mês a mês
├── Download de relatórios em PDF/Markdown
└── Alertas de anomalias visíveis
```

### 5.2 Componentes do Dashboard

```yaml
Seção 1: KPIs Principais
  - ROI Atual (com indicador de tendência)
  - Faturamento do Mês
  - Novos Clientes
  - Taxa de Conversão

Seção 2: Gráfico de Evolução (últimos 6 meses)
  - Linha: Faturamento
  - Linha: ROI
  - Barras: Novos Clientes

Seção 3: Health Score
  - Gauge visual (0-100)
  - Breakdown dos componentes
  - Dicas de melhoria

Seção 4: Alertas e Recomendações
  - Cards de anomalias detectadas
  - Sugestões da IA

Seção 5: Ações Rápidas
  - Ver Relatórios
  - Ver Aprovações Pendentes
  - Agendar Reunião
```

### 5.3 Implementação

```tsx
// app/client/dashboard/page.tsx

export default async function ClientDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Buscar organização do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, organizations(*)")
    .eq("id", user.id)
    .single();

  const orgId = profile?.organization_id;

  // Buscar métricas dos últimos 6 meses
  const { data: metrics } = await supabase
    .from("business_metrics")
    .select("*")
    .eq("organization_id", orgId)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false })
    .limit(6);

  // Buscar health score atual
  const { data: health } = await supabase
    .from("client_health")
    .select("*")
    .eq("organization_id", orgId)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .single();

  // Buscar aprovações pendentes
  const { count: pendingApprovals } = await supabase
    .from("approvals")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("status", "pending");

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <ClientKPICards metrics={metrics?.[0]} />

      {/* Gráfico de Evolução */}
      <MetricsChart data={metrics} />

      {/* Health Score */}
      <HealthScoreGauge health={health} />

      {/* Alertas */}
      {health?.insights && <AlertsSection insights={health.insights} />}

      {/* Ações Rápidas */}
      <QuickActions pendingApprovals={pendingApprovals} />
    </div>
  );
}
```

---

## 6. FEATURE 4: NOTIFICAÇÕES INTELIGENTES

### 6.1 Tipos de Notificação

```yaml
EMAIL (Resend/SendGrid):
  Transacionais:
    - Novo relatório disponível
    - Nova aprovação pendente
    - Aprovação expirada (lembrete)
    - Anomalia detectada

  Periódicos:
    - Resumo semanal (domingos)
    - Relatório mensal (dia 1)

WHATSAPP (Evolution API - Opcional):
  - Lembrete de aprovação urgente
  - Alerta de anomalia crítica
  - Confirmação de reunião

IN-APP:
  - Badge no menu (aprovações pendentes)
  - Toast de sucesso/erro
  - Bell icon com lista de notificações
```

### 6.2 Database Schema

```sql
-- Tabela de notificações
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

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read_at);
```

### 6.3 Serviço de Email (Resend)

```typescript
// lib/notifications/email.ts

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApprovalNotification(
  to: string,
  approvalTitle: string,
  approvalUrl: string,
) {
  await resend.emails.send({
    from: "Kyrie OS <noreply@kyrie.com.br>",
    to,
    subject: `📋 Nova aprovação pendente: ${approvalTitle}`,
    html: `
      <h2>Você tem uma nova aprovação pendente!</h2>
      <p><strong>${approvalTitle}</strong></p>
      <p>Clique abaixo para revisar e aprovar:</p>
      <a href="${approvalUrl}" style="
        background: #7c3aed;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
      ">Ver Aprovação</a>
    `,
  });
}

export async function sendWeeklyReport(
  to: string,
  reportUrl: string,
  summary: string,
) {
  await resend.emails.send({
    from: "Kyrie OS <noreply@kyrie.com.br>",
    to,
    subject: "📊 Seu relatório semanal está pronto!",
    html: `
      <h2>Relatório Semanal</h2>
      <p>${summary}</p>
      <a href="${reportUrl}">Ver Relatório Completo</a>
    `,
  });
}
```

---

## 7. FEATURE 5: DEPLOY EM PRODUÇÃO

### 7.1 Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────────────┐
│                    KYRIE OS - PRODUÇÃO                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FRONTEND (Vercel)                                              │
│  ├── app.kyrie.com.br                                           │
│  ├── Next.js 14 (App Router)                                    │
│  ├── Edge Functions                                             │
│  └── CDN Global                                                 │
│                                                                  │
│  BACKEND (Render/Railway)                                       │
│  ├── api.kyrie.com.br                                           │
│  ├── FastAPI + Uvicorn                                          │
│  ├── Auto-scaling                                               │
│  └── Health checks                                              │
│                                                                  │
│  DATABASE (Supabase)                                            │
│  ├── PostgreSQL gerenciado                                      │
│  ├── Auth + RLS                                                 │
│  ├── Storage (arquivos)                                         │
│  └── Realtime (futuro)                                          │
│                                                                  │
│  AI (Groq Cloud)                                                │
│  ├── llama-3.3-70b-versatile                                    │
│  └── Rate limits adequados                                      │
│                                                                  │
│  EMAIL (Resend)                                                 │
│  └── Transacional + Marketing                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Variáveis de Ambiente (Produção)

```env
# .env.production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Backend
NEXT_PUBLIC_API_URL=https://api.kyrie.com.br

# AI
GROQ_API_KEY=xxx

# Email
RESEND_API_KEY=xxx

# Analytics (opcional)
NEXT_PUBLIC_POSTHOG_KEY=xxx
```

### 7.3 Checklist de Deploy

```yaml
PRÉ-DEPLOY:
  [ ] Testes E2E passando
  [ ] Variáveis de ambiente configuradas
  [ ] Domínio DNS apontando
  [ ] SSL certificado
  [ ] Backup do banco
  
DEPLOY FRONTEND (Vercel):
  [ ] Conectar repositório GitHub
  [ ] Configurar variáveis de ambiente
  [ ] Deploy automático na main
  [ ] Configurar domínio personalizado
  
DEPLOY BACKEND (Render):
  [ ] Criar Web Service
  [ ] Configurar Dockerfile ou start command
  [ ] Variáveis de ambiente
  [ ] Health check endpoint
  [ ] Auto-deploy da branch main
  
PÓS-DEPLOY:
  [ ] Testar login/logout
  [ ] Testar geração de relatório
  [ ] Testar upload de arquivos
  [ ] Monitoramento ativo
  [ ] Alertas configurados
```

---

## 8. ROADMAP DE EXECUÇÃO

### 8.1 Visão Geral (4 Semanas)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRD 2.0 - TIMELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SEMANA 1: Sistema de Aprovações                                │
│  ══════════════════════════════                                 │
│  Dia 1-2: Database + Storage                                    │
│  Dia 3-4: Backend (upload, CRUD)                                │
│  Dia 5-6: Frontend Admin                                        │
│  Dia 7: Frontend Cliente + Testes                               │
│                                                                  │
│  SEMANA 2: Business Calculator Agent                            │
│  ════════════════════════════════                               │
│  Dia 1-2: LangGraph Agent                                       │
│  Dia 3-4: Fórmulas + Anomalias                                  │
│  Dia 5-6: Endpoint API                                          │
│  Dia 7: Integração com Dashboard                                │
│                                                                  │
│  SEMANA 3: Dashboard + Notificações                             │
│  ═══════════════════════════════                                │
│  Dia 1-3: Dashboard Cliente Completo                            │
│  Dia 4-5: Sistema de Notificações                               │
│  Dia 6-7: Integração Resend (email)                             │
│                                                                  │
│  SEMANA 4: Deploy + Polish                                      │
│  ═════════════════════════                                      │
│  Dia 1-2: Deploy Vercel (frontend)                              │
│  Dia 3-4: Deploy Render (backend)                               │
│  Dia 5-6: Testes E2E em produção                                │
│  Dia 7: Documentação + Onboarding                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Estimativa de Esforço

| Feature               | Horas Estimadas | Complexidade |
| --------------------- | --------------- | ------------ |
| Sistema de Aprovações | 20-25h          | 🟡 Média     |
| Business Calculator   | 15-20h          | 🟡 Média     |
| Dashboard Completo    | 10-15h          | 🟢 Baixa     |
| Notificações          | 10-15h          | 🟢 Baixa     |
| Deploy Produção       | 8-12h           | 🟢 Baixa     |
| **TOTAL**             | **63-87h**      |              |

### 8.3 Dependências e Ordem

```yaml
Ordem de Implementação:
  1. Dashboard Cliente (base para visualizar dados)
  2. Business Calculator (gera dados para dashboard)
  3. Sistema de Aprovações (feature independente)
  4. Notificações (depende de aprovações)
  5. Deploy (após tudo testado)
```

---

## 9. CRITÉRIOS DE SUCESSO

### 9.1 Definição de "Pronto"

```yaml
SISTEMA DE APROVAÇÕES:
  ✅ Admin consegue criar aprovação com upload
  ✅ Cliente vê lista de pendentes
  ✅ Cliente aprova/rejeita com feedback
  ✅ Histórico de versões funciona
  ✅ Notificação enviada ao criar

BUSINESS CALCULATOR:
  ✅ ROI calculado automaticamente
  ✅ Anomalias detectadas
  ✅ Health Score atualizado
  ✅ Recomendações geradas pela IA

DASHBOARD CLIENTE:
  ✅ KPIs com dados reais (não mock)
  ✅ Gráfico de evolução funciona
  ✅ Health Score visual
  ✅ Download de relatório funciona

NOTIFICAÇÕES:
  ✅ Email enviado para nova aprovação
  ✅ Email enviado para novo relatório
  ✅ Badge in-app funciona
  ✅ Lista de notificações acessível

DEPLOY:
  ✅ Frontend acessível em app.kyrie.com.br
  ✅ Backend acessível em api.kyrie.com.br
  ✅ SSL funcionando
  ✅ Login/logout em produção OK
  ✅ Geração de relatório em produção OK
```

### 9.2 Métricas de Validação

| Métrica              | Meta           |
| -------------------- | -------------- |
| Aprovações E2E       | 100% funcional |
| Tempo de cálculo ROI | < 5s           |
| Uptime produção      | > 99%          |
| Emails entregues     | > 95%          |
| Testes E2E passando  | 100%           |

### 9.3 Riscos e Mitigações

| Risco                | Probabilidade | Mitigação                  |
| -------------------- | ------------- | -------------------------- |
| Rate limit Groq      | Média         | Fallback para Gemini       |
| Upload grande demora | Baixa         | Limite de 10MB, compressão |
| Email vai para spam  | Média         | Configurar SPF/DKIM        |
| Custo de infra       | Baixa         | Começar com free tiers     |

---

## 10. CONCLUSÃO

### 10.1 O Que Este PRD Entrega

O PRD 2.0 transforma o Kyrie OS de um MVP funcional para uma **plataforma de
produção** com:

1. **Automação** - Sistema de aprovações elimina WhatsApp caótico
2. **Inteligência** - Calculator Agent fornece ROI e insights em tempo real
3. **Comunicação** - Notificações proativas mantêm clientes engajados
4. **Escala** - Deploy em produção permite onboarding de novos clientes

### 10.2 Impacto para a Kyrie

```yaml
ANTES (MVP 1.2):
  - Sistema interno funcional
  - Dados reais mas visualização limitada
  - Comunicação ainda via WhatsApp
  - Apenas desenvolvimento local

DEPOIS (MVP 2.0):
  - Plataforma completa de produção
  - Inteligência de negócio automatizada
  - Comunicação centralizada no sistema
  - Pronto para escalar clientes
```

### 10.3 Próximos Passos

Após aprovação do PRD 2.0:

1. **Priorizar:** Qual feature começar primeiro?
2. **Alocar:** Definir tempo semanal para desenvolvimento
3. **Executar:** Seguir o roadmap de 4 semanas

---

**Kyrie OS PRD 2.0 - Features Avançadas**

_"De MVP para Plataforma. De local para produção."_

**LET'S SCALE THIS! 🚀💜**
