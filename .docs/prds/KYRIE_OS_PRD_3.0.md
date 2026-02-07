# 🟣 KYRIE OS - PRD 3.0

## Nova Interface Unificada + Kanban + Kyrie AI

---

**Versão:** 3.0  
**Data:** 31 de Janeiro de 2026  
**Status:** 🏗️ EM EXECUÇÃO  
**Autor:** Gilmar @ Kyrie Performance & Resultados  

---

> **🚀 Status da Implementação (01/02/2026):**
> 
> **✅ CONCLUÍDO:**
> - **Nova Sidebar:** Hierarquia Workspace/Clientes/Operacional implementada com Avatares.
> - **Runtime Fix (Next.js 15):** Rotas dinâmicas (`/clients/[slug]/...`) corrigidas para usar `await params`.
> - **Kanban por Cliente:** 
>     - Banco de dados (Tables + Policies).
>     - UI de Board com colunas e cards renderizando.
>     - Seed de dados iniciais para "Adega Anita's".
> - **Inbox Unificado:** Badge de contagem real implementado.
> - **Kyrie AI:** Interface de Chat funcional (Smoke Test aprovado).
> - **Wiki por Cliente:** Estrutura de páginas e listagem básica.
> 
> **🚧 EM PROGRESSO:**
> - **Kanban DnD:** Implementar persistência de movimento de cards (Drag-and-drop).
> - **Kyrie AI RAG:** Integração real com embeddings e busca vetorial.
> - **Wiki Editor:** Editor de conteúdo Markdown completo.
> 
> **⏳ PENDENTE:**
> - **Migração Trello:** Scripts de importação via API.
> - **Refinamentos UI:** Polimento visual e transições.

---

## 📋 Sumário Executivo

O PRD 3.0 transforma o Kyrie OS de um sistema funcional de gestão para uma **plataforma completa de operações** com:

1. **Nova Sidebar Hierárquica** - Inspirada no Linear, com Inbox centralizado
2. **Kanban por Cliente** - Colunas customizáveis, inspirado no Trello
3. **Kyrie AI** - Chat inteligente com RAG para consultas
4. **Wiki por Cliente** - Documentação que alimenta o RAG
5. **Migração do Trello** - Importação automática via API

### Escopo

| Incluído (PRD 3.0) | Excluído (Futuro) |
|-------------------|-------------------|
| ✅ Nova Sidebar | ❌ Sistema de Teams |
| ✅ Inbox unificado | ❌ Mensagens entre usuários |
| ✅ Kanban por cliente | ❌ AI com ações (criar tasks) |
| ✅ Kyrie AI (consultas) | ❌ Integrações Meta/Google Ads |
| ✅ Wiki por cliente | ❌ Mobile App |
| ✅ Migração Trello | ❌ White-label |

---

## 1. 🎯 Objetivos do PRD 3.0

### 1.1 Problemas a Resolver

| Problema Atual | Solução PRD 3.0 |
|----------------|-----------------|
| Tarefas gerenciadas no Trello (externo) | Kanban nativo por cliente |
| Notificações espalhadas (WhatsApp, email) | Inbox centralizado |
| Dificuldade em encontrar informações | Kyrie AI com RAG |
| Documentação perdida em pastas | Wiki integrado por cliente |
| Migração manual de dados | Importação automática do Trello |

### 1.2 Métricas de Sucesso

```yaml
Adoção:
  - 100% das tarefas gerenciadas no Kyrie OS (não mais Trello)
  - Redução de 80% no tempo buscando informações

Eficiência:
  - Inbox checado 1x/dia substitui checar 5 ferramentas
  - Kyrie AI responde 90% das perguntas operacionais

Experiência:
  - Nova sidebar com < 3 cliques para qualquer função
  - Kanban com drag-and-drop fluido
```

---

## 2. 🏗️ Arquitetura de Features

### 2.1 Nova Estrutura de Navegação

```
┌─────────────────────────────────────────────────────────────────┐
│                        KYRIE OS v3.0                            │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  SIDEBAR (240px) │              ÁREA DE CONTEÚDO                │
│                  │                                              │
│  ┌────────────┐  │  ┌────────────────────────────────────────┐  │
│  │ 🟣 KYRIE   │  │  │                                        │  │
│  └────────────┘  │  │                                        │  │
│                  │  │                                        │  │
│  📥 Inbox    (5) │  │         [Conteúdo Dinâmico]            │  │
│  📋 Meu Trabalho │  │                                        │  │
│                  │  │                                        │  │
│  ─────────────   │  │                                        │  │
│  WORKSPACE       │  │                                        │  │
│  ─────────────   │  │                                        │  │
│                  │  │                                        │  │
│  📊 Dashboard    │  │                                        │  │
│  📁 Clientes   ▼ │  │                                        │  │
│     🟡 Adega     │  │                                        │  │
│     🟠 MontMass. │  │                                        │  │
│     🟣 Libertare │  │                                        │  │
│  📈 Análises     │  │                                        │  │
│  📄 Relatórios   │  └────────────────────────────────────────┘  │
│                  │                                              │
│  ─────────────   │                                              │
│  🤖 KYRIE AI     │                                              │
│  ─────────────   │                                              │
│                  │                                              │
│  ⚙️ Config       │                                              │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### 2.2 Estrutura de Rotas

```yaml
/kyrie:
  /inbox                    # Caixa de entrada unificada
  /my-work                  # Tasks atribuídas ao usuário
  /dashboard                # Dashboard geral (já existe)
  /clients                  # Lista de clientes (já existe)
  /clients/[slug]:          # Contexto do cliente
    /overview               # Visão geral do cliente
    /kanban                 # ⭐ NOVO - Board Kanban
    /approvals              # Aprovações (já existe)
    /reports                # Relatórios do cliente
    /metrics                # Métricas/ROI do cliente
    /wiki                   # ⭐ NOVO - Documentação
  /analytics                # Análises gerais
  /reports                  # Todos os relatórios
  /ai                       # ⭐ NOVO - Chat Kyrie AI

/client:                    # Portal do Cliente (mantém separado)
  /dashboard                # Dashboard do cliente
  /reports                  # Relatórios
  /approvals                # Aprovações
  /projects                 # Projetos
```

---

## 3. 📥 Feature: Inbox Unificado

### 3.1 Descrição

O Inbox centraliza todas as notificações e itens que requerem atenção em um único lugar, eliminando a necessidade de checar múltiplas fontes.

### 3.2 Tipos de Itens no Inbox

| Tipo | Ícone | Origem | Ação |
|------|-------|--------|------|
| Notificação | 🔔 | Sistema | Marcar como lida |
| Aprovação Pendente | ✅ | approvals | Abrir aprovação |
| Task Atribuída | 📋 | tasks | Abrir task |
| Relatório Gerado | 📄 | reports | Ver relatório |
| Menção | 💬 | comments | Ver contexto |
| Alerta de Métrica | ⚠️ | client_health | Ver análise |

### 3.3 Database Schema

```sql
-- Tabela: inbox_items
CREATE TABLE inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Tipo e origem
  item_type TEXT NOT NULL CHECK (item_type IN (
    'notification',
    'approval_pending',
    'task_assigned',
    'report_generated',
    'mention',
    'metric_alert',
    'message'  -- futuro
  )),
  
  -- Referência ao item original
  reference_type TEXT, -- 'approval', 'task', 'report', 'comment'
  reference_id UUID,
  
  -- Conteúdo
  title TEXT NOT NULL,
  description TEXT,
  
  -- Contexto
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  
  -- Estado
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'
);

-- Índices
CREATE INDEX idx_inbox_user_unread ON inbox_items(user_id, is_read) WHERE NOT is_archived;
CREATE INDEX idx_inbox_user_created ON inbox_items(user_id, created_at DESC);

-- RLS
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own inbox" ON inbox_items
  FOR ALL USING (user_id = auth.uid());
```

### 3.4 Componentes

```yaml
Componentes:
  - InboxPage: /app/kyrie/inbox/page.tsx
  - InboxList: Lista de itens com filtros
  - InboxItem: Card de item individual
  - InboxFilters: Filtros (tipo, lido/não lido, cliente)
  - InboxBadge: Badge com contagem na sidebar

Funcionalidades:
  - Marcar como lido (individual/todos)
  - Arquivar itens
  - Filtrar por tipo, cliente, prioridade
  - Ordenar por data, prioridade
  - Ação rápida (abrir referência)
```

### 3.5 Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  📥 Inbox                              [Marcar todos como lido] │
├─────────────────────────────────────────────────────────────────┤
│  Filtros: [Todos ▼] [Todos os clientes ▼] [Não lidos ▼]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ● ✅ Aprovação pendente                     há 2 horas  │   │
│  │   Criativo Instagram - Promoção Janeiro                  │   │
│  │   🟡 Adega Anita's                          [Abrir →]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ○ 📄 Relatório gerado                       há 1 dia    │   │
│  │   Relatório Semanal - Semana 04                          │   │
│  │   🟠 MontMassas                             [Ver →]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ○ ⚠️ Alerta de métrica                      há 2 dias   │   │
│  │   ROI caiu 15% vs. mês anterior                          │   │
│  │   🟣 Libertare                              [Analisar →] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 📋 Feature: Kanban por Cliente

### 4.1 Descrição

Board Kanban completo com colunas customizáveis, drag-and-drop, ICE Score, e labels. Substitui completamente o Trello para gestão de tarefas.

### 4.2 Funcionalidades

```yaml
Core:
  - Board por cliente com colunas customizáveis
  - Drag-and-drop entre colunas
  - Cards com ICE Score, labels, descrição
  - Quick add de cards
  - Criação/edição/exclusão de colunas

Cards:
  - Título e descrição
  - ICE Score (Impact, Confidence, Effort)
  - Labels/Tags coloridas
  - Data de vencimento
  - Assignee (futuro)
  - Checklist (futuro)
  - Comentários (futuro)

Visualização:
  - Filtros por label, prioridade
  - Busca por texto
  - Ordenação dentro da coluna
  - Compactar/expandir cards
```

### 4.3 Database Schema

```sql
-- Tabela: kanban_columns
CREATE TABLE kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280', -- Cor do header
  icon TEXT, -- Emoji ou ícone
  
  position INTEGER NOT NULL DEFAULT 0, -- Ordem da coluna
  
  -- Configurações
  is_default BOOLEAN DEFAULT FALSE, -- Coluna padrão para novos cards
  is_done_column BOOLEAN DEFAULT FALSE, -- Marca tasks como concluídas
  wip_limit INTEGER, -- Work in Progress limit (opcional)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_kanban_columns_org ON kanban_columns(organization_id, position);

-- Tabela: kanban_cards
CREATE TABLE kanban_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
  
  -- Conteúdo
  title TEXT NOT NULL,
  description TEXT,
  
  -- Posição
  position INTEGER NOT NULL DEFAULT 0, -- Ordem dentro da coluna
  
  -- ICE Score
  ice_impact INTEGER CHECK (ice_impact BETWEEN 1 AND 10),
  ice_confidence INTEGER CHECK (ice_confidence BETWEEN 1 AND 10),
  ice_effort INTEGER CHECK (ice_effort BETWEEN 1 AND 10),
  ice_score NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN ice_effort > 0 THEN (ice_impact * ice_confidence)::NUMERIC / ice_effort
      ELSE NULL
    END
  ) STORED,
  
  -- Metadados
  labels TEXT[] DEFAULT '{}', -- Array de labels
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Referências
  project_id UUID REFERENCES projects(id), -- Vínculo opcional com projeto
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id), -- Futuro
  
  -- Importação Trello
  trello_card_id TEXT, -- ID original do Trello
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ -- Preenchido quando move para coluna done
);

-- Índices
CREATE INDEX idx_kanban_cards_column ON kanban_cards(column_id, position);
CREATE INDEX idx_kanban_cards_org ON kanban_cards(organization_id);
CREATE INDEX idx_kanban_cards_ice ON kanban_cards(ice_score DESC NULLS LAST);

-- Tabela: kanban_labels (definição de labels por organização)
CREATE TABLE kanban_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  color TEXT NOT NULL, -- Hex color
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, name)
);

-- RLS
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_labels ENABLE ROW LEVEL SECURITY;

-- Policies (Kyrie Admin vê tudo)
CREATE POLICY "Kyrie admin full access columns" ON kanban_columns
  FOR ALL USING (is_kyrie_admin(auth.uid()));

CREATE POLICY "Kyrie admin full access cards" ON kanban_cards
  FOR ALL USING (is_kyrie_admin(auth.uid()));

CREATE POLICY "Kyrie admin full access labels" ON kanban_labels
  FOR ALL USING (is_kyrie_admin(auth.uid()));
```

### 4.4 Componentes

```yaml
Páginas:
  - KanbanPage: /app/kyrie/clients/[slug]/kanban/page.tsx

Componentes:
  - KanbanBoard: Container principal com DnD context
  - KanbanColumn: Coluna individual
  - KanbanCard: Card individual
  - KanbanCardModal: Modal de edição completa
  - KanbanQuickAdd: Input inline para adicionar card
  - KanbanFilters: Barra de filtros
  - KanbanColumnSettings: Modal de configuração da coluna
  - IceScoreBadge: Badge visual do ICE Score
  - LabelBadge: Badge de label colorido

Libraries:
  - @dnd-kit/core: Drag and drop
  - @dnd-kit/sortable: Ordenação
```

### 4.5 Wireframe do Board

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🟡 Adega Anita's › Kanban                    [+ Coluna] [Filtros] [⋯]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📥 INBOX        │  📋 BACKLOG      │  🔄 EM PROGRESSO │  ✅ CONCLUÍDO     │
│  ────────────    │  ────────────    │  ────────────    │  ────────────     │
│                  │                  │                  │                    │
│  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐   │
│  │ Nova ideia │  │  │ ICE: 90    │  │  │ Gestão de  │  │  │ ✓ ID Visual│   │
│  │            │  │  │ ──────     │  │  │ Tráfego    │  │  │            │   │
│  │            │  │  │ Corrigir   │  │  │            │  │  │ 🏷️ design  │   │
│  │ 🏷️ 💡idea  │  │  │ página     │  │  │ 🏷️ mkt    │  │  │            │   │
│  └────────────┘  │  │ Sobre Nós  │  │  │ 📅 05/02   │  │  │ ✓ há 5d    │   │
│                  │  │            │  │  └────────────┘  │  └────────────┘   │
│  ┌────────────┐  │  │ 🏷️ bug    │  │                  │                    │
│  │ Gamific.   │  │  │ 📅 03/02   │  │                  │                    │
│  │ de pontos  │  │  └────────────┘  │                  │                    │
│  │            │  │                  │                  │                    │
│  │ 🏷️ 💡idea  │  │  ┌────────────┐  │                  │                    │
│  └────────────┘  │  │ ICE: 80    │  │                  │                    │
│                  │  │ ──────     │  │                  │                    │
│                  │  │ Feature    │  │                  │                    │
│                  │  │ caixa      │  │                  │                    │
│                  │  │            │  │                  │                    │
│                  │  │ 🏷️ feature │  │                  │                    │
│                  │  └────────────┘  │                  │                    │
│                  │                  │                  │                    │
│  [+ Add card]    │  [+ Add card]    │  [+ Add card]    │  [+ Add card]     │
│                  │                  │                  │                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.6 Card Detail Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  Corrigir página Sobre Nós                              [×]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Coluna: [📋 Backlog ▼]              Labels: [+ Adicionar]     │
│                                       🏷️ bug  🏷️ urgente      │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📝 Descrição                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ A página Sobre Nós está com texto placeholder. Precisa  │   │
│  │ atualizar com informações reais da empresa.             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📊 ICE Score                                                   │
│                                                                 │
│  Impact:     [████████░░] 8                                     │
│  Confidence: [█████████░] 9                                     │
│  Effort:     [████░░░░░░] 4                                     │
│                                                                 │
│  Score: 18.0  ████████████████████░░░░░░░░░                    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📅 Vencimento: [03/02/2026]                                    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [🗑️ Excluir]                                    [💾 Salvar]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 🤖 Feature: Kyrie AI

### 5.1 Descrição

Chat inteligente com RAG (Retrieval Augmented Generation) que permite consultar informações do sistema, métricas de clientes, e documentação da Wiki.

### 5.2 Capacidades (v1 - Consultas)

```yaml
Consultas de Métricas:
  - "Qual o ROI da Adega Anita's?"
  - "Quantas horas trabalhei essa semana?"
  - "Quais clientes têm risco de churn?"

Consultas de Tarefas:
  - "Quais tasks estão no backlog da MontMassas?"
  - "O que está em progresso agora?"
  - "Quais tasks vencem essa semana?"

Consultas de Documentação (Wiki):
  - "Qual o briefing da Libertare?"
  - "Quais são as personas da Adega?"
  - "Onde encontro a paleta de cores do cliente?"

Consultas de Relatórios:
  - "Resuma o último relatório da MontMassas"
  - "O que fizemos semana passada na Adega?"

Consultas Gerais:
  - "Quantos clientes ativos temos?"
  - "Qual cliente tem maior ROI?"
```

### 5.3 Arquitetura RAG

```
┌─────────────────────────────────────────────────────────────────┐
│                        KYRIE AI - RAG                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER QUERY                                                     │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────┐                                               │
│  │  Classifier │ ← Identifica tipo de consulta                 │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ├──────────────────┬──────────────────┐                │
│         ▼                  ▼                  ▼                │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐           │
│  │  Supabase  │    │   Wiki     │    │  Reports   │           │
│  │   Query    │    │ Embeddings │    │   Search   │           │
│  └─────┬──────┘    └─────┬──────┘    └─────┬──────┘           │
│        │                 │                 │                   │
│        └────────────────┬┴─────────────────┘                   │
│                         ▼                                       │
│                  ┌────────────┐                                 │
│                  │  Context   │                                 │
│                  │  Builder   │                                 │
│                  └─────┬──────┘                                 │
│                        │                                        │
│                        ▼                                        │
│                  ┌────────────┐                                 │
│                  │   Groq     │                                 │
│                  │  LLM Call  │                                 │
│                  └─────┬──────┘                                 │
│                        │                                        │
│                        ▼                                        │
│                   RESPONSE                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Database Schema

```sql
-- Tabela: ai_conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  title TEXT, -- Auto-gerado da primeira mensagem
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: ai_messages
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  
  -- Metadados da resposta
  sources JSONB DEFAULT '[]', -- [{type, id, title}]
  model_used TEXT,
  tokens_used INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id, updated_at DESC);
CREATE INDEX idx_ai_messages_conv ON ai_messages(conversation_id, created_at);

-- RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own conversations" ON ai_conversations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users see own messages" ON ai_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  );
```

### 5.5 Componentes

```yaml
Páginas:
  - KyrieAIPage: /app/kyrie/ai/page.tsx

Componentes:
  - AIChatContainer: Container principal
  - AIConversationList: Lista de conversas anteriores
  - AIMessageList: Lista de mensagens
  - AIMessage: Mensagem individual (user/assistant)
  - AIInputBar: Barra de input com sugestões
  - AISuggestions: Sugestões de perguntas
  - AISourceCard: Card de fonte citada

API:
  - POST /api/ai/chat: Enviar mensagem e receber resposta
  - GET /api/ai/conversations: Listar conversas
  - GET /api/ai/conversations/[id]: Carregar conversa
```

### 5.6 Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  🤖 Kyrie AI                                                    │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  Conversas       │  Nova Conversa                               │
│  ────────────    │                                              │
│                  │  ┌────────────────────────────────────────┐  │
│  ○ ROI Adega...  │  │ 🤖 Olá! Sou a Kyrie AI. Posso te      │  │
│  ○ Tasks sema... │  │    ajudar com:                         │  │
│  ○ Briefing Li.. │  │                                        │  │
│                  │  │    • Métricas de clientes              │  │
│  [+ Nova]        │  │    • Status de tarefas                 │  │
│                  │  │    • Documentação e briefings          │  │
│                  │  │    • Relatórios e análises             │  │
│                  │  │                                        │  │
│                  │  │    O que você quer saber?              │  │
│                  │  └────────────────────────────────────────┘  │
│                  │                                              │
│                  │  Sugestões:                                  │
│                  │  ┌──────────────────────────────────────┐   │
│                  │  │ Qual o ROI da Adega Anita's?         │   │
│                  │  └──────────────────────────────────────┘   │
│                  │  ┌──────────────────────────────────────┐   │
│                  │  │ Quais tasks vencem essa semana?      │   │
│                  │  └──────────────────────────────────────┘   │
│                  │  ┌──────────────────────────────────────┐   │
│                  │  │ Resuma o briefing da Libertare       │   │
│                  │  └──────────────────────────────────────┘   │
│                  │                                              │
│                  │  ┌────────────────────────────────────────┐  │
│                  │  │ Pergunte algo...              [🎤] [➤]│  │
│                  │  └────────────────────────────────────────┘  │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## 6. 📝 Feature: Wiki por Cliente

### 6.1 Descrição

Sistema de documentação por cliente que armazena briefings, personas, guias de marca, e qualquer documentação relevante. Alimenta o RAG da Kyrie AI.

### 6.2 Tipos de Documentos

```yaml
Briefings:
  - Briefing inicial do cliente
  - Briefing de campanha
  - Briefing de projeto específico

Marca:
  - Manual de identidade visual
  - Paleta de cores
  - Tipografia
  - Tom de voz

Estratégia:
  - Personas
  - Jornada do cliente
  - Análise de concorrentes
  - Posicionamento

Operacional:
  - Processos definidos
  - Checklists
  - Templates
```

### 6.3 Database Schema

```sql
-- Tabela: wiki_pages
CREATE TABLE wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Hierarquia
  parent_id UUID REFERENCES wiki_pages(id), -- Para subpáginas
  
  -- Conteúdo
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown
  
  -- Categorização
  category TEXT CHECK (category IN (
    'briefing',
    'brand',
    'strategy',
    'operational',
    'other'
  )),
  
  -- Metadados
  icon TEXT, -- Emoji
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Versionamento
  version INTEGER DEFAULT 1,
  
  -- Embeddings para RAG
  embedding_updated_at TIMESTAMPTZ,
  
  -- Timestamps
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, slug)
);

-- Tabela: wiki_embeddings (para RAG)
CREATE TABLE wiki_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
  
  chunk_index INTEGER NOT NULL, -- Posição do chunk
  chunk_text TEXT NOT NULL, -- Texto do chunk
  embedding VECTOR(1536), -- OpenAI embedding ou similar
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(page_id, chunk_index)
);

-- Índice para busca vetorial
CREATE INDEX idx_wiki_embeddings_vector ON wiki_embeddings 
  USING ivfflat (embedding vector_cosine_ops);

-- RLS
ALTER TABLE wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kyrie admin full access wiki" ON wiki_pages
  FOR ALL USING (is_kyrie_admin(auth.uid()));

CREATE POLICY "Kyrie admin full access embeddings" ON wiki_embeddings
  FOR ALL USING (
    page_id IN (SELECT id FROM wiki_pages)
  );
```

### 6.4 Componentes

```yaml
Páginas:
  - WikiPage: /app/kyrie/clients/[slug]/wiki/page.tsx
  - WikiEditorPage: /app/kyrie/clients/[slug]/wiki/[pageSlug]/edit/page.tsx

Componentes:
  - WikiSidebar: Navegação de páginas
  - WikiPageView: Visualização de página
  - WikiEditor: Editor Markdown
  - WikiBreadcrumb: Navegação hierárquica
  - WikiSearch: Busca em páginas

Libraries:
  - @uiw/react-md-editor: Editor Markdown
  - react-markdown: Renderização
```

### 6.5 Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  🟡 Adega Anita's › Wiki                         [+ Nova Página]│
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  📑 Páginas      │  📋 Briefing Inicial                        │
│  ────────────    │  ──────────────────────────────────────────  │
│                  │                                              │
│  📋 Briefings    │  # Sobre a Empresa                          │
│    📄 Inicial ←  │                                              │
│    📄 Campanha   │  A Adega Anita's é uma loja de bebidas      │
│                  │  localizada em Vila São Pedro, São Bernardo  │
│  🎨 Marca        │  do Campo. Fundada em 2018, atende          │
│    📄 Cores      │  principalmente o público local...          │
│    📄 Logo       │                                              │
│                  │  ## Objetivo                                 │
│  👥 Estratégia   │                                              │
│    📄 Personas   │  Aumentar o faturamento em 30% através de   │
│    📄 Jornada    │  estratégias de marketing digital e         │
│                  │  otimização operacional.                     │
│  ⚙️ Operacional  │                                              │
│    📄 Processos  │  ## Público-Alvo                            │
│                  │                                              │
│                  │  - Homens 25-45 anos                         │
│                  │  - Classe B/C                                │
│                  │  - Moradores do bairro                       │
│                  │                                              │
│                  │  ──────────────────────────────────────────  │
│                  │  Atualizado há 5 dias por Gilmar             │
│                  │                                    [✏️ Editar]│
└──────────────────┴──────────────────────────────────────────────┘
```

---

## 7. 🔄 Feature: Migração do Trello

### 7.1 Descrição

Importação automática de boards, listas e cards do Trello para o Kanban do Kyrie OS.

### 7.2 Fluxo de Migração

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIGRAÇÃO TRELLO → KYRIE OS                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. AUTENTICAÇÃO                                                │
│     │                                                           │
│     └──▶ [Conectar com Trello] → OAuth → Token salvo           │
│                                                                 │
│  2. SELEÇÃO DE BOARD                                            │
│     │                                                           │
│     └──▶ Lista boards disponíveis → Usuário seleciona          │
│                                                                 │
│  3. MAPEAMENTO                                                  │
│     │                                                           │
│     ├──▶ Board → Organização (cliente)                         │
│     ├──▶ Lists → Kanban Columns                                │
│     ├──▶ Cards → Kanban Cards                                  │
│     └──▶ Labels → Kanban Labels                                │
│                                                                 │
│  4. IMPORTAÇÃO                                                  │
│     │                                                           │
│     └──▶ Cria colunas → Cria labels → Cria cards               │
│                                                                 │
│  5. VALIDAÇÃO                                                   │
│     │                                                           │
│     └──▶ Mostra resumo → Usuário confirma                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 API Trello

```yaml
Endpoints utilizados:
  - GET /1/members/me/boards: Lista boards
  - GET /1/boards/{id}/lists: Lista listas do board
  - GET /1/boards/{id}/cards: Lista cards do board
  - GET /1/boards/{id}/labels: Lista labels do board

Dados mapeados:
  Card Trello → Card Kyrie:
    - name → title
    - desc → description
    - idList → column_id (mapeado)
    - labels[].name → labels[]
    - due → due_date
    - pos → position

  List Trello → Column Kyrie:
    - name → name
    - pos → position
```

### 7.4 Componentes

```yaml
Páginas:
  - TrelloImportPage: /app/kyrie/settings/import/trello/page.tsx

Componentes:
  - TrelloConnectButton: Botão OAuth
  - TrelloBoardSelector: Seletor de boards
  - TrelloMappingTable: Tabela de mapeamento
  - TrelloImportProgress: Progresso da importação
  - TrelloImportSummary: Resumo final

API:
  - GET /api/integrations/trello/boards: Lista boards
  - POST /api/integrations/trello/import: Executa importação
```

### 7.5 Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚙️ Configurações › Importar do Trello                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Conectar ao Trello                                          │
│     ┌───────────────────────────────────────────────────────┐  │
│     │  ✅ Conectado como gilmar@kyrie.com                   │  │
│     │                                    [Desconectar]      │  │
│     └───────────────────────────────────────────────────────┘  │
│                                                                 │
│  2. Selecionar Board                                            │
│     ┌───────────────────────────────────────────────────────┐  │
│     │  [KYRIE - Operações                              ▼]   │  │
│     └───────────────────────────────────────────────────────┘  │
│                                                                 │
│  3. Mapear para Cliente                                         │
│     ┌───────────────────────────────────────────────────────┐  │
│     │  Board: KYRIE - Operações                             │  │
│     │  ↓                                                    │  │
│     │  Cliente: [Adega Anita's                         ▼]   │  │
│     └───────────────────────────────────────────────────────┘  │
│                                                                 │
│  4. Preview                                                     │
│     ┌───────────────────────────────────────────────────────┐  │
│     │  Listas encontradas: 4                                │  │
│     │  Cards encontrados: 23                                │  │
│     │  Labels encontrados: 8                                │  │
│     └───────────────────────────────────────────────────────┘  │
│                                                                 │
│                                        [Cancelar] [Importar →] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. 📊 Cronograma de Implementação

### 8.1 Estimativa de Esforço

| Feature | Esforço | Prioridade | Dependências |
|---------|---------|------------|--------------|
| Nova Sidebar | 8-10h | P0 | - |
| Inbox | 12-15h | P1 | Sidebar |
| Kanban | 25-35h | P0 | Sidebar |
| Kyrie AI | 20-25h | P1 | Wiki (para RAG) |
| Wiki | 15-20h | P1 | Sidebar |
| Migração Trello | 10-15h | P2 | Kanban |

**Total estimado: 90-120 horas**

### 8.2 Roadmap de 6 Semanas

```yaml
Semana 1-2: Fundação
  - [x] Nova Sidebar (refatorar layout)
  - [x] Schema do Kanban
  - [x] Componentes base do Kanban
  - [x] Drag-and-drop básico

Semana 3: Kanban Completo
  - [ ] Card modal com ICE Score
  - [ ] Labels e filtros
  - [ ] Quick add
  - [ ] Colunas customizáveis

Semana 4: Inbox + Meu Trabalho
  - [x] Schema inbox_items
  - [x] Página Inbox
  - [ ] Triggers para popular inbox
  - [ ] Página Meu Trabalho

Semana 5: Wiki
  - [x] Schema wiki_pages
  - [ ] Editor Markdown
  - [x] Navegação hierárquica (básica)
  - [ ] Embeddings para RAG

Semana 6: Kyrie AI + Migração
  - [x] Chat interface
  - [ ] RAG com Wiki
  - [ ] Consultas ao Supabase
  - [ ] Importação do Trello
```

---

## 9. ✅ Checklist de Validação

### 9.1 Critérios de Aceite por Feature

```yaml
Nova Sidebar:
  - [x] Navegação responsiva
  - [x] Clientes expandíveis
  - [x] Badge de contagem no Inbox
  - [x] Destaque do item ativo

Inbox:
  - [x] Lista itens não lidos
  - [ ] Marcar como lido
  - [ ] Filtrar por tipo
  - [ ] Ação rápida funcional

Kanban:
  - [ ] Drag-and-drop fluido
  - [ ] Colunas customizáveis
  - [ ] ICE Score editável
  - [ ] Labels coloridos
  - [ ] Filtros funcionais

Kyrie AI:
  - [x] Chat funcional
  - [ ] Consultas de métricas
  - [ ] Consultas de tasks
  - [ ] RAG com Wiki

Wiki:
  - [ ] Criar/editar páginas
  - [x] Navegação hierárquica (básica)
  - [ ] Markdown renderizado
  - [ ] Busca funcional

Migração Trello:
  - [ ] OAuth funcional
  - [ ] Seleção de board
  - [ ] Mapeamento correto
  - [ ] Cards importados
```

---

## 10. 📚 Referências Técnicas

### 10.1 Libraries a Instalar

```bash
# Drag and Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Markdown Editor
npm install @uiw/react-md-editor

# Trello API (se necessário)
# Usar fetch nativo com OAuth

# Vector Embeddings (se usar localmente)
npm install openai  # ou usar Supabase pgvector
```

### 10.2 Estrutura de Arquivos (Novos)

```
app/
├── kyrie/
│   ├── inbox/
│   │   └── page.tsx
│   ├── my-work/
│   │   └── page.tsx
│   ├── ai/
│   │   └── page.tsx
│   ├── clients/
│   │   └── [slug]/
│   │       ├── kanban/
│   │       │   └── page.tsx
│   │       └── wiki/
│   │           ├── page.tsx
│   │           └── [pageSlug]/
│   │               └── edit/
│   │                   └── page.tsx
│   └── settings/
│       └── import/
│           └── trello/
│               └── page.tsx

components/
├── sidebar/
│   ├── app-sidebar.tsx (refatorar)
│   ├── sidebar-nav.tsx
│   └── inbox-badge.tsx
├── inbox/
│   ├── inbox-list.tsx
│   ├── inbox-item.tsx
│   └── inbox-filters.tsx
├── kanban/
│   ├── kanban-board.tsx
│   ├── kanban-column.tsx
│   ├── kanban-card.tsx
│   ├── kanban-card-modal.tsx
│   ├── kanban-quick-add.tsx
│   └── ice-score-badge.tsx
├── wiki/
│   ├── wiki-sidebar.tsx
│   ├── wiki-page-view.tsx
│   └── wiki-editor.tsx
└── ai/
    ├── ai-chat-container.tsx
    ├── ai-message.tsx
    └── ai-input-bar.tsx

lib/
├── ai/
│   ├── rag.ts
│   └── prompts.ts
└── integrations/
    └── trello.ts
```

---

## 11. 🎯 Métricas de Sucesso (KPIs)

```yaml
Adoção (30 dias após lançamento):
  - 100% das tarefas no Kanban Kyrie (0% no Trello)
  - Inbox checado diariamente
  - Kyrie AI usada > 5x por semana

Performance:
  - Kanban drag-and-drop < 100ms
  - Kyrie AI resposta < 5s
  - Wiki busca < 500ms

Satisfação:
  - Net Promoter Score > 8
  - Zero regressões para Trello
```

---

## 12. 🚀 Próximos Passos

1. **Aprovação do PRD** ✓
2. **Criar migration SQL** (Schema completo)
3. **Implementar Nova Sidebar**
4. **Implementar Kanban básico**
5. **Iterar e adicionar features**

---

**Documento criado em:** 31 de Janeiro de 2026  
**Autor:** Gilmar @ Kyrie Performance & Resultados  
**Versão:** 1.0  

---

*Este PRD define a transformação do Kyrie OS em uma plataforma completa de operações, eliminando a dependência de ferramentas externas como Trello e centralizando toda a gestão em um único sistema inteligente.*
