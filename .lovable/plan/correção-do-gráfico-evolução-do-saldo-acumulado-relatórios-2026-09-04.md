# Correção do gráfico "Evolução do saldo acumulado" (Relatórios)

## O que os dados mostram

Consulta ao banco: só setembro/2026 tem movimentação realizada (receitas
R$ 5.700,00 e despesas pagas R$ 2.820,09). Os meses de outubro em diante têm
apenas despesas pendentes, que não entram no saldo realizado. Ou seja, no
período exibido (abril a setembro) existe **um único ponto** com valor, e os
demais meses ficam sem valor.

Diagnóstico ainda não confirmado: com um único ponto e todos os outros meses
vazios, a área/linha do gráfico não desenha nenhum traço, e o ponto isolado
não está aparecendo. A primeira etapa da correção é confirmar isso na tela
antes de ajustar.

## O que será feito

1. Confirmar na página Relatórios, com o mês setembro/2026 selecionado, que o
   valor calculado chega ao gráfico e que apenas a renderização do ponto único
   está falhando.
2. Recalcular a série de forma explícita: para cada mês, saldo do mês =
   receitas realizadas − despesas pagas; o acumulado soma o mês anterior com o
   mês atual, começando no primeiro mês com movimentação. Meses anteriores
   continuam sem valor (nada inventado).
3. Garantir que um mês isolado apareça no gráfico: ponto sempre visível, com
   destaque ao passar o mouse, mesmo quando for o único do período.
4. À medida que outros meses receberem transações realizadas, a linha passa a
   ligar os pontos automaticamente e segue a evolução acumulada.

## Fora do escopo

Nenhuma transação, orçamento, meta ou categoria é alterada. Os demais gráficos
de Relatórios e as páginas Dashboard, Transações, Orçamentos, Metas e
Previsões permanecem exatamente como estão, assim como login e filtros.

## Detalhes técnicos

- `src/lib/transacoes.functions.ts` → `evolucaoSaldo`: agregar por mês
  (receitas − despesas pagas, em centavos) e depois acumular sobre a lista de
  meses solicitada, retornando `null` até o primeiro mês com registro.
- `src/routes/_authenticated/relatorios.tsx` → card "Evolução do saldo
  acumulado": manter `connectNulls={false}` e assegurar renderização do ponto
  único (dot explícito/`activeDot`), sem mudar cores, tamanho ou layout.

## Verificação

Typecheck e conferência no navegador da página Relatórios em setembro/2026:
setembro com o saldo acumulado correto e os meses sem movimentação vazios.
