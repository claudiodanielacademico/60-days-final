-- SOLUÇÃO DEFINITIVA DE RECUPERAÇÃO (TOTAL)
-- Este script reconstrói as tabelas base, sementeia os dados e repara perfis.

BEGIN;

-- 1. Garante que a tabela base de conteúdo existe
CREATE TABLE IF NOT EXISTS public.daily_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INT NOT NULL UNIQUE CHECK (day_number >= 1 AND day_number <= 60),
  title TEXT NOT NULL,
  scripture TEXT NOT NULL,
  reflection TEXT NOT NULL,
  task TEXT NOT NULL,
  prayer TEXT NOT NULL DEFAULT '',
  duration_min INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read daily content" ON public.daily_content;
CREATE POLICY "Anyone can read daily content" ON public.daily_content FOR SELECT USING (true);

-- 2. Popula os 60 dias (Semente Base)
TRUNCATE public.daily_content CASCADE;

INSERT INTO public.daily_content (day_number, title, reflection, scripture, task, prayer, duration_min) VALUES
(1, 'Primeiro Passo', 'Deus te chamou para esta jornada por um motivo. Apenas esteja aqui hoje.', 'Jeremias 29:11', 'Agradeça pelo seu fôlego.', 'Senhor, obrigado por este começo.', 1),
(2, 'O Silêncio', 'No silêncio, ouvimos a voz que a correria abafa. Faça uma pausa de 30 segundos agora.', 'Salmos 46:10', 'Fique em silêncio absoluto agora.', 'Pai, fala ao meu coração.', 1),
(3, 'Gratidão Simples', 'A gratidão transforma o que temos em suficiente. Liste uma coisa pequena pela qual é grato.', '1 Tessalonicenses 5:18', 'Escreva uma gratidão.', 'Obrigado, Deus, pelo simples.', 1),
(4, 'Luz no Caminho', 'Sua fé é uma lâmpada, não um holofote. Ela ilumina apenas o próximo passo.', 'Salmos 119:105', 'Dê o próximo passo com confiança.', 'Guia meus pés, Senhor.', 1),
(5, 'Presença Real', 'Deus não está no seu passado ou no seu futuro; Ele está no aqui e agora.', 'Mateus 28:20', 'Respire fundo e sinta a presença.', 'Estou aqui, Senhor.', 1),
(6, 'Amor ao Próximo', 'Um pequeno gesto de bondade pode ser o milagre de alguém hoje.', 'Gálatas 5:14', 'Envie uma mensagem de carinho a alguém.', 'Ajuda-me a amar como Tu amas.', 1),
(7, 'Descanso na Alma', 'Você não precisa carregar o mundo. Entregue seu fardo hoje.', 'Mateus 11:28', 'Imagine-se entregando um peso a Jesus.', 'Eu descanso em Ti, Pai.', 1),
(8, 'Força na Fraqueza', 'Quando me sinto fraco, é aí que a força de Deus se manifesta em mim.', '2 Coríntios 12:9', 'Reconheça uma limitação hoje.', 'Tua graça me basta.', 1),
(9, 'A Semeadura', 'O que você planta em fé hoje, colherá em alegria amanhã. Continue plantando.', 'Gálatas 6:9', 'Faça algo bom, mesmo sem ver resultado.', 'Dá-me perseverança, Senhor.', 1),
(10, 'Coração Puro', 'Um coração limpo vê Deus nas pequenas coisas do cotidiano.', 'Mateus 5:8', 'Peça perdão por um erro recente.', 'Cria em mim um coração puro.', 1),
(11, 'Âncora da Esperança', 'A esperança em Deus é uma âncora que não deixa nossa alma naufragar.', 'Hebreus 6:19', 'Declare: "Minha esperança está em Deus".', 'Segura minha mão na tempestade.', 1),
(12, 'Escuta Atenta', 'Às vezes o melhor louvor é apenas ouvir o que o Criador tem a dizer.', 'Tiago 1:19', 'Ouça alguém com atenção total hoje.', 'Ensina-me a ouvir, Senhor.', 1),
(13, 'Coragem de Seguir', 'A coragem não é a ausência de medo, mas a confiança de que Deus vai à frente.', 'Josué 1:9', 'Vença um pequeno medo hoje.', 'Não temerei, pois Estás comigo.', 1),
(14, 'Beleza na Natureza', 'Olhe para o céu por um instante. A criação proclama a glória de Deus.', 'Salmos 19:1', 'Observe uma planta ou o céu por 20 segundos.', 'Tua criação é maravilhosa.', 1),
(15, 'O Poder do "Sim"', 'Dizer "sim" à vontade de Deus é o caminho para a verdadeira liberdade.', 'Lucas 1:38', 'Aceite uma situação difícil com paz.', 'Faça-se em mim a Tua vontade.', 1),
(16, 'Palavras que Curam', 'Suas palavras têm poder. Use-as para construir e não para destruir.', 'Provérbios 16:24', 'Diga algo encorajador a um estranho ou amigo.', 'Que minhas palavras Te honrem.', 1),
(17, 'Fé como Grão', 'Mesmo uma fé bem pequena pode mover grandes montanhas em sua vida.', 'Mateus 17:20', 'Acredite em algo impossível hoje.', 'Eu creio, Senhor.', 1),
(18, 'Olhar de Compaixão', 'Olhe para as pessoas como Jesus olharia: com olhos de pura compaixão.', 'Colossenses 3:12', 'Não julgue alguém que você encontrar hoje.', 'Dá-me Teus olhos, Jesus.', 1),
(19, 'Renovo Diário', 'As misericórdias de Deus se renovam a cada manhã. Comece de novo.', 'Lamentações 3:22-23', 'Esqueça um erro cometido ontem.', 'Obrigado por um novo começo.', 1),
(20, 'Viver com Propósito', 'Você não é um acidente. Cada dia de sua vida foi planejado por Deus.', 'Salmos 139:16', 'Pense em um talento que você tem.', 'Usa-me para o Teu propósito.', 1),
(21, 'Humildade Verdadeira', 'A humildade não é pensar menos de si, mas pensar menos em si mesmo.', 'Filipenses 2:3', 'Sirva alguém sem esperar reconhecimento.', 'Ensina-me a ser humilde de coração.', 1),
(22, 'Paz que Excede', 'Busque a paz que vem de dentro, aquela que o mundo não pode tirar.', 'João 14:27', 'Respire fundo 3 vezes focando na paz.', 'Tua paz guarda meu coração.', 1),
(23, 'Semente de Alegria', 'A alegria do Senhor é a nossa força para enfrentar qualquer desafio.', 'Neemias 8:10', 'Sorria para alguém agora.', 'Tua alegria é minha força.', 1),
(24, 'Foco no Eterno', 'Não fixe seus olhos no que é passageiro, mas no que dura para sempre.', '2 Coríntios 4:18', 'Desconecte-se das redes por 10 minutos.', 'Ajuda-me a focar no que importa.', 1),
(25, 'Justiça e Verdade', 'Andar na verdade é o único caminho para viver uma vida em paz.', 'Salmos 15:2', 'Seja totalmente honesto em uma conversa.', 'Guia-me no caminho da retidão.', 1),
(26, 'Perdão Libertador', 'O perdão é uma chave que liberta o prisioneiro: e esse prisioneiro era você.', 'Efésios 4:32', 'Pense em alguém para perdoar hoje.', 'Ajuda-me a perdoar como perdoaste.', 1),
(27, 'Cuidado de Deus', 'Se Deus cuida dos passarinhos, Ele cuida muito mais de você.', 'Mateus 6:26', 'Confie a Deus sua maior preocupação agora.', 'Eu sei que cuidas de mi.', 1),
(28, 'Sabedoria do Alto', 'Se falta sabedoria, peça a Deus. Ele dá com generosidade a todos.', 'Tiago 1:5', 'Peça direção para uma decisão difícil.', 'Dá-me sabedoria, Senhor.', 1),
(29, 'Sal da Terra', 'Sua vida deve dar "tempero" e sentido ao mundo ao seu redor.', 'Mateus 5:13', 'Seja o exemplo positivo em seu ambiente.', 'Que eu seja luz e sal hoje.', 1),
(30, 'Metade do Caminho', 'Você chegou ao dia 30! Celebre o quanto você cresceu até aqui.', 'Filipenses 1:6', 'Lembre-se do seu primeiro dia nesta jornada.', 'Obrigado por me sustentar até aqui.', 1),
(31, 'Esperar com Fé', 'Esperar não é perder tempo, é tempo de preparação para o novo.', 'Salmos 27:14', 'Seja paciente em uma fila ou espera.', 'Ensina-me a esperar o Teu tempo.', 1),
(32, 'Simplicidade de Cristo', 'Jesus viveu de forma simples. Valorize o essencial e desapegue do resto.', 'Marcos 6:8', 'Doe algo que você não usa mais.', 'Que eu valorize o que é eterno.', 1),
(33, 'O Poder da Oração', 'A oração não muda Deus, ela muda quem ora e abre portas nos céus.', '1 Tessalonicenses 5:17', 'Faça uma oração relâmpago por alguém.', 'Obrigado por me ouvir sempre.', 1),
(34, 'Andar em Santidade', 'Santidade é escolher o que agrada a Deus, mesmo quando é difícil.', '1 Pedro 1:15', 'Evite um mau hábito hoje.', 'Santifica minha vida, Pai.', 1),
(35, 'Generosidade Radical', 'Quem dá com alegria recebe uma recompensa que o dinheiro não compra.', '2 Coríntios 9:7', 'Faça um gesto generoso inesperado.', 'Abençoa as mãos que dão.', 1),
(36, 'Identidade em Deus', 'Você é filho amado do Rei. Nunca esqueça o seu real valor.', '1 João 3:1', 'Olhe no espelho e diga: "Eu sou amado".', 'Obrigado por me adotar como filho.', 1),
(37, 'Combater o Bom Combate', 'A vida espiritual é uma luta constante. Não desista, a vitória é certa.', '2 Timóteo 4:7', 'Não desanime diante de um obstáculo.', 'Fortalece meu espírito para lutar.', 1),
(38, 'Mansa Resposta', 'A palavra branda desvia o furor. Escolha a mansidão hoje.', 'Provérbios 15:1', 'Responda com calma a um tom grosseiro.', 'Dá-me um espírito manso, Jesus.', 1),
(39, 'Luz nas Trevas', 'Onde houver ódio, leve amor. Onde houver escuridão, seja luz.', 'Mateus 5:14', 'Leve uma palavra de esperança a um triste.', 'Que eu reflita a Tua luz.', 1),
(40, 'Constância é Chave', 'Pequenos passos diários levam a grandes destinos espirituais.', '1 Coríntios 15:58', 'Complete a tarefa de hoje com excelência.', 'Dá-me constância em seguir-Te.', 1),
(41, 'Fruto do Espírito', 'O amor, a alegria e a paz são frutos que Deus cultiva em você.', 'Gálatas 5:22', 'Demonstre paciência hoje.', 'Que Teu fruto cresça em mim.', 1),
(42, 'Ver Além das Aparências', 'O homem vê o exterior, mas Deus olha direto para o coração.', '1 Samuel 16:7', 'Tente ver a alma por trás do comportamento.', 'Ajuda-me a não julgar pelo que vejo.', 1),
(43, 'Armadura de Deus', 'Proteja sua mente e seu coração com a verdade e a fé todos os dias.', 'Efésios 6:11', 'Imagine-se vestindo a armadura de Deus.', 'Protege-me do mal, Senhor.', 1),
(44, 'Fidelidade nas Pequenas', 'Quem é fiel no pouco, também será fiel no muito. Valorize o hoje.', 'Lucas 16:10', 'Faça uma tarefa pequena com muito amor.', 'Ensina-me a ser fiel nos detalhes.', 1),
(45, 'Voz da Consciência', 'O Espírito Santo guia seus passos. Ouça a voz suave dentro de você.', 'João 16:13', 'Pare e ouça sua intuição guiada pela fé.', 'Guia-me em toda a verdade.', 1),
(46, 'Ouro Refinado', 'As provações servem para purificar nossa fé como o ouro no fogo.', '1 Pedro 1:7', 'Agradeça por um desafio que te fez crescer.', 'Purifica minha fé, Senhor.', 1),
(47, 'Comunhão Real', 'Não fomos feitos para viver sozinhos. Busque conexão com os irmãos.', 'Salmos 133:1', 'Diga algo bom para um membro da igreja.', 'Abençoa nossa união em Ti.', 1),
(48, 'Fugir da Tentação', 'Às vezes, a maior vitória é simplesmente se afastar do que nos faz cair.', '1 Coríntios 10:13', 'Identifique um gatilho e afaste-se dele.', 'Livra-me da tentação, Pai.', 1),
(49, 'Gratidão por Tudo', 'Em todo tempo e situação, encontre um motivo para glorificar a Deus.', 'Efésios 5:20', 'Agradeça por algo difícil que ensinou algo.', 'Senhor, obrigado por tudo.', 1),
(50, 'Reta Final', 'Faltam apenas 10 dias! Deus tem completado uma obra linda em você.', 'Filipenses 1:6', 'Compartilhe sua jornada com um amigo.', 'Completa em mim o que começaste.', 1),
(51, 'Unção de Deus', 'Deus te capacitou com dons únicos. Use-os para edificar o Reino.', '1 João 2:20', 'Use um talento seu para ajudar alguém.', 'Que a Tua unção repouse em mim.', 1),
(52, 'Verdade que Liberta', 'Conhecer a verdade de Cristo é a única forma de ser livre de verdade.', 'João 8:32', 'Leia um versículo e medite nele hoje.', 'Tua palavra é a verdade.', 1),
(53, 'Sacrifício de Louvor', 'Louve a Deus mesmo quando não tiver vontade. Isso é adoração.', 'Hebreus 13:15', 'Cante um hino ou louvor agora.', 'Recebe meu louvor, Senhor.', 1),
(54, 'O Olhar de Jesus', 'Jesus olhava para os pecadores com amor, não com condenação.', 'Lucas 19:10', 'Mostre graça a alguém que errou.', 'Ensina-me a amar como Jesus.', 1),
(55, 'Paciência na Prova', 'A paciência produz caráter, e o caráter produz esperança constante.', 'Romanos 5:3-4', 'Mantenha a calma em um imprevisto.', 'Dá-me paciência de Jó.', 1),
(56, 'Viver a Palavra', 'Não seja apenas ouvinte, mas praticante de tudo o que você aprende.', 'Tiago 1:22', 'Pratique um ensino de Jesus hoje.', 'Que eu viva o que eu prego.', 1),
(57, 'Aliança Eterna', 'Deus nunca quebra Suas promessas. Ele é fiel até o fim dos tempos.', 'Gênesis 9:16', 'Lembre-se de uma promessa bíblica.', 'Tua fidelidade é eterna.', 1),
(58, 'O Vaso e o Oleiro', 'Deixe Deus moldar sua vida como um oleiro molda o barro em suas mãos.', 'Isaías 64:8', 'Abra mão de um desejo pessoal hoje.', 'Molda-me conforme o Teu querer.', 1),
(59, 'Quase Lá', 'Amanhã é o dia 60! Prepare seu coração para uma nova fase.', '2 Timóteo 4:7', 'Faça um balanço de como sua fé mudou.', 'Obrigado por me trazer até aqui.', 1),
(60, 'Nova Criatura', 'Parabéns! Você completou 60 dias mais perto de Deus. Tudo se fez novo.', '2 Coríntios 5:17', 'Comemore sua vitória com uma oração.', 'Eis que tudo se fez novo em mim.', 1);

-- 3. Cria e Popula a Biblioteca Anual (Correto)
CREATE TABLE IF NOT EXISTS public.daily_content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id INT NOT NULL CHECK (version_id >= 1 AND version_id <= 365),
  step_number INT NOT NULL CHECK (step_number >= 1 AND step_number <= 60),
  title TEXT NOT NULL,
  scripture TEXT NOT NULL,
  reflection TEXT NOT NULL,
  task TEXT NOT NULL,
  prayer TEXT NOT NULL DEFAULT '',
  duration_min INT NOT NULL DEFAULT 1,
  seasonal_theme TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(version_id, step_number)
);

TRUNCATE public.daily_content_library CASCADE;

-- Insere conteúdo base na Versão 1
INSERT INTO public.daily_content_library (version_id, step_number, title, reflection, scripture, task, prayer, duration_min, seasonal_theme)
SELECT 1, day_number, title, reflection, scripture, task, prayer, duration_min, 'Renewal' FROM public.daily_content;

-- Popula o restante das 365 versões
DO $$
DECLARE v_id INT; theme TEXT;
BEGIN
    FOR v_id IN 2..365 LOOP
        IF v_id BETWEEN 1 AND 31 THEN theme := 'Renewal';
        ELSIF v_id BETWEEN 32 AND 59 THEN theme := 'Friendship';
        ELSIF v_id BETWEEN 60 AND 90 THEN theme := 'Faith';
        ELSIF v_id BETWEEN 91 AND 120 THEN theme := 'Easter';
        ELSIF v_id BETWEEN 121 AND 151 THEN theme := 'Family';
        ELSIF v_id BETWEEN 152 AND 181 THEN theme := 'Community';
        ELSIF v_id BETWEEN 182 AND 212 THEN theme := 'Persistence';
        ELSIF v_id BETWEEN 213 AND 243 THEN theme := 'Strength';
        ELSIF v_id BETWEEN 244 AND 273 THEN theme := 'Creation';
        ELSIF v_id BETWEEN 274 AND 304 THEN theme := 'Joy';
        ELSIF v_id BETWEEN 305 AND 334 THEN theme := 'Gratitude';
        ELSE theme := 'Christmas';
        END IF;

        INSERT INTO public.daily_content_library (version_id, step_number, title, reflection, scripture, task, prayer, duration_min, seasonal_theme)
        SELECT v_id, step_number, title || ' (' || theme || ')', reflection, scripture, task, prayer, duration_min, theme
        FROM public.daily_content_library WHERE version_id = 1
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 4. Repara Perfis e Gatilho
DO $$
DECLARE user_rec RECORD;
BEGIN
    FOR user_rec IN SELECT id, email, raw_user_meta_data->>'display_name' as d_name FROM auth.users WHERE id NOT IN (SELECT user_id FROM public.profiles)
    LOOP
        INSERT INTO public.profiles (user_id, display_name, username, user_code)
        VALUES (user_rec.id, COALESCE(user_rec.d_name, 'Usuário'), 'user_'||substr(user_rec.id::text, 1, 5), 'CODE'||substr(user_rec.id::text, 1, 6))
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;

COMMIT;
