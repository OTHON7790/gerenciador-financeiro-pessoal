# Filtro de mês da página Transações: ano completo

## Objetivo

Hoje o seletor de mês lista apenas os 12 meses anteriores até o mês atual, então meses futuros (ex.: Setembro de 2026) não podem ser selecionados. O filtro passará a oferecer os 12 meses do ano, com navegação entre anos.

## O que muda

1. **Seletor com ano + meses**
   - Um controle de ano com setas "‹" e "›" ao lado do rótulo do ano (ex.: `2026`), permitindo ir para anos anteriores e futuros.
   - Ao lado, o seletor de mês lista sempre Janeiro a Dezembro do ano exibido, com rótulo completo: "Setembro de 2026".
   - Ao trocar o ano, o mês selecionado é mantido (mesmo número do mês, novo ano), disparando o recálculo normal.

2. **Padrão ao abrir a página**
   - Continua iniciando no mês atual (`mesAtual()`), e o ano exibido é o ano desse mês.

3. **Meses futuros**
   - Como qualquer mês pode ser escolhido, transações com data futura aparecem normalmente ao selecionar o mês correspondente. Nenhuma mudança é necessária no backend: a consulta já filtra por intervalo de datas do mês.

## O que NÃO muda

- Nenhuma transação é alterada ou excluída.
- Cálculos de receitas, despesas e saldo permanecem idênticos.
- Filtros de tipo, categoria e busca continuam iguais.
- Padrão visual, modo escuro, responsividade e formatação em BRL preservados.

## Detalhes técnicos

- Arquivo: `src/routes/_authenticated/transacoes.tsx`.
- Substituir `mesesAnteriores(12)` por uma lista derivada do ano em estado: `Array.from({length:12}, (_,i) => `${ano}-${String(i+1).padStart(2,"0")}`)`.
- Novo estado `ano` inicializado a partir de `mesAtual()`; botões de ano usam `Button variant="ghost" size="icon"` com `ChevronLeft`/`ChevronRight` (lucide-react), com `aria-label` adequado.
- Rótulos via `formatarMes(m)` (já retorna "setembro de 2026"), com a primeira letra maiúscula como hoje.
- Nenhuma alteração em `src/lib/format.ts`, em server functions ou no banco.
