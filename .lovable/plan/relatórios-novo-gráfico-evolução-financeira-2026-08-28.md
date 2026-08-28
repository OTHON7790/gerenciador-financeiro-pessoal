# Relatórios — novo gráfico "Evolução financeira"

Adiciona um gráfico de linhas na página Relatórios, sem tocar nos gráficos, cálculos e dados já existentes.

## O que muda

1. **Novo cartão "Evolução financeira"** adicionado à página Relatórios, abaixo do gráfico "Receitas x Despesas por mês". Nenhum cartão atual é removido ou alterado.
2. **Três linhas mês a mês**, calculadas a partir das transações reais do usuário:
   - Receitas (verde), Despesas (vermelho), Saldo (azul = receitas − despesas do mês).
3. **Sem dados fictícios**: usa a mesma série mensal real já carregada na página (`serieMensalQuery` dos últimos 6 meses). Meses sem transações aparecem com zero real.
4. **Pontos visíveis** em cada mês, com ponto ampliado ao passar o mouse e linha-guia vertical discreta.
5. **Tooltip** com o mês e os valores completos em R$ (Receitas, Despesas, Saldo).
6. **Legenda** identificando as três séries.
7. **Eixo vertical em Real**, usando o formatador de moeda já existente.
8. **Atualização automática** ao criar, editar ou excluir uma transação: as mutações já invalidam as queries de transações/série, então o gráfico se atualiza sozinho.
9. **Responsivo** para desktop e celular; tema claro/escuro preservado pelos tokens de cor atuais.

## Detalhes técnicos

- Arquivo alterado: `src/routes/_authenticated/relatorios.tsx` apenas.
- Reaproveita `dadosSerie` (já contém `receitas`, `despesas`, `saldo` por mês) — nenhuma nova consulta ao banco e nenhuma alteração em server functions.
- Recharts `LineChart` + três `Line` (`dot` / `activeDot`), `CartesianGrid`, `XAxis`, `YAxis` com `formatarMoedaEixo`, `ChartTooltip` com `ChartTooltipContent` formatando via `formatarMoeda`.
- Cores pelos tokens `var(--color-receitas)`, `var(--color-despesas)`, `var(--color-saldo)` do `ChartConfig` já definido no arquivo.
- Se as mutações de transação não invalidarem a chave `serie-mensal`, acrescentar essa invalidação (única mudança fora da página, restrita à lista de chaves invalidadas).
