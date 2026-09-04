# Mais contraste e legibilidade no menu lateral (claro e escuro)

Ajuste apenas visual do menu lateral. Nada muda em dados, cálculos, navegação, filtros, login ou outras telas. O menu mobile continua com um único botão de fechar.

## Modo claro

- Fundo do menu quase branco e bem definido, separado do fundo da página por uma divisória visível.
- Textos de navegação em tom escuro forte; e-mail, "Conectado", "Segurança da conta", tema e "Sair" deixam de parecer apagados.
- Ícones mantêm as cores de cada seção (azul, verde, roxo, laranja, rosa, ciano, amarelo), em versões um pouco mais escuras para leitura sobre fundo claro.
- Item selecionado: fundo colorido suave porém nítido, texto na cor da seção e barra indicadora à esquerda.

## Modo escuro

- Fundo azul-marinho mais profundo que o restante da tela.
- Textos em branco/quase branco; textos secundários bem mais claros que hoje.
- Ícones com cores vivas; item selecionado com fundo azul mais intenso e texto totalmente legível.

## Estados e área da conta

- Hover e foco com realce perceptível nos dois temas, incluindo anel de foco visível ao navegar pelo teclado.
- Área da conta separada por divisória mais evidente; avatar, botões de tema e "Sair" com contraste reforçado.

## Técnico

- `src/styles.css`: ajustar os tokens `--sidebar*` em `:root` e em `.dark` (fundo, texto, texto secundário, realce, borda, primária) e as cores `--nav-*` usadas pelos ícones, sem tocar nos demais tokens.
- `src/components/app-shell.tsx`: aumentar opacidades de fundo ativo/hover por variante de cor, adicionar `focus-visible` com anel na sidebar, reforçar cores de texto dos itens da área inferior.
- `src/components/theme-toggle.tsx`: contraste do fundo do grupo e do botão inativo nos dois temas.
- Estrutura, rotas e o `SheetContent` do menu mobile permanecem inalterados.
- Verificação: typecheck e conferência visual do menu em claro e escuro, desktop e mobile.
