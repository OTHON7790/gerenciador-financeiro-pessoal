# Previsões — gráfico "Evolução das previsões" só com dados reais

## O que está errado hoje

Confirmado em `src/routes/_authenticated/previsoes.tsx`:

- **Receitas**: quando o mês não tem receita lançada, o gráfico usa
  `mediaReceita` (média dos meses com receita). Isso cria uma linha de receita
  em meses sem nenhum lançamento — valor inventado.
- **Despesas previstas**: quando não existe orçamento no mês, o gráfico usa a
  despesa real como se fosse previsão, duplicando a linha de gastos reais.
- **Saldo projetado**: por consequência, aparece em meses sem dado nenhum.

A origem dos dados (`src/lib/previsoes.functions.ts`) já é real: soma transações
do ano e orçamentos por mês, sem nada fictício. A correção é só no cálculo da
tela.

## Correção

1. `receitas` = apenas receitas reais do mês. Sem receita lançada → sem ponto no
   gráfico (`null`), não zero forçado nem média.
2. `despesasPrevistas` = apenas soma dos orçamentos reais do mês. Sem orçamento
   → sem ponto (`null`), nunca copiando a despesa real.
3. `gastosReais` = apenas despesas reais lançadas no mês; sem transações → sem
   ponto.
4. `saldoProjetado` = receitas reais − despesas previstas, calculado somente
   quando houver pelo menos um dos dois lados com dado real; caso contrário
   `null`.
5. As linhas passam a usar `connectNulls={false}`, então meses sem dados ficam
   como lacuna, sem histórico artificial.
6. Cartões de resumo: "Receitas previstas" passa a mostrar "Sem dados" quando o
   mês não tem receita real (hoje mostra a média). Os demais cartões já tratam
   ausência corretamente. A tabela Previsto x Realizado já usa só dados reais e
   não muda.

Setembro/2026 (receitas e despesas cadastradas) continua exibindo exatamente os
valores atuais.

## Atualização automática

Já verificado: as mutações de transação e de orçamento invalidam a chave
`previsoes`, então o gráfico se atualiza sozinho ao cadastrar/editar/excluir.
Nada a mudar aqui.

## Fora do escopo

Layout, tema escuro, cores, filtros Ano/Mês, banco de dados, outras páginas e
qualquer dado cadastrado permanecem intactos.

## Verificação

Typecheck, testes existentes e conferência no navegador da página Previsões
(gráfico com lacunas em meses sem dados, setembro inalterado).
