# Evolução financeira — novo gráfico de linhas no Dashboard

Troca do gráfico de área "Evolução do saldo" por um gráfico de linhas "Evolução financeira" com três séries. Nada fora da seção de gráficos do Dashboard é tocado.

## O que muda

1. **Novo cartão "Evolução financeira"** no lugar do atual "Evolução do saldo".
2. **Três linhas** com pontos visíveis em cada mês:
   - Receitas (verde), Despesas (vermelho), Saldo (azul).
3. **Dados reais**: os mesmos já usados pelo gráfico de barras (soma mensal das transações do usuário). Por mês: Receitas = soma das receitas, Despesas = soma das despesas, Saldo = receitas − despesas do próprio mês. Nenhum dado fictício; meses sem transações aparecem com zero real (não há invenção de valores).
4. **Tooltip** ao passar o mouse: nome do mês + Receitas, Despesas e Saldo formatados em R$.
5. **Legenda clicável**: clicar em Receitas/Despesas/Saldo oculta ou mostra aquela linha.
6. **Seletor de período** no cabeçalho do cartão: 3, 6 ou 12 meses, com 6 meses como padrão.
7. **Responsivo**: altura adaptada e eixos compactos no celular; tema claro/escuro preservado pelos tokens de cor já existentes.

## Detalhes técnicos

- Arquivo alterado: `src/routes/_authenticated/dashboard.tsx` apenas.
- O cartão vira um componente próprio com estado local `periodo` (3 | 6 | 12) e usa `serieMensalQuery(mesesAnteriores(periodo))` — server function `serieMensal` já existente, sem alteração de backend.
- Saldo calculado no cliente a partir de `receitas - despesas` de cada mês retornado.
- Recharts `LineChart` + `Line` (dot/activeDot), `ChartLegend`/`ChartLegendContent` com handler de toggle por `dataKey`, `ChartTooltipContent` com `formatarMoeda`.
- Cores via `var(--chart-...)` no `ChartConfig` (mantém dark mode).
- O gráfico de barras "Receitas x Despesas" continua usando o período fixo de 6 meses, como hoje.
