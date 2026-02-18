-- ==========================================================
-- 🚀 REPARAÇÃO DEFINITIVA (NUCLEAR) - NÃO APAGA SEU LOGIN
-- Este script adiciona o que falta e conserta o que está quebrado.
-- ==========================================================

-- 1. CONSERTO DA TABELA DE PERFIS (username e user_code)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_code TEXT UNIQUE;

-- 2. CONSERTO DO PROGRESSO (completion_date)
ALTER TABLE public.journey_progress ADD COLUMN IF NOT EXISTS completion_date DATE DEFAULT CURRENT_DATE;

-- 3. CONSERTO DO CONTEÚDO (prayer e duration_min)
ALTER TABLE public.daily_content ADD COLUMN IF NOT EXISTS prayer TEXT DEFAULT '';
ALTER TABLE public.daily_content ADD COLUMN IF NOT EXISTS duration_min INT DEFAULT 1;

-- 4. PERMISSÕES TOTAIS (RLS) - Resolve o erro de "não consigo atualizar"
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p1" ON public.profiles;
DROP POLICY IF EXISTS "p2" ON public.profiles;
CREATE POLICY "p1" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "p2" ON public.profiles FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.journey_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "j1" ON public.journey_progress;
CREATE POLICY "j1" ON public.journey_progress FOR ALL USING (auth.uid() = user_id);

-- 5. POVOAMENTO DOS 60 PASSOS (SÓ SE ESTIVER VAZIO)
-- Se você já tem os passos, o comando abaixo não vai duplicar
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
(10, 'Coração Puro', 'Um coração limpo vê Deus nas pequenas coisas.', 'Mateus 5:8', 'Peça perdão por um erro.', 'Cria em mim um coração puro.', 1),
(11, 'Âncora da Esperança', 'A esperança em Deus é uma âncora.', 'Hebreus 6:19', 'Declare: "Minha esperança está em Deus".', 'Segura minha mão.', 1),
(12, 'Escuta Atenta', 'Às vezes o melhor louvor é apenas ouvir.', 'Tiago 1:19', 'Ouça alguém com atenção total.', 'Ensina-me a ouvir.', 1),
(13, 'Coragem de Seguir', 'A coragem não é a ausência de medo.', 'Josué 1:9', 'Vença um pequeno medo hoje.', 'Não temerei.', 1),
(14, 'Beleza na Natureza', 'Olhe para o céu por um instante.', 'Salmos 19:1', 'Observe a criação por 20 segundos.', 'Tua criação é maravilhosa.', 1),
(15, 'O Poder do "Sim"', 'Dizer "sim" à vontade de Deus é liberdade.', 'Lucas 1:38', 'Aceite uma situação com paz.', 'Faça-se em mim a Tua vontade.', 1),
(16, 'Palavras que Curam', 'Suas palavras têm poder.', 'Provérbios 16:24', 'Diga algo encorajador.', 'Que minhas palavras Te honrem.', 1),
(17, 'Fé como Grão', 'Mesmo uma fé pequena move montanhas.', 'Mateus 17:20', 'Acredite em algo impossível.', 'Eu creio, Senhor.', 1),
(18, 'Olhar de Compaixão', 'Olhe para as pessoas como Jesus olharia.', 'Colossenses 3:12', 'Não julgue ninguém hoje.', 'Dá-me Teus olhos, Jesus.', 1),
(19, 'Renovo Diário', 'As misericórdias de Deus se renovam.', 'Lamentações 3:22-23', 'Esqueça um erro de ontem.', 'Obrigado por um novo começo.', 1),
(20, 'Viver com Propósito', 'Você não é um acidente.', 'Salmos 139:16', 'Pense em um talento seu.', 'Usa-me para o Teu propósito.', 1),
(21, 'Humildade Verdadeira', 'Pense menos em si mesmo.', 'Filipenses 2:3', 'Sirva alguém sem ser visto.', 'Ensina-me a ser humilde.', 1),
(22, 'Paz que Excede', 'Busque a paz que vem de dentro.', 'João 14:27', 'Respire fundo focando na paz.', 'Tua paz guarda meu coração.', 1),
(23, 'Semente de Alegria', 'A alegria do Senhor é a nossa força.', 'Neemias 8:10', 'Sorria para alguém agora.', 'Tua alegria é minha força.', 1),
(24, 'Foco no Eterno', 'Não fixe seus olhos no passageiro.', '2 Coríntios 4:18', 'Desconecte-se por 10 minutos.', 'Ajuda-me a focar no que dura.', 1),
(25, 'Justiça e Verdade', 'Andar na verdade traz paz.', 'Salmos 15:2', 'Seja totalmente honesto hoje.', 'Guia-me na retidão.', 1),
(26, 'Perdão Libertador', 'O perdão liberta o prisioneiro.', 'Efésios 4:32', 'Pense em alguém para perdoar.', 'Ajuda-me a perdoar.', 1),
(27, 'Cuidado de Deus', 'Ele cuida muito mais de você.', 'Mateus 6:26', 'Confie sua preocupação a Deus.', 'Eu sei que cuidas de mim.', 1),
(28, 'Sabedoria do Alto', 'Se falta sabedoria, peça.', 'Tiago 1:5', 'Peça direção para o seu dia.', 'Dá-me sabedoria.', 1),
(29, 'Sal da Terra', 'Sua vida dá "tempero" ao mundo.', 'Mateus 5:13', 'Seja um exemplo positivo hoje.', 'Que eu seja luz e sal.', 1),
(30, 'Metade do Caminho', 'Você chegou ao passo 30! Siga firme.', 'Filipenses 1:6', 'Revise seus objetivos de hoje.', 'Obrigado por me sustentar.', 1),
(31, 'Esperar com Fé', 'Esperar é tempo de preparação.', 'Salmos 27:14', 'Seja paciente hoje.', 'Ensina-me a esperar.', 1),
(32, 'Simplicidade', 'Valorize o essencial.', 'Marcos 6:8', 'Doe algo que não usa mais.', 'Que eu valorize o eterno.', 1),
(33, 'Poder da Oração', 'A oração muda quem ora.', '1 Tessalonicenses 5:17', 'Ore por alguém agora.', 'Obrigado por me ouvir.', 1),
(34, 'Santidade', 'Escolha o que agrada a Deus.', '1 Pedro 1:15', 'Evite um mau hábito hoje.', 'Santifica minha vida.', 1),
(35, 'Generosidade', 'Quem dá com alegria é recompensado.', '2 Coríntios 9:7', 'Faça um gesto generoso.', 'Abençoa as mãos que dão.', 1),
(36, 'Identidade', 'Você é filho amado do Rei.', '1 João 3:1', 'Declare: "Eu sou amado".', 'Obrigado por me adotar.', 1),
(37, 'Bom Combate', 'A vitória é certa em Cristo.', '2 Timóteo 4:7', 'Não desanime hoje.', 'Fortalece meu espírito.', 1),
(38, 'Mansidão', 'A palavra branda desvia o furor.', 'Provérbios 15:1', 'Responda com calma hoje.', 'Dá-me um espírito manso.', 1),
(39, 'Luz nas Trevas', 'Onde houver ódio, leve amor.', 'Mateus 5:14', 'Leve esperança a alguém.', 'Que eu reflita a Tua luz.', 1),
(40, 'Constância', 'Pequenos passos levam longe.', '1 Coríntios 15:58', 'Seja constante no bem.', 'Dá-me constância.', 1),
(41, 'Fruto do Espírito', 'Amor, alegria e paz.', 'Gálatas 5:22', 'Demonstre paciência agora.', 'Que Teu fruto cresça em mim.', 1),
(42, 'Olhar Interno', 'Deus olha para o coração.', '1 Samuel 16:7', 'Veja a alma, não as roupas.', 'Olha para o meu coração.', 1),
(43, 'Armadura', 'Proteja sua mente com a fé.', 'Efésios 6:11', 'Vista a armadura de Deus hoje.', 'Protege-me do mal.', 1),
(44, 'Fidelidade', 'Quem é fiel no pouco, é no muito.', 'Lucas 16:10', 'Faça o pequeno com amor.', 'Ensina-me a ser fiel.', 1),
(45, 'Voz Suave', 'O Espírito Santo guia você.', 'João 16:13', 'Ouça a voz suave da paz.', 'Guia-me na verdade.', 1),
(46, 'Ouro Refinado', 'As provas purificam a fé.', '1 Pedro 1:7', 'Agradeça por crescer na dor.', 'Purifica minha fé.', 1),
(47, 'Comunhão', 'Buscamos conexão com os irmãos.', 'Salmos 133:1', 'Una-se em oração com alguém.', 'Abençoa nossa união.', 1),
(48, 'Fuga do Mal', 'Afaste-se do que te faz cair.', '1 Coríntios 10:13', 'Fuja da tentação hoje.', 'Livra-me do mal.', 1),
(49, 'Gratidão Total', 'Em todo tempo, glorfique.', 'Efésios 5:20', 'Agradeça pelo dia difícil.', 'Obrigado por tudo.', 1),
(50, 'Quase no Fim', 'Deus completará a obra.', 'Filipenses 1:6', 'Faltam 10 passos! Persevere.', 'Completa em mim Teu plano.', 1),
(51, 'Unção', 'Deus te capacitou com dons.', '1 João 2:20', 'Use um dom para ajudar.', 'Que Tua unção me guie.', 1),
(52, 'Verdade Livre', 'Conhecer a verdade é ser livre.', 'João 8:32', 'Leia hoje a Bíblia.', 'Tua palavra é a verdade.', 1),
(53, 'Sacrifício', 'Louve mesmo sem vontade.', 'Hebreus 13:15', 'Cante um louvor agora.', 'Recebe meu louvor.', 1),
(54, 'Graça', 'Mostre graça a quem errou.', 'Lucas 19:10', 'Perdoe uma falha hoje.', 'Ensina-me a amar.', 1),
(55, 'Paciência', 'A paciência produz caráter.', 'Romanos 5:3-4', 'Mantenha a calma.', 'Dá-me paciência.', 1),
(56, 'Praticante', 'Não seja apenas ouvinte.', 'Tiago 1:22', 'Viva um versículo hoje.', 'Que eu viva o que creio.', 1),
(57, 'Aliança', 'Deus nunca quebra promessas.', 'Gênesis 9:16', 'Confie na promessa de Deus.', 'Tua fidelidade é eterna.', 1),
(58, 'O Vaso', 'Deixe Deus moldar você.', 'Isaías 64:8', 'Molda-me, Senhor.', 'Eu sou o barro.', 1),
(59, 'Véspera', 'Prepare o coração.', '2 Timóteo 4:7', 'Falta só um! Quase lá.', 'Obrigado por me trazer até aqui.', 1),
(60, 'Vida Plena', 'Tudo se fez novo.', '2 Coríntios 5:17', 'Comemore! Você concluiu os 60 passos.', 'Eis que tudo se fez novo.', 1)
ON CONFLICT (day_number) DO NOTHING;

-- 6. GERAÇÃO DE NOMES PARA QUEM ESTÁ SEM (Caso os perfis já existam)
UPDATE public.profiles 
SET username = 'membro_' || substr(id::text, 1, 5),
    user_code = upper(substr(md5(id::text), 1, 10))
WHERE username IS NULL;
