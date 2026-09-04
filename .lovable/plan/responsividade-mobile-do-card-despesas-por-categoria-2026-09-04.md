# Responsividade mobile do card "Despesas por categoria"

Ajustar somente o card de gráfico de rosca na página Relatórios para telas estreitas, sem alterar desktop, dados, cores, tooltips ou outros componentes.

## 1. Diagnóstico visual

- O gráfico usa `outerRadius={90}` fixo e legenda Recharts `layout="horizontal"`.
- Em telas estreitas o raio fixo empurra a legenda para fora do card, gerando rolagem horizontal e cortes.
- A lista inferior de categorias também pode forçar largura mínima quando os nomes são longos.

## 2. Ajustes no gráfico de rosca

- Medir a largura real do container do card com uma `ref` + `ResizeObserver`/`window resize`.
- Tornar `outerRadius` responsivo (por exemplo, metade da largura menos margem, limitado entre 70 e 120 px).
- Manter `innerRadius` proporcional ou fixo menor, preservando a forma de rosca.
- Centralizar o gráfico com `mx-auto` e garantir que o SVG não extrapole o card.

## 3. Legenda responsiva

- No mobile: trocar a legenda Recharts para `layout="vertical"` e posicionar abaixo do gráfico, permitindo quebra de linha por categoria.
- No desktop: manter `layout="horizontal"` atual.
- Ajustar `wrapperStyle` para largura máxima (`100%`), tamanho de fonte e quebra de linha.

## 4. Contenção de largura

- Adicionar `overflow-hidden` e `min-w-0` no `CardContent` do card "Despesas por categoria".
- Garantir que a lista inferior de categorias use `break-words`/`truncate` e não force largura mínima.

## 5. Verificação

- Testar em larguras de celular comum (375 px e 390 px) e desktop (≥1024 px).
- Confirmar que o gráfico e a legenda ficam totalmente dentro do card, sem rolagem horizontal.
- Validar typecheck e a rota `/relatorios`.
