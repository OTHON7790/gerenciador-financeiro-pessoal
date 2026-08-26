# Refresh visual do Gerenciador Financeiro

Objetivo: deixar o app mais moderno, colorido e agradável, mantendo layout, funcionalidades, regras de negócio e dados exatamente como estão. Nenhuma alteração de banco, server functions ou lógica.

## Paleta semântica (tokens)

Definir no design system (`src/styles.css`, em oklch, claro e escuro):

- `primary` — azul vibrante (ações, navegação ativa, foco)
- `success` / `success-foreground` / `success-muted` — verde para receitas e saldo positivo
- `danger`(coral/vermelho) — despesas, alertas e saldo negativo
- `warning` — amarelo/laranja para atenção
- `background` — cinza levemente azulado; `card` branco puro
- `border` mais discreto, `shadow-soft` e `shadow-card` para elevação suave
- `chart-1..5` realinhados à nova paleta (azul, verde, coral, âmbar, roxo suave)

Nenhuma cor fixa nova em componentes: tudo via tokens, com contraste verificado em claro/escuro.

## Onde aplica

- **Shell** (`app-shell.tsx`): sidebar com fundo levemente azulado, item ativo com azul primário e leve destaque, hover suave, marca com ícone em gradiente sutil.
- **Dashboard**: cards de Saldo/Receitas/Despesas com ícone em círculo colorido (azul/verde/coral) e sombra suave; gráficos usando os novos tokens de chart.
- **Transações**: badges de receita (verde) e despesa (coral) padronizados por token; linhas com hover mais agradável.
- **Categorias**: cards mais arredondados, chip de cor da categoria com anel suave.
- **Relatórios**: pizza e barras com a nova paleta de charts, legendas legíveis.
- **Orçamentos** — indicador progressivo por percentual gasto:
  - < 70% → verde
  - 70%–99% → amarelo/laranja
  - ≥ 100% → vermelho/coral (texto "Estourou" em vermelho, como já existe)
  A barra de progresso e o texto de percentual passam a usar essa mesma escala. O cálculo de percentual/estouro permanece o atual.
- **Auth / reset-password / landing**: mesma paleta e estilo de card/botão para consistência.
- **Botões e inputs**: cantos consistentes, transição suave, foco visível com anel azul.

## Detalhes técnicos

- Tokens adicionados em `:root` e `.dark` e registrados em `@theme inline` (`--color-success`, `--color-warning`, `--color-danger`, etc.).
- Substituir usos diretos como `text-emerald-600`, `bg-red-500`, `[&>div]:bg-red-500` pelos utilitários semânticos correspondentes.
- Sem mudanças em `src/lib/*.functions.ts`, queries, schemas ou migrações.
- Responsividade preservada (grids e breakpoints atuais inalterados).
- Verificação: typecheck e conferência visual das páginas autenticadas em desktop e mobile.
