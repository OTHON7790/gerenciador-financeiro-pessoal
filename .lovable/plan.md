# Ordenação na tela Transações

## Objetivo
Adicionar um campo "Ordenar por" na área de filtros da página Transações, sem alterar nenhum dado, cálculo ou layout existente.

## Comportamento
Novo seletor "Ordenar por", no mesmo padrão visual dos filtros atuais (Select com label pequeno), com as opções:

- Mais recentes (padrão) — data decrescente
- Mais antigas — data crescente
- A–Z — descrição em ordem alfabética pt-BR (ignorando acentos)
- Z–A — inverso
- Maior valor — valor decrescente
- Menor valor — valor crescente

A ordenação é aplicada apenas na exibição, depois de todos os filtros já existentes (Ano/Mês, Tipo, Status, Categoria e Busca). Empates de data são resolvidos pela descrição, para manter a lista estável.

## Categorias em A–Z
A lista compartilhada de categorias já é ordenada alfabeticamente com `localeCompare` pt-BR em `src/lib/queries.ts`; o plano confirma esse comportamento no seletor de Categoria dos filtros e no diálogo de transação, sem duplicar lógica de ordenação nas telas.

## Garantias
- Nenhuma transação, valor, status, data ou recorrência é alterado.
- Cards de Receitas, Despesas pagas, Contas pendentes e Saldo realizado continuam calculados sobre a mesma lista filtrada (ordem não afeta somas).
- Nenhuma outra página é tocada.

## Detalhes técnicos
- Alteração restrita a `src/routes/_authenticated/transacoes.tsx`.
- Novo estado `ordenacao` com valor inicial `"recentes"`.
- Novo `useMemo` `ordenadas` derivado de `filtradas` (cópia com `[...]`, nunca ordenação in-place).
- Os totais passam a ser calculados sobre a mesma coleção filtrada (resultado idêntico ao atual) e a lista renderizada usa `ordenadas`.
- Comparações: datas via string `YYYY-MM-DD`, texto via `localeCompare("pt-BR", { sensitivity: "base" })`, valores numéricos diretos.

## Verificação
Abrir /transacoes no navegador, alternar as seis opções combinadas com filtros de tipo/status/categoria/busca e confirmar que apenas a ordem muda e os quatro cartões mantêm os mesmos valores.
