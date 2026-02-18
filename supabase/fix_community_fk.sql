-- ==========================================================
-- 🛠️ CORREÇÃO DE RELACIONAMENTOS (JOIN PROFILES)
-- Garante que o frontend consiga buscar o perfil de quem postou.
-- ==========================================================

-- 1. ADICIONA CONSTRAINT EXPLÍCITA (Para o Supabase entender o vínculo posts -> profiles)
-- O frontend usa profiles!community_posts_user_id_fkey
ALTER TABLE public.community_posts DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;
ALTER TABLE public.community_posts 
ADD CONSTRAINT community_posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 2. GARANTE QUE O USER_ID NO PERFIL É ÚNICO (Necessário para a FK acima)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 3. REPARAÇÃO FINAL DE PERMISSÕES
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Any1_view_posts" ON public.community_posts;
CREATE POLICY "Any1_view_posts" ON public.community_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth_create_posts" ON public.community_posts;
CREATE POLICY "Auth_create_posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

SELECT 'PRONTO' as status, 'Relacionamentos corrigidos!' as mensagem;
