# Configuração de Login com Google (Gmail)

Para que o botão "Entrar com Google" funcione, você precisa configurar o provedor no painel do Supabase. O código do site já está pronto!

## Passo 1: Configurar Google Cloud Platform

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um **Novo Projeto** (ex: "60 Dias Mais Perto").
3. No menu lateral, vá em **APIs e Serviços** -> **Tela de permissão OAuth**.
   - Escolha **Externo** e clique em Criar.
   - Preencha o "Nome do App" e emails de suporte.
   - Em "Domínios autorizados", adicione `supabase.co`.
   - Salve e continue.
4. Vá em **Credenciais** -> **Criar Credenciais** -> **ID do cliente OAuth**.
   - Tipo de aplicativo: **Aplicação Web**.
   - Em **Origens JavaScript autorizadas**, adicione:
     - `https://<seu-projeto-id>.supabase.co` (Seu link do Supabase)
   - Em **URIs de redirecionamento autorizados**, adicione:
     - `https://<seu-projeto-id>.supabase.co/auth/v1/callback`
   - Clique em **Criar**.
5. **Copie** o "ID do cliente" e a "Chave secreta do cliente".

## Passo 2: Ativar no Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **Authentication** -> **Providers**.
3. Clique em **Google**.
4. Ative a opção **Enable Google provider**.
5. Cole o **Client ID** e o **Client Secret** que você copiou do Google.
6. Clique em **Save**.

## Passo 3: Configurar Redirecionamento (URL Configuration)

1. Ainda no Supabase, vá em **Authentication** -> **URL Configuration**.
2. Em **Site URL**, coloque o link do seu site no Netlify (ex: `https://jardim-de-oracao.netlify.app`).
3. Em **Redirect URLs**, adicione também:
   - `https://jardim-de-oracao.netlify.app/journey`
   - `http://localhost:8080` (Para testar no seu computador)
4. Clique em **Save**.

---

**Pronto!** Agora o botão "Google" na tela de login funcionará perfeitamente.
