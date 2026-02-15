-- Create kanban_card_members junction table
create table if not exists public.kanban_card_members (
    card_id uuid not null references public.kanban_cards(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (card_id, user_id)
);

-- Add RLS policies
alter table public.kanban_card_members enable row level security;

create policy "Users can view card members in their organizations"
    on public.kanban_card_members for select
    using (
        exists (
            select 1 from public.kanban_cards c
            where c.id = kanban_card_members.card_id
            and exists (
                select 1 from public.profiles p
                where p.organization_id = c.organization_id
                and p.id = auth.uid()
            )
        )
    );

create policy "Users can manage card members in their organizations"
    on public.kanban_card_members for all
    using (
        exists (
            select 1 from public.kanban_cards c
            where c.id = kanban_card_members.card_id
            and exists (
                select 1 from public.profiles p
                where p.organization_id = c.organization_id
                and p.id = auth.uid()
            )
        )
    );

-- Migrate existing data from assigned_to column
-- Note: existing assigned_to is a UUID, so we can insert directly
insert into public.kanban_card_members (card_id, user_id)
select id, assigned_to
from public.kanban_cards
where assigned_to is not null
on conflict (card_id, user_id) do nothing;
