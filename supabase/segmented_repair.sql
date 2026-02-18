-- ==========================================================
-- 🛠️ SCRIPT DE RECUPERAÇÃO SEGMENTADO (RODE CADA PARTE)
-- Este script foi desenhado para ser resiliente e dar feedback.
-- ==========================================================

-- PARTE 1: RESET DE PERMISSÕES (PARA PODER EDITAR PERFIL)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_content DISABLE ROW LEVEL SECURITY;

-- PARTE 2: ADICIONAR COLUNAS (SE NÃO EXISTIREM)
-- Se der erro aqui, por favor me mande o erro exato
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_code TEXT;
ALTER TABLE public.journey_progress ADD COLUMN IF NOT EXISTS completion_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.daily_content ADD COLUMN IF NOT EXISTS prayer TEXT DEFAULT '';
ALTER TABLE public.daily_content ADD COLUMN IF NOT EXISTS duration_min INT DEFAULT 1;

-- PARTE 3: GARANTIR CONSTRAINTS (NECESSÁRIO PARA O ON CONFLICT TRABALHAR)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'daily_content_day_number_key') THEN
        ALTER TABLE public.daily_content ADD CONSTRAINT daily_content_day_number_key UNIQUE (day_number);
    END IF;
END $$;

-- PARTE 4: POVOAMENTO (TESTE COM APENAS 10 PASSOS PRIMEIRO)
INSERT INTO public.daily_content (day_number, title, reflection, scripture, task, prayer, duration_min)
VALUES 
(1, 'Primeiro Passo', 'Deus te chamou para esta jornada por um motivo.', 'Jeremias 29:11', 'Agradeça pelo seu fôlego.', 'Senhor, obrigado por este começo.', 1),
(2, 'O Silêncio', 'No silêncio, ouvimos a voz que a correria abafa.', 'Salmos 46:10', 'Fique em silêncio absoluto agora.', 'Pai, fala ao meu coração.', 1),
(3, 'Gratidão Simples', 'A gratidão transforma o que temos em suficiente.', '1 Tessalonicenses 5:18', 'Escreva uma gratidão.', 'Obrigado, Deus, pelo simples.', 1),
(4, 'Luz no Caminho', 'Sua fé é uma lâmpada, não um holofote.', 'Salmos 119:105', 'Dê o próximo passo com confiança.', 'Guia meus pés, Senhor.', 1),
(5, 'Presença Real', 'Deus não está no seu passado ou no seu futuro; Ele está aqui.', 'Mateus 28:20', 'Respire fundo e sinta a presença.', 'Estou aqui, Senhor.', 1),
(6, 'Amor ao Próximo', 'Um pequeno gesto de bondade é um reflexo do amor de Deus.', 'Gálatas 5:14', 'Envie uma mensagem de carinho.', 'Ajuda-me a amar.', 1),
(7, 'Descanso na Alma', 'Você não precisa carregar o mundo.', 'Mateus 11:28', 'Imagine-se entregando um peso a Jesus.', 'Eu descanso em Ti, Pai.', 1),
(8, 'Força na Fraqueza', 'Quando me sinto fraco, é aí que a força de Deus se manifesta.', '2 Coríntios 12:9', 'Reconheça uma limitação hoje.', 'Tua graça me basta.', 1),
(9, 'A Semeadura', 'O que você planta em fé hoje, colherá em alegria amanhã.', 'Gálatas 6:9', 'Faça algo bom agora.', 'Dá-me perseverança.', 1),
(10, 'Coração Puro', 'Um coração limpo vê Deus nas pequenas coisas.', 'Mateus 5:8', 'Peça perdão por um erro.', 'Cria em mim um coração puro.', 1)
ON CONFLICT (day_number) DO UPDATE SET
  title = EXCLUDED.title,
  reflection = EXCLUDED.reflection,
  scripture = EXCLUDED.scripture,
  task = EXCLUDED.task;

-- PARTE 5: REATIVAR RLS COM POLÍTICAS ABERTAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_profiles" ON public.profiles;
CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.journey_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_progress" ON public.journey_progress;
CREATE POLICY "allow_all_progress" ON public.journey_progress FOR ALL USING (true) WITH CHECK (true);

-- VERIFICAÇÃO FINAL (O resultado deve aparecer no Supabase)
SELECT 'VERIFICAÇÃO' as status, 
       (SELECT count(*) FROM daily_content) as passos_carregados,
       (SELECT count(*) FROM information_schema.columns WHERE table_name = 'journey_progress' AND column_name = 'completion_date') as coluna_existe;
