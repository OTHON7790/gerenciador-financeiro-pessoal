# Nova página inicial com login na mesma tela

A tela de autenticação (`/auth`) já foi redesenhada no formato pedido, mas a **página inicial** (`/`) continua com o hero antigo ("Suas finanças, sob controle" + botões "Criar conta grátis" / "Já tenho conta"). É por isso que a mudança parece não ter sido aplicada. A correção é substituir a página inicial.

## O que muda

A rota `/` passa a ser a própria tela de acesso, em duas colunas:

**Esquerda (apresentação)**
- Logotipo + nome "Finanças Pessoais"
- Título em três linhas: "Seu dinheiro. / Seus dados. / Seu controle." com "Seu controle." em gradiente azul/ciano
- Texto: "Organize suas finanças, acompanhe seus objetivos e tenha clareza total da sua vida financeira."
- Três destaques: Visão completa, Metas e objetivos, Privacidade
- Elementos gráficos decorativos discretos ao fundo (barras + linha de evolução), sem dados reais ou fictícios rotulados

**Direita (card grande de acesso)**
- Título "Acesse sua conta" e subtítulo "Entre para acessar seu painel financeiro."
- Duas abas grandes e sólidas: ENTRAR (azul/ciano quando ativa) e CRIAR CONTA (verde quando ativa)
- Formulário Entrar: e-mail, senha com mostrar/ocultar, "Lembrar de mim", "Esqueci minha senha?", botão ENTRAR em largura total
- Formulário Criar conta: e-mail, senha, botão CRIAR CONTA GRÁTIS em verde
- Recuperação de senha no mesmo card, com retorno ao login

**Visual**: tema escuro (preto/azul profundo), cards azul-preto com borda levemente iluminada, azul elétrico e ciano como cores principais, verde para cadastro, textos grandes e alto contraste.

**Responsivo**: desktop em duas colunas; no celular o card de login aparece primeiro e a apresentação abaixo.

**Nome**: sempre "Finanças Pessoais" — o texto "Finanças Pessoal" some da página inicial.

## Detalhes técnicos

- Reescrever `src/routes/index.tsx` reaproveitando a estrutura visual já criada em `src/routes/auth.tsx` (formulários, abas, campos, recuperação de senha), extraindo os componentes compartilhados para `src/components/auth-panel.tsx` para evitar duplicação.
- `/auth` continua existindo e renderiza o mesmo painel; usuários já autenticados e o redirecionamento pós-login (`sanitizarDestino` → `/dashboard`) permanecem intactos.
- Metadados `head()` da rota `/` atualizados para "Finanças Pessoais".
- Sem alterações em banco de dados, regras financeiras, autenticação ou nas páginas Dashboard, Transações, Categorias, Orçamentos, Metas, Previsões e Relatórios.

## Verificação

Conferir no preview que `/` mostra o novo layout com o card de login visível de imediato, que as abas trocam os formulários, e que login, cadastro e recuperação de senha continuam funcionando.
