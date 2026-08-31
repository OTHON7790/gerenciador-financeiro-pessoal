# Seletor de mês da página Orçamentos: ano completo

## Objetivo

Hoje o seletor de mês da página Orçamentos lista apenas os 6 meses anteriores até o mês atual (`mesesAnteriores(6)`), então meses futuros (ex.: Setembro de 2026) não podem ser selecionados. O filtro passará a oferecer os 12 meses do ano exibido, com navegação entre anos — o mesmo padrão já implementado na página Transações.

## O que muda

1. **Seletor com ano + meses**
   - Um controle de ano com setas "‹" e "›" (botões `Button variant="ghost" size="icon"` com `ChevronLeft`/`ChevronRight` e `aria-label`) ao lado do seletor de mês, permitindo ir a anos anteriores e futuros.
   - O seletor de mês lista sempre Janeiro a Dezembro do ano exibido, com rótulo completo: "Setembro de 2026".
   - Ao trocar o ano, o mês selecionado é mantido (mesmo número do mês, novo ano), disparando o recálculo normal do resumo e dos orçamentos.

2. **Padrão ao abrir a página**
   - Continua iniciando no mês atual (`mesAtual()`), e o ano exibido é o ano desse mês.

3. **Meses futuros**
   - Como qualquer mês pode ser escolhido, orçamentos e gastos de meses futuros aparecem normalmente. Nenhuma mudança é necessária no backend: `listarOrcamentos` e `resumoMes` já filtram por mês/intervalo de datas do mês, e a tabela `orcamentos` já separa por `mes` (formato `YYYY-MM`), então Setembro de 2026 e Setembro de 2027 ficam em registros distintos.

## O que NÃO muda

- Nenhum orçamento ou transação é alterado ou excluído.
- Cálculos de totais, percentuais, níveis de alerta e o indicador de situação permanecem idênticos.
- Visual atual da página (cards, cores, modo escuro, responsividade) preservado — apenas o controle do seletor ganha as setas de ano.

## Detalhes técnicos

- Arquivo: `src/routes/_authenticated/orcamentos.tsx`.
- Remover `mesesAnteriores(6)` (e seu import, se não for mais usado) e derivar os meses do ano em estado: `Array.from({ length: 12 }, (_, i) => `${ano}-${String(i + 1).padStart(2, "0")}`)`.
- Derivar `ano` do mês em estado (`Number(mes.slice(0, 4))`) e função `mudarAno(delta)` que preserva `mes.slice(5, 7)`.
- Rótulos via `formatarMes(m)` (já retorna "setembro de 2026"), com a primeira letra maiúscula como hoje.
- Nenhuma alteração em `src/lib/format.ts`, em server functions, no banco ou em outras páginas.
