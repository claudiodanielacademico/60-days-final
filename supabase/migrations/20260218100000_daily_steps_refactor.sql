-- AJUSTE PARA 60 PASSOS DIÁRIOS
-- Permite que o usuário complete os 60 passos todos os dias.

BEGIN;

-- 1. Modifica a tabela de progresso para incluir a data
ALTER TABLE public.journey_progress DROP CONSTRAINT IF EXISTS journey_progress_user_id_day_number_key;

-- Adiciona coluna de data (apenas a data, sem hora, para o UNIQUE)
ALTER TABLE public.journey_progress ADD COLUMN IF NOT EXISTS completion_date DATE DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC');

-- Cria restrição única: um registro por usuário, por passo, por dia
-- Primeiro limpamos duplicatas se houver (não deve haver em uma base limpa)
DELETE FROM public.journey_progress a USING public.journey_progress b
WHERE a.id > b.id 
AND a.user_id = b.user_id 
AND a.day_number = b.day_number 
AND a.completion_date = b.completion_date;

ALTER TABLE public.journey_progress ADD CONSTRAINT journey_progress_daily_unique UNIQUE (user_id, day_number, completion_date);

-- 2. Atualiza a lógica de RLS para a nova estrutura
DROP POLICY IF EXISTS "Owner Manage Progress" ON public.journey_progress;
CREATE POLICY "Owner Manage Progress" ON public.journey_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMIT;
