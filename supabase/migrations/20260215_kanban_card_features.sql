-- ============================================================
-- MIGRATION: KANBAN CARD FEATURES
-- Checklists, Comments, Attachments for Kanban Cards
-- ============================================================

-- ============================================================
-- 1. KANBAN CHECKLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.kanban_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Checklist',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kanban_checklists_card ON public.kanban_checklists(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_checklists_org ON public.kanban_checklists(organization_id);

-- RLS
ALTER TABLE public.kanban_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access checklists"
ON public.kanban_checklists FOR ALL TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

CREATE POLICY "Clients manage own org checklists"
ON public.kanban_checklists FOR ALL TO authenticated
USING (organization_id = get_user_org_id(auth.uid()))
WITH CHECK (organization_id = get_user_org_id(auth.uid()));

-- ============================================================
-- 2. KANBAN CHECKLIST ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.kanban_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES public.kanban_checklists(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kanban_checklist_items_checklist ON public.kanban_checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_kanban_checklist_items_org ON public.kanban_checklist_items(organization_id);

-- RLS
ALTER TABLE public.kanban_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access checklist items"
ON public.kanban_checklist_items FOR ALL TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

CREATE POLICY "Clients manage own org checklist items"
ON public.kanban_checklist_items FOR ALL TO authenticated
USING (organization_id = get_user_org_id(auth.uid()))
WITH CHECK (organization_id = get_user_org_id(auth.uid()));

-- ============================================================
-- 3. KANBAN CARD COMMENTS (Dedicated storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.kanban_card_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kanban_card_comments_card ON public.kanban_card_comments(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_comments_org ON public.kanban_card_comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_comments_created ON public.kanban_card_comments(created_at DESC);

-- RLS
ALTER TABLE public.kanban_card_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access comments"
ON public.kanban_card_comments FOR ALL TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

CREATE POLICY "Clients read own org comments"
ON public.kanban_card_comments FOR SELECT TO authenticated
USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Clients insert own org comments"
ON public.kanban_card_comments FOR INSERT TO authenticated
WITH CHECK (organization_id = get_user_org_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Clients update own comments"
ON public.kanban_card_comments FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Clients delete own comments"
ON public.kanban_card_comments FOR DELETE TO authenticated
USING (user_id = auth.uid() AND organization_id = get_user_org_id(auth.uid()));

-- ============================================================
-- 4. KANBAN ATTACHMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.kanban_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kanban_attachments_card ON public.kanban_attachments(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_attachments_org ON public.kanban_attachments(organization_id);

-- RLS
ALTER TABLE public.kanban_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access attachments"
ON public.kanban_attachments FOR ALL TO authenticated
USING (is_kyrie_admin(auth.uid()))
WITH CHECK (is_kyrie_admin(auth.uid()));

CREATE POLICY "Clients manage own org attachments"
ON public.kanban_attachments FOR ALL TO authenticated
USING (organization_id = get_user_org_id(auth.uid()))
WITH CHECK (organization_id = get_user_org_id(auth.uid()));

-- ============================================================
-- 5. ADD 'comment_added' TO activity_type ENUM
-- ============================================================
DO $$ BEGIN
    ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'comment_added';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 6. STORAGE BUCKET FOR ATTACHMENTS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kanban-attachments',
    'kanban-attachments',
    false,
    52428800, -- 50MB
    ARRAY['image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
          'application/pdf','application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain','text/csv',
          'application/zip','video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kanban-attachments');

CREATE POLICY "Authenticated users can read attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kanban-attachments');

CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'kanban-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE public.kanban_checklists IS 'Checklists attached to kanban cards';
COMMENT ON TABLE public.kanban_checklist_items IS 'Individual items within a kanban checklist';
COMMENT ON TABLE public.kanban_card_comments IS 'Comments/discussion on kanban cards (dedicated storage, separate from activity feed)';
COMMENT ON TABLE public.kanban_attachments IS 'File attachments on kanban cards';
