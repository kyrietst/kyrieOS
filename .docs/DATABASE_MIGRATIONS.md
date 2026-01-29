# Migrations do Banco de Dados

## Migration 001: Schema Inicial (Fundação)

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
