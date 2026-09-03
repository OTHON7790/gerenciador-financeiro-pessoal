# Limpeza dos lançamentos de teste anteriores a 01/09/2026

## O que foi verificado

- Existem **25 transações** com data entre **10/03/2026 e 26/08/2026** — são
  exatamente os valores que aparecem em março a agosto nos gráficos e na tabela
  Previsto x Realizado.
- **Orçamentos**: só existem registros de **2026-09** (14 linhas, total
  R$ 5.531,00). Nada a limpar aqui.
- **Recorrências**: as três regras cadastradas começam em setembro/2026
  (01/09, 02/09 e 08/09), então a limpeza não faz nenhuma delas regenerar
  lançamentos antigos.
- Nenhuma transação de setembro/2026 em diante é tocada.

## O que será feito

1. Excluir apenas as transações com `data < 2026-09-01` (as 25 linhas de teste).
2. Nada mais é removido: categorias, orçamentos, metas, recorrências, usuário,
   autenticação e configurações permanecem intactos.
3. Nenhuma alteração de código, layout ou schema.

## Resultado esperado

- Janeiro a agosto/2026 passam a exibir "Sem dados" em Previsões, Relatórios e
  Dashboard.
- O gráfico "Evolução das previsões · 2026" mostra pontos apenas de setembro em
  diante.
- Setembro/2026 permanece igual: receitas R$ 5.700,00, despesas previstas
  R$ 5.531,00, gastos reais R$ 2.510,09, saldo projetado R$ 169,00.
- As telas leem direto do banco, então recarregam já recalculadas.

## Verificação

Conferência por consulta (nenhuma transação antes de setembro; totais de
setembro inalterados) e revisão da página Previsões no navegador.
