# Refinamento visual da tela de login/cadastro

Apenas ajustes de estilo em `src/components/auth-panel.tsx` (usado por `/` e `/auth`). Nenhuma mudança em autenticação, banco, dados ou outras páginas.

## O que muda

**Densidade (–20% a –25%)**
- Título passa de 4xl/5xl para 3xl/4xl, mantendo as três linhas e "Seu controle." em gradiente azul/ciano/verde.
- Textos, paddings e espaçamentos entre blocos reduzidos; página cabe praticamente inteira na primeira tela de um notebook comum.

**Colunas**
- Grid desktop em ~52% / 48% com conteúdo centralizado verticalmente (altura mínima de tela, sem grandes vazios).
- Tablet: mesma estrutura reduzida. Celular: uma coluna com o card de login primeiro.

**Benefícios**
- Visão completa, Metas e objetivos, Privacidade em linhas compactas, com ícones menores e sem cards volumosos.

**Gráfico decorativo**
- Altura bem menor, virando um mini painel: barras finas, linha de evolução com pequenos pontos, tom discreto para não competir com o formulário.

**Card de login (elemento principal)**
- Fundo azul-preto, borda fina azul/ciano, sombra suave, cantos arredondados, alto contraste.
- Títulos "Acesse sua conta" e "Entre para acessar seu painel financeiro." mantidos.

**Seletor Entrar / Criar conta**
- Uma única barra segmentada com duas opções de largura igual: ativa em azul/ciano (Entrar) ou verde (Criar conta); a inativa tem fundo sutil e hover, parecendo clicável.

**Campos e botão**
- E-mail, senha com mostrar/ocultar, "Lembrar de mim" e "Esqueci minha senha?" mantidos, com altura levemente menor e bordas de melhor contraste.
- Botão "ENTRAR →" em gradiente azul/ciano, altura moderada e hover discreto.

**Fundo**
- Preto/azul-marinho muito escuro com gradientes radiais discretos em azul e ciano, sem clarear nem exagerar no neon.

Nada de logins sociais, 2FA ou novos recursos.

## Detalhes técnicos

- Alterações restritas a classes Tailwind e à estrutura interna de `GraficoDecorativo` e `TabsList/TabsTrigger` em `src/components/auth-panel.tsx`.
- Tokens existentes (`primary`, `glow-cyan`, `success`, `card`, `border`) continuam sendo usados; sem cores fixas.
- Handlers `entrar`, `cadastrar`, recuperação de senha e `sanitizarDestino` permanecem intactos.

## Verificação

Conferir no preview em desktop, tablet e celular: conteúdo na primeira tela, seletor de abas funcionando, login/cadastro/recuperação inalterados e sem rolagem horizontal.
