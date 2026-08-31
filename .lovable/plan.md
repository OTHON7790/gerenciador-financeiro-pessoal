# Nova categoria de despesa: Processo Judicial

Adicionar a categoria de despesa **"Processo Judicial"** ao catálogo do app, sem apagar nem alterar nada do que já existe.

## Categoria a incluir

| Categoria | Ícone (Lucide) | Cor |
| --- | --- | --- |
| Processo Judicial | scale (balança da justiça) | vermelho escuro |

## Como a categoria chega à conta do usuário

A rotina de categorias padrão (`garantirCategoriasPadrao`) já é **complementar e idempotente** — ela insere apenas as categorias padrão que ainda não existem pelo nome (via `ignoreDuplicates`), então:

- Categorias já cadastradas (inclusive renomeadas, recoloridas ou criadas pelo usuário) ficam intactas.
- "Processo Judicial" aparece automaticamente no próximo carregamento do app.
- Rodar de novo não duplica nada.

## Funcionamento em todo o app

Nada muda na mecânica: como a categoria entra pelo mesmo caminho das existentes, ela aparece automaticamente nos seletores de **Transações** e **Orçamentos**, e cada despesa lançada nela é somada ao orçamento do mês correspondente, além de contar no Dashboard, gráficos e Relatórios.

## Detalhes técnicos

- `src/lib/default-categorias.ts`: acrescentar 1 entrada: `{ nome: "Processo Judicial", tipo: "despesa", cor: "#991b1b", icone: "scale" }`.
- `src/lib/icones.ts`: importar `Scale` do Lucide e mapear `"scale"` no `MAPA` (fallback atual `Wallet` continua).
- Nenhuma migração de banco, nenhuma alteração de layout, nenhum dado existente tocado.
- Validação: conferir no navegador que a nova categoria aparece nos seletores de Transações e Orçamentos e que uma despesa nela é contabilizada no orçamento do mês.
