# Diagnóstico dos 3 problemas após a publicação

Nada foi alterado. Abaixo o que foi verificado e a causa de cada item.

## 1) Login diz "Credenciais inválidas" na versão publicada

Confirmado: **a versão publicada não recebeu as chaves de conexão com o servidor**.

- A conta othon.moraes65@gmail.com está ativa, confirmada e teve **entrada bem-sucedida hoje às 17:23** — ou seja, senha e conta estão corretas e o backend é o mesmo de sempre.
- Ao inspecionar o site publicado, os arquivos entregues ao navegador **não contêm o endereço nem a chave do servidor**; contêm apenas a mensagem de erro "Missing Supabase environment variable(s)".
- Consequência: qualquer tentativa de entrar falha antes de chegar ao servidor, e a tela mostra uma mensagem genérica de erro.
- Não há diferença de projeto entre prévia e produção: é o mesmo banco. A diferença é só que a publicação atual foi gerada quando as variáveis ainda não estavam vinculadas.
- O 2FA **não** é a causa aqui (a etapa do código só é consultada depois que a senha é aceita).

Correção: republicar depois que a vinculação estiver ativa e conferir, no site online, que os arquivos passaram a conter a configuração. Complemento recomendado: quando a configuração faltar, mostrar uma mensagem clara ("aplicativo sem configuração de servidor") em vez de "Credenciais inválidas".

Arquivos envolvidos: `src/components/auth-panel.tsx` (mensagem de erro mais precisa). Nenhuma mudança em `src/integrations/supabase/client.ts` (gerado).

## 2) Botão de tema claro/escuro não muda nada

Causa confirmada: a tela pública/login está **fixada no tema escuro**.

- O container principal da tela usa a classe `dark` fixa e cores escuras escritas diretamente (`#05070d`, `#080b13`, `#060910`).
- O botão de tema apenas liga/desliga a classe `dark` no documento; como o bloco da tela já força `dark` e usa cores fixas, nada muda visualmente.
- Também não existe aplicação do tema salvo no carregamento inicial do documento, então há piscada de tema em outras telas.

Arquivos envolvidos: `src/components/auth-panel.tsx` (remover o `dark` fixo e trocar os hex por tokens), `src/components/theme-toggle.tsx` (opcional: expor o tema atual), `src/routes/__root.tsx` (aplicar o tema salvo no carregamento), `src/styles.css` (se faltar algum token equivalente às cores fixas).

## 3) Revisão de português da tela pública/login

Problemas encontrados (nenhum corrigido ainda):

- Textos em inglês nas telas de erro e de página não encontrada: "Page not found", "The page you're looking for doesn't exist or has been moved.", "Go home", "This page didn't load", "Something went wrong on our end...", "Try again".
- Informações do site ainda com o padrão do gerador: título "Lovable App" e descrição "Lovable Generated Project".
- Idioma do documento declarado como `lang="en"` em uma aplicação em português.
- "Esqueci minha senha?" — afirmação com ponto de interrogação; o usual é "Esqueceu sua senha?".
- "Lembrar de mim" — forma mais correta: "Lembrar-me" (ou "Manter conectado").
- "Disponível sempre" — mais natural: "Sempre disponível".
- "Seus dados são seus e não são exibidos antes da autenticação." — redundante; sugerido: "Seus dados são seus e só aparecem depois que você entra."
- "Suas informações ficam disponíveis somente após autenticação." — falta artigo: "após a autenticação".
- "Criar conta grátis" aparece duas vezes na mesma aba (botão do formulário e botão abaixo do separador) — duplicidade visual.
- "Bem-vindo de volta!" ignora gênero; alternativa neutra: "Que bom te ver de novo!".
- "Feito com clareza e propósito" seguido de coração — mensagem ambígua; sugestão: "Feito com clareza e cuidado".

Arquivos envolvidos: `src/routes/__root.tsx` (idioma, título, descrição, telas de erro/404), `src/components/auth-panel.tsx` (textos do login e da apresentação), `src/routes/index.tsx` e `src/routes/auth.tsx` (descrições da página, se houver ajuste de texto).

## Ordem sugerida de execução

1. Republicar com as variáveis vinculadas e validar o login online.
2. Liberar o tema claro/escuro na tela pública.
3. Aplicar a revisão de textos em português.
