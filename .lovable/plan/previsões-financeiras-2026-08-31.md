# Previsões Financeiras

Nova seção que compara o que foi planejado (orçamentos) com o que realmente aconteceu (transações), mês a mês, usando apenas dados reais já cadastrados.

## Navegação e período
- Novo item "Previsões" no menu lateral, rota `/previsoes`.
- Seletores separados de Ano (2026–2030) e Mês (Janeiro a Dezembro), com as setas anterior/próximo e virada automática de ano — o mesmo padrão da tela de Orçamentos.

## Cards de resumo (mês selecionado)
- **Receitas previstas**: média das receitas reais dos meses do ano que já têm receita lançada. Se o mês já tem receita real, mostra o valor real. Sem nenhuma receita no ano: "Sem dados".
- **Despesas previstas**: soma dos limites de orçamento do mês. Sem orçamentos: "Sem dados".
- **Gastos reais**: soma das despesas lançadas no mês.
- **Saldo projetado**: receitas previstas − despesas previstas (quando não há orçamento no mês, usa os gastos reais). Negativo aparece em vermelho com alerta.

## Gráfico "Evolução das previsões"
Gráfico de linhas com os 12 meses do ano selecionado e quatro séries: Receitas (verde), Despesas previstas (laranja tracejada), Gastos reais (vermelho) e Saldo projetado (azul). Tooltip em BRL, eixo em formato de moeda, legenda clicável, linha-guia no mês selecionado. Meses sem dados ficam em zero/vazios, sem valores inventados.

## Resumo mensal Previsto x Realizado
Tabela abaixo do gráfico com uma linha por mês do ano: Previsto (orçado), Realizado (gastos reais), Diferença e % utilizado, com badge de situação seguindo os níveis já usados nos orçamentos:
- abaixo de 70%: Controle (verde)
- 70–89%: Atenção (amarelo)
- 90–99%: Alerta (vermelho)
- 100%+: Excedido (vermelho forte)
- sem orçamento no mês: "Sem dados"

Indicadores adicionais: aviso quando o saldo projetado do mês for negativo e quando as despesas reais do mês subirem significativamente (acima de ~30%) em relação ao mês anterior.

## Detalhes técnicos
- Nova server function `previsaoAnual` em `src/lib/previsoes.functions.ts`: recebe `{ ano }`, lê transações do ano (agrupadas por mês, receita/despesa) e todos os orçamentos dos 12 meses `YYYY-MM`, e retorna por mês `{ mes, receitaReal, despesaReal, orcado, temTransacoes, temOrcamento }`. Somente leitura, com `requireSupabaseAuth`.
- `previsaoAnualQuery(ano)` em `src/lib/queries.ts` (queryKey `["previsoes", ano]`).
- Nova rota `src/routes/_authenticated/previsoes.tsx` com `head()` próprio, loader usando `ensureQueryData` e `useSuspenseQuery` no componente; derivações (média de receita, saldo projetado, status) calculadas no cliente com `useMemo`.
- Item de menu adicionado em `src/components/app-shell.tsx` (ícone `TrendingUp`).
- Reuso dos componentes e tokens existentes (Card, Badge, Recharts `ComposedChart`/`LineChart`, `formatarMoeda`), layout responsivo igual ao resto do app.

## Fora do escopo
Nenhuma migração de banco, nenhuma escrita de dados, nenhuma alteração em Transações, Orçamentos, Categorias, Metas, Dashboard ou Relatórios.
