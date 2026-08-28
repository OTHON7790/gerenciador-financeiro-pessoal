# Ajuste de responsividade dos gráficos do Dashboard

Somente layout e responsividade. Dados, cálculos, cores, tooltips, filtros, demonstração e tema permanecem iguais.

## 1. Barra de rolagem horizontal acima de "Evolução financeira"

A barra visível vem da linha de botões de período (3/6/12/Personalizado), que usa rolagem horizontal fixa no cabeçalho do card.

- Trocar a rolagem por quebra de linha: os botões passam a se reorganizar em várias linhas em telas estreitas, sem scrollbar.
- Manter os mesmos botões, rótulos e comportamento de seleção.

## 2. Gráficos não estourarem a largura do card

- Adicionar contenção de largura (`min-w-0` / `overflow-hidden`) nos cards de gráfico e na grade que os contém, para que o container do gráfico respeite a largura real do card.

## 3. "Receitas x Despesas" — meses e barras distribuídos

- Reduzir a largura reservada do eixo vertical em telas pequenas e manter margens simétricas.
- Ajustar o eixo de meses para rótulos legíveis em telas estreitas (intervalo automático e espaçamento mínimo), evitando sobreposição.
- Manter `maxBarSize` e o espaçamento entre barras, ajustando o agrupamento para que todos os meses caibam no card.

## 4. Altura responsiva

- Manter as alturas atuais, apenas garantindo que ambos os gráficos usem a mesma abordagem responsiva (altura menor no mobile, maior no desktop).

## Verificação

- Conferir o Dashboard em larguras de celular e desktop, confirmando ausência de rolagem horizontal e todos os meses visíveis nos dois gráficos.
