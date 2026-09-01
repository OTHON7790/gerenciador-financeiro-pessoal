# Previsões Financeiras — Clareza da tabela "Previsto x Realizado"

Ajuste apenas de textos (labels) na tabela da tela `/previsoes`, para deixar claro que a comparação é entre **despesas** previstas e realizadas.

## O que muda
Arquivo: `src/routes/_authenticated/previsoes.tsx` (apenas textos estáticos).

1. Título do card da tabela:
   - De: "Previsto x Realizado · {ano}"
   - Para: "Despesas — Previsto x Realizado · {ano}"

2. Cabeçalhos da tabela:
   - "Previsto" → "Despesas previstas"
   - "Realizado" → "Despesas realizadas"
   - "Diferença", "% usado" e "Situação" permanecem como estão.

## O que NÃO muda
- Nenhum cálculo, valor, formatação monetária (mantém `formatarMoeda` / R$ 1.234,56), badges de situação, cores ou layout.
- Gráfico, cards de resumo, alertas, seletor de período, menu e demais páginas intactos.
- Nenhuma alteração de banco de dados ou server functions.

## Verificação
- Conferir no preview que a tabela exibe os novos títulos/cabeçalhos com os mesmos valores de antes.
