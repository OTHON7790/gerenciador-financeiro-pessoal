# Correção do gráfico "Evolução do saldo acumulado" (Relatórios)

## Causa confirmada

Na função que monta a série do saldo acumulado (`evolucaoSaldo`, em
`src/lib/transacoes.functions.ts`), o acumulador usado para preencher os meses
é inicializado com o **total final** já somado de todas as transações. Por isso
todos os meses anteriores ao primeiro movimento recebem esse valor final —
exatamente os ~R$ 3.189,91 exibidos de abril a setembro.

## O que será feito

1. Meses anteriores ao primeiro mês com movimentação passam a ficar **sem
   valor** (sem ponto no gráfico), em vez de herdar o saldo final.
2. O acumulado começa a ser calculado a partir do primeiro mês que realmente
   tem transações; a partir daí ele é propagado normalmente (comportamento
   correto de saldo acumulado).
3. Setembro/2026 continua com os dados reais: receita R$ 5.700,00, despesas
   pagas R$ 2.510,09, saldo acumulado R$ 3.189,91.
4. A área do gráfico não conecta lacunas: meses sem dados ficam vazios.

## Fora do escopo

Nenhuma transação, orçamento ou categoria é alterada. Os demais gráficos de
Relatórios, além de Previsões, Dashboard, Orçamentos, Metas e Transações,
permanecem intactos.

## Detalhes técnicos

- `src/lib/transacoes.functions.ts` → `evolucaoSaldo`: substituir
  `let ultimo = acumulado` por um acumulador iniciado como `null`, retornando
  `saldo: null` até o primeiro mês com registro; o tipo de retorno passa a
  aceitar `number | null`.
- `src/routes/_authenticated/relatorios.tsx`: no `AreaChart` do cartão
  "Evolução do saldo acumulado", garantir `connectNulls={false}` para não
  ligar meses sem dados.

## Verificação

Typecheck, e conferência da página Relatórios no navegador: janeiro a agosto
sem pontos, setembro em R$ 3.189,91.
