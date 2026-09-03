# Revisão final de consistência (dados reais e atualização automática)

Sem redesenho: layout, tema escuro, cores, tipografia e telas permanecem iguais.

## O que foi verificado

- Previsões (`previsoes.functions.ts`) já lê exclusivamente transações e
  orçamentos reais — nenhum valor fictício. Nada a corrigir na origem dos dados.
- Relatórios (`relatorios.tsx`) usa `serieMensalQuery` / `evolucaoSaldoQuery`
  reais, sem demonstração. Também já está correto.
- O único gerador de valores fictícios é `src/lib/demo-serie.ts`, usado apenas
  no Dashboard (gráficos "Receitas x Despesas" e "Evolução financeira"), com o
  aviso "Dados de demonstração em meses sem transações".
- As mutações de transação invalidam transações, resumo, série mensal, evolução
  do saldo, orçamentos, previsões, recorrências e contas a pagar. Já as mutações
  de **orçamento** (criar, editar limite inline, excluir) invalidam somente
  `orcamentos` — Previsões não se atualiza sozinha após mudar um orçamento.
- A tabela de Previsões tem a coluna "Diferença" calculada como
  `orçado − gastos reais`.
- Entrada monetária já é centralizada em `parseMoedaBR` (aceita `1.234,56`,
  `1234.56`, `1234,56`) e a exibição em `formatarMoeda` (BRL pt-BR).

## Correções

1. **Remover dados de demonstração** — Dashboard passa a usar somente a série
   real; meses sem lançamentos aparecem com zero. Remove-se o uso de
   `aplicarDemo` e os avisos "Dados de demonstração..." dos dois gráficos, e o
   arquivo `src/lib/demo-serie.ts` deixa de existir.
2. **Consistência global** — as mutações de Orçamentos passam a invalidar também
   `previsoes` (e `orcamentos`), garantindo que Previsões, percentuais e badges
   reflitam a alteração imediatamente. Demais telas já compartilham a mesma
   origem de dados.
3. **Coluna renomeada** — em Previsões, "Diferença" vira "Restante do orçamento"
   (mesmo cálculo, mesma formatação e cores).
4. **Padrão monetário** — mantido como está; apenas conferência de que todo
   valor exibido nas telas afetadas passa por `formatarMoeda`.

## Verificação

- Typecheck e testes de `parseMoedaBR`.
- Navegador autenticado: Dashboard (sem meses fictícios e sem o aviso),
  Relatórios (três gráficos com dados reais), Previsões (nova coluna e
  atualização após alterar um orçamento), Transações (totais e cartão de
  pendentes) — confirmando ausência de regressão.

## Fora do escopo

Nenhuma alteração de banco, dados cadastrados, autenticação, layout, cores ou
funcionalidades existentes.
