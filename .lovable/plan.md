# Melhorar espaçamento e organização dos lançamentos na tela Transações

## Objetivo
Reorganizar visualmente cada item da lista de transações para que nome, status (PAGO/PENDENTE/VENCIDO), indicador "Recorrente", categoria, data, valor e ações fiquem claramente separados e legíveis, inclusive em telas menores. Apenas ajustes de layout, sem alterar cálculos, filtros, ordenação, dados, cores, funcionalidades ou outras telas.

## Escopo da mudança
- Arquivo: `src/routes/_authenticated/transacoes.tsx`
- Apenas a estrutura do item de lista (dentro de `ordenadas.map`).
- Preservar: cores de status, badges, ícones de categoria, botões "Marcar como pago", editar, excluir, valores monetários, filtros e ordenação existentes.

## Proposta de layout
Cada lançamento será reestruturado em três zonas claras dentro do `li`:

1. **Ícone da categoria** — mantido à esquerda, com tamanho, cor e ring atuais.
2. **Bloco principal de informações** — empilhado verticalmente:
   - Linha superior: descrição + badge de status + badge "Recorrente", com gaps e sem sobreposição.
   - Linha inferior: categoria, data e vencimento no estilo atual.
3. **Bloco de valor e ações** — agrupado à direita:
   - valor alinhado.
   - botões de ação logo abaixo ou ao lado, com espaçamento consistente.
   - em telas muito estreitas, o valor/ações podem ocupar a linha inferior com alinhamento adequado, mas sempre separado do nome/categoria.

## Ajustes de CSS
- Usar `gap-4` ou maior entre as zonas.
- Garantir `min-w-0` no bloco de texto para que a descrição possa truncar sem empurrar elementos.
- Status e "Recorrente" serão `shrink-0` para não encolherem.
- Aumentar padding vertical do item (`py-4` em vez de `py-3`) para mais respiro.
- Em `sm`: manter tudo em uma única linha com alinhamento baseline/central.
- Abaixo de `sm`: permitir que o valor/ações formem uma segunda linha alinhada à direita, mas com padding/margem superior clara.

## Validação
- Verificar `bun typecheck` sem erros.
- Verificar rota `/transacoes` respondendo HTTP 200.
- Verificar preview em largura de desktop (≥1024px) e mobile (375px) confirmando que status não fica colado ao nome e que nenhuma informação é cortada.
