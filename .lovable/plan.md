# Identidade visual por cor — Menu lateral e cards de resumo

Alteração exclusivamente visual. Nenhuma mudança em banco de dados, server functions, cálculos, filtros Ano + Mês, gráficos ou dados cadastrados.

## 1. Novos tokens de cor (`src/styles.css`)

Adicionar tokens semânticos para as cores que ainda não existem, definidos em `:root` (claro) e `.dark`, e registrados em `@theme inline`:

- `nav-purple` (roxo — Categorias) → reutiliza a família do `chart-5`
- `nav-pink` (rosa — Metas) → novo token
- `nav-cyan` (ciano/azul claro — Previsões) → novo token
- `nav-yellow` (amarelo — Relatórios) → novo token, distinto do laranja `warning`

Também reutilizar tokens existentes: `primary`/`chart-3` (azul), `success` (verde), `warning` (laranja).

Cores em oklch, com variantes mais claras no tema escuro para garantir contraste do texto/ícone sobre fundo escuro.

## 2. Menu lateral (`src/components/app-shell.tsx`)

- Cada item do `NAV` recebe uma `cor` semântica própria:
  - Dashboard — azul · Transações — verde · Categorias — roxo · Orçamentos — laranja · Metas — rosa · Previsões — ciano · Relatórios — amarelo
- Ícone do item sempre na sua cor (mesmo sem seleção, com opacidade levemente reduzida no estado inativo).
- **Item selecionado**: fundo suave na mesma cor do ícone (cor/12–15%), ícone e texto na cor com contraste reforçado, mantendo a barra indicadora à esquerda e o texto legível (no tema escuro usa a variante clara do token).
- **Hover**: fundo translúcido da própria cor (cor/8%), sem mudar o layout.
- Mobile (topbar + Sheet) recebe o mesmo tratamento via `NavLinks`, que já é compartilhado.

## 3. Cards de resumo — paleta consistente

Mesma cor por conceito em todas as páginas:

| Conceito | Cor |
|---|---|
| Saldo | azul (`primary`) |
| Receitas | verde (`success`) |
| Despesas | vermelho/coral (`danger`) |
| Orçamento / Previsto | laranja (`warning`) |
| Disponível / Restante | ciano (`nav-cyan`) |
| Realizado / Gasto | roxo (`nav-purple`) |

Aplicação (sempre com fundo suave cor/10, ícone em círculo com cor/12 e valor na cor — saturação contida):

- **Dashboard** (`dashboard.tsx`): cards Saldo, Receitas, Despesas já usam esse padrão; apenas alinhar aos tokens acima.
- **Orçamentos** (`orcamentos.tsx`): card "Resumo do mês" — Total orçado (laranja), Total gasto (roxo), Restante (ciano), Utilizado mantém a escala progressiva verde/amarelo/vermelho atual.
- **Previsões** (`previsoes.tsx`): cards Receitas previstas (verde), Despesas previstas (laranja), Gastos reais (vermelho), Saldo projetado (azul, vermelho quando negativo) — trocando as classes fixas (`text-emerald-600` etc.) por tokens semânticos.
- **Metas e Relatórios**: apenas garantir que valores positivos/negativos e destaques usem os mesmos tokens verde/vermelho/azul.

Substituir usos de cores fixas (`text-emerald-600`, `text-blue-600`, `bg-red-100` etc.) pelos tokens nos trechos tocados, sem alterar lógica de status/níveis.

## 4. Verificação

- Typecheck limpo.
- Conferência visual em desktop e mobile, nos temas claro e escuro, das páginas Dashboard, Orçamentos, Previsões, Metas e Relatórios.
- Confirmar que filtros Ano + Mês, gráficos e dados continuam idênticos.
