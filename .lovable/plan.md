# Melhorias visuais nos gráficos da página Relatórios

Alterações restritas à apresentação dos dois gráficos em `src/routes/_authenticated/relatorios.tsx`. Nenhum dado, cálculo, consulta ou outra página é tocada.

## 1. Receitas x Despesas por mês (vira gráfico combinado)

- Barras mais finas e elegantes: largura máxima menor e maior espaçamento entre os meses e entre as duas barras do mesmo mês.
- Receitas em verde e Despesas em vermelho/rosa, como hoje.
- Nova linha azul de **Saldo mensal** (Receitas − Despesas) sobreposta às barras, com ponto destacado em cada mês e ponto ampliado ao passar o mouse.
- Legenda clara na base: Receitas | Despesas | Saldo.
- Tooltip mostrando o mês e os três valores completos em R$ (mesmo formatador já usado no outro gráfico).
- Eixo vertical passa a usar o formatador em Real (R$ 500, R$ 1 mil), no lugar do atual "1k".

## 2. Evolução financeira

- Mantém as três linhas com as mesmas cores e os mesmos dados.
- Curvas suavizadas trocadas por traço mais reto entre os pontos, para não distorcer visualmente os valores.
- Linhas com traço mais espesso e maior contraste; pontos com anel na cor do cartão para melhor leitura no tema escuro.
- Tooltip mantém mês, Receitas, Despesas e Saldo em R$.

## Regras preservadas

- Continua usando apenas os dados reais de `serieMensalQuery` (últimos 6 meses); meses sem transações aparecem com zero real.
- Nenhum dado fictício, nenhuma mudança em transações, banco, autenticação ou cálculos.
- Responsivo em computador, tablet e celular; tema escuro atual preservado via tokens.

## Detalhes técnicos

- Arquivo alterado: `src/routes/_authenticated/relatorios.tsx`.
- O `BarChart` vira `ComposedChart` (recharts) com dois `Bar` (`barSize` reduzido, `barGap`/`barCategoryGap` ajustados) mais um `Line dataKey="saldo"` usando `var(--color-saldo)`, `dot` e `activeDot`.
- Adiciona `ChartLegend`/`ChartLegendContent` e `ChartTooltipContent` com `formatarMoeda`, reaproveitando o padrão já usado no cartão "Evolução financeira".
- `YAxis tickFormatter` passa a usar `formatarMoedaEixo` (já importado no arquivo).
- No `LineChart` de Evolução financeira: `type="monotone"` → `type="linear"`, `strokeWidth` 2.5 → 3, `dot` com `stroke="var(--card)"` e raio levemente maior.
