-- ==========================================================
-- 🛡️ CONFIGURAÇÃO COMPLETA DA COMUNIDADE (POSTS, LIKES E FOTOS)
-- Este script cria as tabelas que faltam e libera as permissões.
-- ==========================================================

-- 1. CRIAÇÃO DAS TABELAS (Se não existirem)

-- Posts da Comunidade
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Curtidas
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, post_id)
);

-- Comentários
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SETUP DE STORAGE (FOTOS)
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-photos', 'community-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
DROP POLICY IF EXISTS "Fotos Públicas" ON storage.objects;
CREATE POLICY "Fotos Públicas" ON storage.objects FOR SELECT USING (bucket_id = 'community-photos');

DROP POLICY IF EXISTS "Upload de Fotos" ON storage.objects;
CREATE POLICY "Upload de Fotos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Update de Fotos" ON storage.objects;
CREATE POLICY "Update de Fotos" ON storage.objects FOR UPDATE USING (bucket_id = 'community-photos' AND auth.role() = 'authenticated');

-- 3. POLÍTICAS DE RLS (SEGURANÇA)

-- Posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Any1_view_posts" ON public.community_posts;
CREATE POLICY "Any1_view_posts" ON public.community_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth_create_posts" ON public.community_posts;
CREATE POLICY "Auth_create_posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Own_update_posts" ON public.community_posts;
CREATE POLICY "Own_update_posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

-- Likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Any1_view_likes" ON public.likes;
CREATE POLICY "Any1_view_likes" ON public.likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Own_manage_likes" ON public.likes;
CREATE POLICY "Own_manage_likes" ON public.likes FOR ALL USING (auth.uid() = user_id);

-- Comentários
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Any1_view_comments" ON public.comments;
CREATE POLICY "Any1_view_comments" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Own_manage_comments" ON public.comments;
CREATE POLICY "Own_manage_comments" ON public.comments FOR ALL USING (auth.uid() = user_id);

-- Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles_public" ON public.profiles;
CREATE POLICY "Profiles_public" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Own_update_profile" ON public.profiles;
CREATE POLICY "Own_update_profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 4. VERIFICAÇÃO FINAL
SELECT 'PRONTO' as status, 'Tabelas criadas e permissões liberadas!' as mensagem;
