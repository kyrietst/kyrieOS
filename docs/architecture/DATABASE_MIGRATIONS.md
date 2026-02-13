# Migrations do Banco de Dados

## Migration 001: Schema Inicial (Fundação)

| Timestamp | Migration File | Description | Status |
|-----------|----------------|-------------|--------|
| 20260212 | `20260212_create_kanban_time_entries.sql` | Creates table for card-based timers with user uniqueness constraint. | Applied |
| 20240129215000 | `20240129215000_create_time_entries.sql` | (Legacy) Original time entries table. | Applied |

Esta migration cria a estrutura base para organizações, usuários e tarefas.

```sql
-- Habilita extensão p/ UUIDs
create extension if not exists "uuid-ossp";

-- ROLES (Enum)
create type user_role as enum ('KYRIE_ADMIN', 'KYRIE_TEAM', 'CLIENT_OWNER', 'CLIENT_VIEWER');

-- ORGANIZATIONS (Clientes)
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null, -- ex: 'adega-anitas'
  logo_url text,
  metadata jsonb default '{}'::jsonb, -- configurações extras
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROFILES (Extensão da tabela auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  organization_id uuid references organizations(id),
  full_name text,
  role user_role default 'CLIENT_VIEWER',
  avatar_url text,
  updated_at timestamp with time zone
);

-- PROJECTS
create table projects (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) not null,
  name text not null,
  status text check (status in ('active', 'archived', 'on_hold')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TASKS (Unificado)
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id),
  title text not null,
  description text,
  status text default 'todo', -- todo, in_progress, done
  priority text default 'medium', -- low, medium, high, urgent
  assigned_to uuid references profiles(id),
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;

-- Policies (Exemplos simplificados)
-- Admins veem tudo
create policy "Admins see all organizations"
on organizations for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'KYRIE_ADMIN'
  )
);

-- Clientes veem só sua org
create policy "Clients see own organization"
on organizations for select
to authenticated
using (
  id in (
    select organization_id from profiles
    where profiles.id = auth.uid()
  )
);
```

## Como Aplicar

1. Instale a CLI do Supabase: `npm install supabase --save-dev`
2. Login: `npx supabase login`
3. Link: `npx supabase link --project-ref <seu-project-id>`
4. Criar migration: `npx supabase migration new initial_schema`
5. Colar o SQL acima no arquivo gerado em `supabase/migrations/`
6. Push: `npx supabase db push`

## Migration 002: Master Kanban Refactor & Global Columns (2026-02-12)

Refatoração completa do sistema Kanban para suportar **Colunas Globais** e **Master View** de alta performance.

### Arquivos
- **20260213_setup_ultimate_kanban.sql**: Sets up the 12 standard columns, backfills organizations, and creates the replication trigger `sync_kanban_columns_to_all_orgs`.
- **20260212_master_kanban_refactor.sql**: Implements RLS policies for `kanban_cards` and `kanban_columns`, and creates the `master_kanban_view`.

### Principais Mudanças

#### 1. Row Level Security (RLS)
Habilitado em todas as tabelas Kanban (`kanban_cards`, `kanban_columns`, etc.).
- **Admin:** Acesso total.
- **Usuário:** Acesso apenas à sua organização (e colunas globais para leitura).

#### 2. Colunas Globais
- `kanban_columns.organization_id` agora aceita `NULL`.
- Colunas com `organization_id = NULL` são visíveis para todas as organizações.
- Migração automática de cards das colunas antigas ('todo', 'doing', 'done') para as novas globais.

#### 3. Views e RPCs
- **View `master_kanban_view`**: Agrega dados de cards, colunas e organizações.
- **RPC `get_master_kanban`**: Função otimizada para buscar dados paginados e filtrados para o painel administrativo.

```sql
-- Exemplo de chamada da RPC
SELECT * FROM get_master_kanban(
  page := 1,
  page_size := 50,
  status_filter := 'doing',
  search_text := 'Bug'
);
```
