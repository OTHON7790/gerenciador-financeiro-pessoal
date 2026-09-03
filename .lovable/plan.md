# Previsões Financeiras — previsão baseada em recorrentes

Hoje a página usa a soma dos orçamentos do mês como "Despesas previstas". Para meses futuros isso projeta gastos variáveis que ainda não existem. A correção passa a projetar apenas o que é recorrente.

## Nova regra

- **Despesas previstas**
  - Mês futuro: soma das despesas recorrentes lançadas naquele mês (pagas + pendentes).
  - Mês atual/passado: despesas realmente lançadas no mês (pagas) + recorrentes ainda pendentes, sem contar duas vezes a recorrente já paga.
  - Orçamentos deixam de alimentar esse valor.
- **Gastos reais**: continua somente despesas pagas do mês (sem mudança).
- **Receitas previstas**: receitas recorrentes do mês; se não houver recorrente, usa as receitas efetivamente lançadas no mês; sem nenhuma das duas, "Sem dados".
- **Saldo projetado**: Receitas previstas − Despesas previstas.
- Gráfico, tabela anual, percentual utilizado, badges de situação e alertas passam a usar essas mesmas séries.

## Verificação nos dados atuais

Outubro/2026 tem 7 despesas recorrentes pendentes somando **R$ 1.640,00** (e não R$ 1.580,00 como citado). Com a correção, outubro mostrará R$ 1.640,00 em Despesas previstas no lugar dos R$ 5.531,00 dos orçamentos. Novembro/dezembro seguem o mesmo padrão (R$ 1.640,00 cada). Setembro/2026: recorrentes R$ 1.640,00 (R$ 770,00 pagas + R$ 870,00 pendentes) e gastos reais R$ 2.660,09.

Hoje não existe nenhuma receita marcada como recorrente; setembro tem receita lançada de R$ 5.700,00, então setembro mostra R$ 5.700,00 e os meses futuros ficam como "Sem dados" em Receitas previstas (e o saldo projetado fica negativo pelo total recorrente). Se preferir projetar a receita recorrente a partir de setembro, é só marcar essa receita como recorrente em Transações — nenhuma alteração de dados será feita por este plano.

## Detalhes técnicos

- `src/lib/previsoes.functions.ts`: além de receita/despesa reais, agregar por mês `despesaRecorrente` (tipo despesa, `recorrencia_id` não nulo, pagas + pendentes), `receitaRecorrente` (tipo receita, `recorrencia_id` não nulo) e `despesaPaga`; manter `orcado` no retorno apenas para a coluna de referência da tabela, sem usá-lo na previsão. Somente leitura, com `requireSupabaseAuth`.
- `src/routes/_authenticated/previsoes.tsx`: derivar `despesasPrevistas = despesaRecorrente + despesas variáveis pagas do mês não recorrentes` (para o mês corrente/passado), `receitas = receitaRecorrente || receitaReal`, `saldoProjetado = receitas − despesasPrevistas`; usar essas séries no gráfico, nos cards, no percentual/badges da tabela e nos alertas. Textos dos cards atualizados ("Soma das despesas recorrentes do mês").
- Sem migração, sem escrita de dados, sem alteração em Transações, Orçamentos, Metas, Categorias, Dashboard ou Relatórios. Layout preservado.
