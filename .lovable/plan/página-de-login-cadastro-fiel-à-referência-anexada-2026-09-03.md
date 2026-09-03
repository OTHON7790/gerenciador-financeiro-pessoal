# Página de login/cadastro fiel à referência anexada

Reescrita apenas visual de `src/components/auth-panel.tsx` (usado por `/` e `/auth`). Autenticação, banco, dados e todas as outras páginas permanecem intactos.

## Estrutura da nova tela

**Topo**
- Ícone de carteira azul + "Finanças **Pessoais**" ("Pessoais" em azul).
- Controle de modo escuro no canto direito (usa o `ThemeToggle` já existente).

**Painel esquerdo (card quase preto, borda fina, cantos arredondados)**
- Título em três linhas: "Seu dinheiro. / Seus dados. / Seu controle.", com "Seu controle." em gradiente azul → ciano → verde.
- Parágrafo de apresentação.
- Três benefícios em cards internos com ícone colorido: Visão completa (azul), Metas e objetivos (verde), Controle financeiro (roxo).
- Gráfico decorativo maior na base: barras verticais crescentes com gradiente azul/ciano/verde, linha de evolução com pontos, brilho suave e grade quadriculada discreta.
- Card sobreposto ao gráfico: "Acesso protegido — Seus dados ficam disponíveis somente após o login."

**Painel direito (card de autenticação)**
- Círculo escuro com ícone de carteira azul no topo.
- "Acesse sua conta" + "Entre para acessar seu painel financeiro e gerenciar suas finanças com segurança."
- Seletor Entrar | Criar conta em estilo de abas com linha inferior; ativa em azul.
- Campos E-mail e Senha com ícones, fundo quase preto e bordas discretas; mostrar/ocultar senha; "Lembrar de mim" e "Esqueci minha senha?".
- Botão principal ENTRAR: gradiente azul, ícone de usuário, texto grande.
- Abaixo, botão verde "CRIAR CONTA GRÁTIS" com subtexto "É rápido, fácil e seguro!", que ativa a aba de cadastro já existente.
- Sem botões Google/Microsoft/Apple (não implementados).

**Faixa inferior**
- Três blocos com ícones verde, azul e roxo: Privacidade em primeiro lugar, Acesso protegido, Disponível sempre — com os textos verdadeiros indicados.

**Rodapé**
- "© 2026 Finanças Pessoais." à esquerda e "Feito com clareza e propósito." à direita.

## Cores e acabamento

Fundo quase preto/azul-marinho muito escuro, cards praticamente opacos, bordas finas, azul elétrico, ciano, verde e detalhes roxos, tipografia branca, sombras e brilho contidos. Sem fundos claros ou cards translúcidos demais.

## Responsividade

Desktop: duas colunas nas proporções da referência. Tablet: redução proporcional. Celular: uma coluna com o painel de autenticação primeiro; faixa inferior empilhada.

## Detalhes técnicos

- Alterações restritas a `src/components/auth-panel.tsx` (mais tokens de cor em `src/styles.css` caso falte roxo/ciano/verde adequados).
- Handlers `entrar`, `cadastrar`, recuperação de senha e `sanitizarDestino` permanecem inalterados; a aba controlada passa a ser estado local para o botão verde poder alterná-la.
- Sem novas dependências, sem alterações em rotas, banco ou regras financeiras.

## Verificação

Captura do preview em desktop, tablet e celular, comparando lado a lado com a imagem de referência e conferindo que login, cadastro e recuperação continuam funcionando.
