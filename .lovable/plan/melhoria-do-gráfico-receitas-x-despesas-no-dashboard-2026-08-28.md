# Melhoria do gráfico "Receitas x Despesas" no Dashboard

Somente o gráfico "Receitas x Despesas" do Dashboard (`src/routes/_authenticated/dashboard.tsx`). Nada mais muda: cartões de resumo, "Evolução financeira", transações recentes, metas, relatórios, orçamentos, banco de dados, autenticação e demais funcionalidades permanecem iguais.

## 1. Dados (fonte atual preservada)

- Continuar usando a mesma série mensal já carregada (`serieMensalQuery` + `aplicarDemo`), sem criar nenhum dado novo.
- Apenas acrescentar o campo `saldo = receitas − despesas` em cada mês, calculado a partir dos mesmos valores já exibidos nas barras.
- Como a série reage automaticamente às transações (invalidação de queries já existente), a linha do saldo acompanha qualquer criação/edição/exclusão sem código extra.

## 2. Barras mais finas e elegantes

- Trocar `BarChart` por `ComposedChart` (mesmo pacote Recharts, já usado nos Relatórios).
- Barras com `barSize={14}` (mais finas), `barGap={4}` dentro do grupo e `barCategoryGap="30%"` para aumentar o espaçamento entre os grupos de meses.
- Manter cantos arredondados no topo, `maxBarSize` removido em favor do tamanho fixo fino.
- Receitas em verde (`var(--chart-1)`) e Despesas em vermelho (`var(--chart-2)`), como já são.

## 3. Linha do Saldo (azul)

- Adicionar `Line` com `dataKey="saldo"`, cor `var(--chart-3)` (azul), traço reto, espessura ~3, pontos visíveis em cada mês (com contorno na cor do card) e ponto ampliado no hover (`activeDot`).
- A linha fica sobreposta às barras, como no gráfico equivalente da página Relatórios.

## 4. Legenda e tooltip

- Adicionar `<ChartLegend content={<ChartLegendContent />} />` com as três séries: Receitas, Despesas e Saldo (o `ChartConfig` já possui os três rótulos e cores).
- Tooltip já formata em R$ via `formatarMoeda`; garantir que mostre o mês e as três séries (incluindo o Saldo) ao passar o mouse sobre barras ou pontos.

## 5. Layout e tema

- Manter `min-w-0`/`overflow-hidden`, alturas responsivas atuais (260px mobile / 300px desktop), margens, eixo Y em R$ (`formatarMoedaEixo`) e eixo X com rótulos legíveis.
- Cores via tokens semânticos (`--chart-1/2/3`, `--card`, `--border`), preservando tema claro e escuro.

## Verificação

- Checagem de tipos (`bunx tsgo --noEmit`).
- Conferência visual do Dashboard em largura de celular e desktop: barras finas, linha azul com pontos, legenda com as três séries, tooltip em R$ e sem overflow horizontal.
