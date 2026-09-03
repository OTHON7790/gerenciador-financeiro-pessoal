# Correção do card "Contas a pagar" do Dashboard

## Diagnóstico (confirmado no banco)

A função que alimenta o card soma **todas** as despesas pendentes existentes, sem qualquer filtro de período. Hoje há 28 despesas pendentes no banco, incluindo ocorrências recorrentes futuras (Escola R$ 360,00 e Câmeras R$ 200,00 de out/2026 até set/2027), o que produz o total de R$ 7.740,00.

Em setembro/2026 as pendentes reais são: Energia R$ 400,00, Processo R$ 350,00, Assinaturas R$ 150,00 e Água R$ 120,00 = **R$ 1.020,00**.

## Correção

1. Passar o mês/ano selecionado no Dashboard para a consulta de contas a pagar, filtrando as despesas pelo intervalo do mês (mesma regra de período já usada em Transações e no resumo do mês).
2. Manter o filtro por despesa com status pendente e a mesma função de status (`statusTransacao`) usada na tela Transações, para que "pendente" e "vencido" sigam exatamente a mesma regra.
3. Recalcular no período selecionado:
   - **Total pendente**: soma das despesas pendentes (ainda não vencidas) do mês.
   - **Total vencido**: soma das despesas pendentes cujo vencimento já passou.
   - **Próximos vencimentos**: apenas despesas pendentes do mês, ordenadas por data de vencimento.
4. Incluir o mês na chave de cache da consulta, para o card atualizar ao trocar o período e ao criar/editar/excluir ou mudar o status de uma transação (as invalidações existentes continuam valendo).

## Detalhes técnicos

- `src/lib/transacoes.functions.ts`: adicionar `inputValidator` com `mes` (`YYYY-MM`) em `contasAPagar` e aplicar `gte("data", mes-01)` / `lt("data", próximo mês)`.
- `src/lib/queries.ts`: transformar `contasAPagarQuery` em função `(mes: string)` com `queryKey: ["contas-a-pagar", mes]`.
- `src/routes/_authenticated/dashboard.tsx`: `CardContasAPagar` recebe o mês já selecionado na página e usa a query parametrizada.
- Invalidações por prefixo `"contas-a-pagar"` continuam funcionando.

## Fora do escopo

Nenhuma transação, categoria, valor ou status é alterado no banco. Nenhuma outra tela é modificada.
