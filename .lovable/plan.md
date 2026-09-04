# Melhorar contraste e legibilidade do menu lateral no modo claro

Ajuste exclusivamente visual no menu lateral (`AppShell`) para o tema claro. Nenhuma mudança no modo escuro, funcionalidades, navegação, dados, tamanhos gerais ou outras telas.

## O que muda

- **Fundo do menu lateral**: tornar mais definido e com contraste maior em relação ao fundo da página no modo claro.
- **Textos do menu**: todos os textos (labels de navegação, e-mail, "Conectado", "Segurança da conta", botões Tema/Sair) passam para tons mais escuros e bem legíveis.
- **Ícones das seções**: mantêm as cores semânticas distintas (azul, verde, roxo, laranja, rosa, ciano, amarelo) e ganham opacidade plena para melhor visibilidade.
- **Item selecionado**: fundo de destaque mais perceptível no modo claro, mantendo a barra indicadora à esquerda e o texto/ícone na cor da seção.
- **Separação visual**: divisória entre navegação e área da conta fica mais perceptível.
- **Design moderno**: preserve o visual atual, apenas com mais contraste no tema claro.

## Técnico

- `src/styles.css`: ajustar apenas as variáveis `--sidebar-*` no bloco `:root` (fundo, texto principal, texto secundário, realce, borda, primária). O bloco `.dark` permanece inalterado.
- `src/components/app-shell.tsx`:
  - Aumentar ligeiramente o fundo dos itens ativos e do hover apenas no modo claro, sem afetar o modo escuro.
  - Remover ou reduzir a opacidade reduzida dos ícones inativos para melhorar a legibilidade.
  - Garantir que o container do `ThemeToggle` use uma cor da sidebar que contraste bem no modo claro.
- Adicionar o custom variant `light` em `src/styles.css` se necessário para aplicar regras só ao modo claro (`&:is(:not(.dark) *)`).
- Verificação: typecheck e conferência visual do menu lateral no modo claro (desktop e mobile), confirmando que o modo escuro permanece idêntico.
