# Reformulação visual da página inicial pública (Finanças Pessoal)

Escopo: somente `src/routes/index.tsx` (e, se necessário, tokens já existentes em `src/styles.css` — nenhuma mudança estrutural). Nada de dados financeiros, gráficos ou prévias antes do login. Funcionalidades, rotas, autenticação e telas internas permanecem intactas.

## 1. Fundo e atmosfera
- Manter base preto/grafite: fundo `--background` escuro atual (oklch ~0.19), com o wrapper `.dark` já existente.
- Adicionar 1–2 gradientes radiais discretos de azul elétrico/ciano (`--primary` e um novo token `--glow-cyan`) atrás do hero, com opacidade baixa (8–15%) e blur grande — profundidade sem "sujar" as áreas pretas.
- Manter grandes áreas pretas puras para contraste; a página não deve parecer toda azulada.

## 2. Tipografia (mais legível, contraste alto)
- Título principal: subir para `text-5xl → text-7xl` (lg), peso 800, tracking apertado.
- "sob controle" com gradiente azul → ciano (`bg-clip-text`), texto branco forte no restante.
- Subtítulo: aumentar para `text-lg → text-2xl` e trocar o cinza apagado por um cinza-claro de alto contraste (`text-foreground/80` ou token dedicado, oklch ≥ 0.85).
- Cards: título dos recursos em negrito `text-base/text-lg`, descrição `text-sm` com contraste elevado (sem cinza fraco).
- Todo texto validado com contraste mínimo WCAG AA sobre o fundo escuro.

## 3. Hero
- Manter "Suas finanças, sob controle" e a estrutura atual (badge de privacidade, dois botões, aviso pós-login).
- Badge "Acesso exclusivo após o login" com borda sutil ciano e fundo translúcido.
- Botão principal "Criar conta grátis": vibrante, gradiente azul→ciano, sombra colorida (`shadow-primary/40`), hover com leve escala/brilho.
- Botão "Já tenho conta": secundário outline bem visível (borda clara, não apagado).
- Aviso com ícone de check verde (`--success`) em verde moderado: "Seus dados financeiros ficam protegidos e disponíveis somente após o login."

## 4. Cards de recursos (Transações, Categorias, Orçamentos, Metas, Relatórios)
- Grid compacto e moderno (5 colunas em desktop, 2 em tablet, 1 no mobile) com gap reduzido.
- Ícones maiores (`h-12 w-12` no container, `h-6 w-6` no ícone), cada um com sua cor: azul, roxo, laranja, rosa, amarelo (tokens `--nav-*` já existentes), sobre fundo translúcido da mesma cor.
- Borda com brilho muito discreto (`border-primary/20`) + `ring` fino interno translúcido.
- Hover: elevação suave (`-translate-y-1`), sombra colorida leve e borda mais luminosa, com transição de ~200ms.
- Descrições maiores e com contraste alto (conforme item 2).

## 5. Header e footer
- Header: mesmo logo e botões, apenas ajuste de contraste (texto branco mais forte, botão "Entrar" legível).
- Footer: texto elevado para contraste confortável.

## 6. Responsividade e verificação
- Sem breakpoints quebrados; testar 1280px, 768px e 390px via Playwright (screenshots).
- Confirmar que não há "R$", valores, gráficos ou prévias financeiras na home.
- Checar console/erros de runtime após as mudanças.

## Não será feito
- Nenhuma mudança em rotas, autenticação, banco, dashboard ou lógica.
- Nenhum dado financeiro (real ou fictício) na página pública.
