# Guia de Deploy no Netlify 🚀

Como o seu projeto usa **Vite** e **Supabase**, aqui estão os passos exatos para colocar o seu site no ar.

## Opção 1: Pelo GitHub (Recomendado)
Esta é a melhor forma, pois toda vez que você atualizar o código, o site atualiza sozinho.

1.  Suba seu código para um repositório no **GitHub**.
2.  No Netlify, clique em **"Add new site"** -> **"Import an existing project"**.
3.  Conecte com seu GitHub e selecione o repositório.
4.  **Configurações de Build:**
    - **Build command:** `npm run build`
    - **Publish directory:** `dist`
5.  **IMPORTANTE (Variáveis de Ambiente):**
    - Clique em **"Site settings"** -> **"Environment variables"**.
    - Adicione as duas variáveis que estão no seu arquivo `.env`:
        - `VITE_SUPABASE_URL`: (Seu link do Supabase)
        - `VITE_SUPABASE_PUBLISHABLE_KEY`: (Sua chave anon)

## Opção 2: Manual (Arrastar e Soltar)
Use esta opção se quiser apenas ver o site funcionando rápido sem configurar o GitHub.

1.  No terminal do seu computador (dentro da pasta do projeto), rode:
    ```bash
    npm run build
    ```
2.  Isso vai criar uma pasta chamada **`dist`**.
3.  Vá ao site do **Netlify**, faça login e vá na aba **"Sites"**.
4.  Lá embaixo, arraste a pasta **`dist`** para dentro da área de upload.
5.  **Atenção:** Se usar este método, você ainda precisará ir em **Site settings** -> **Environment variables** e adicionar as chaves do Supabase, senão o app não conseguirá "falar" com o banco de dados.

---

### ⚠️ Dica para rotas (React Router)
Como você usa o `react-router-dom`, se você der F5 em uma página interna (ex: /journey) no Netlify, pode dar erro 404. Para resolver:

1.  Crie um arquivo chamado **`_redirects`** dentro da pasta `public`.
2.  Escreva apenas isso dentro dele:
    ```text
    /*  /index.html  200
    ```
3.  O Netlify vai entender que deve redirecionar tudo para o seu app React.
