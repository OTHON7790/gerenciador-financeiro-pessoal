# Controle de despesas vencidas e pendências acumuladas

## Diagnóstico (verificado no banco)

Hoje existem 86 despesas pendentes e **nenhuma delas tem data de vencimento preenchida**. A regra atual só marca "Vencida" quando existe data de vencimento anterior a hoje — por isso nenhuma despesa aparece como vencida, mesmo as de setembro já passadas.

Além disso, o card "Contas a pagar" do Dashboard só olha o mês selecionado: ao virar o mês, as dívidas antigas somem da visão, embora continuem registradas na data original.

## O que muda

1. **Regra de vencimento**: quando a despesa pendente não tiver data de vencimento informada, passa a valer a própria data do lançamento. Assim, uma despesa pendente com data já passada é exibida como "Vencida" em todo o app (Transações, filtros, Dashboard), sem alterar nenhum registro no banco.
2. **Nada é movido nem duplicado**: a despesa continua no mês original, com a data original, apenas com o rótulo de status atualizado. Nenhuma transação é criada, copiada ou reagendada.
3. **Dashboard — pendências acumuladas**: o card "Contas a pagar" passa a mostrar três valores:
   - **Pendente no mês**: despesas pendentes do mês selecionado ainda não vencidas.
   - **Vencido no mês**: pendentes do mês cujo vencimento já passou.
   - **Total acumulado em atraso**: soma de todas as despesas pendentes vencidas, de qualquer mês anterior inclusive, independentemente do mês selecionado — com uma linha indicando desde quando.
   A lista "Próximos vencimentos" continua igual.
4. **Marcar como paga**: o comportamento atual é mantido — muda o status para Pago e registra a data de pagamento de hoje, preservando a data original da despesa. Despesas já pagas nunca são tocadas.

## Detalhes técnicos

- `src/lib/schemas.ts`: em `statusTransacao`, usar `data_vencimento ?? data` como referência de vencimento (a assinatura ganha `data` opcional). Chamadas existentes já passam objetos de transação; onde o `select` não traz `data`, incluir a coluna.
- `src/lib/transacoes.functions.ts`: em `listarTransacoes` e `contasAPagar` garantir que `data` esteja no `select`; em `contasAPagar` adicionar uma segunda consulta (sem filtro de mês, `data < início do mês selecionado`... na prática todas as pendentes) que retorna `atrasadoAcumulado` e `desde` (data mais antiga em atraso).
- `src/routes/_authenticated/dashboard.tsx`: `CardContasAPagar` exibe o novo bloco "Total acumulado em atraso"; grade passa a 3 colunas em telas médias, mantendo o estilo atual.
- Nenhuma migração, nenhuma alteração de dados, RLS, cálculos de gráficos, orçamentos, previsões ou layout geral.
