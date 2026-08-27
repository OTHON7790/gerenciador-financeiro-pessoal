# Aprimorar o gráfico "Evolução financeira"

Alterações restritas ao cartão do gráfico no Dashboard. Nenhum dado, cálculo, rota ou outra seção é tocada.

## O que muda

1. **Linhas mais destacadas**
   - Traço mais espesso e cantos suavizados; cores verde (receitas), vermelho (despesas) e azul (saldo) mantidas via tokens, com boa leitura em claro e escuro.
   - Saldo ganha um leve diferencial visual (traço um pouco mais forte) para não se confundir com as outras duas.

2. **Pontos por mês**
   - Continuam visíveis em todos os meses; ao passar o mouse, o ponto do mês cresce suavemente com anel na cor de fundo do cartão.

3. **Tooltip**
   - Mantido exatamente como está (mesmos valores e formatação em R$).

4. **Eixo vertical em moeda brasileira**
   - Rótulos como `R$ 0`, `R$ 500`, `R$ 1 mil`, `R$ 1,5 mil`, `R$ 2,5 mi`. Nada de "1k".
   - Valores negativos exibidos com sinal (ex.: `-R$ 500`).

5. **Linha-guia vertical**
   - Ao passar o mouse, uma guia vertical discreta e tracejada marca o mês analisado.

6. **Seletor de período**
   - Botões 3, 6 e 12 meses mantidos (padrão 6) e um novo botão **Personalizado**.
   - Ao escolher Personalizado, aparecem dois campos mês/ano (inicial e final). O gráfico atualiza ao mudar qualquer um.
   - Se o mês inicial for depois do final, as datas são invertidas automaticamente para sempre exibir um intervalo válido; o intervalo é limitado a 24 meses para manter a leitura.

7. **Legenda clicável**
   - Continua ligando/desligando cada série.
   - Série desligada fica visualmente clara: cor esmaecida, texto riscado e ponto vazado (só contorno), além de `aria-pressed` para acessibilidade.

8. **Responsividade**
   - No celular: botões de período em linha rolável, campos mês/ano empilhados, eixo Y mais estreito e menos rótulos no eixo X.

9. **Sem dados fictícios**
   - Continua usando a mesma consulta real de transações; meses sem movimento aparecem com zero.

## Detalhes técnicos

- Arquivo alterado: `src/routes/_authenticated/dashboard.tsx` (apenas o componente `CardEvolucaoFinanceira`, mais um pequeno formatador).
- Novo formatador de eixo (`formatarMoedaEixo`) em `src/lib/format.ts`, usando `Intl.NumberFormat` pt-BR com sufixos "mil"/"mi" — não altera `formatarMoeda` usado no tooltip.
- Estado do card: `periodo: 3 | 6 | 12 | "custom"`, mais `inicio`/`fim` no formato `YYYY-MM` (padrão: últimos 6 meses). A lista de meses passada a `serieMensalQuery` é derivada desse estado; a server function `serieMensal` não muda.
- Campos mês/ano usam `<input type="month">` estilizado com os tokens atuais.
- Recharts: `ReferenceLine`/`ChartTooltip cursor` tracejado para a guia vertical, `activeDot` maior com `stroke="var(--card)"`, `YAxis tickFormatter` com o novo formatador.
