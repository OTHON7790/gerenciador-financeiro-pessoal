# Copiar orçamentos do mês anterior

## O que será adicionado

Na página Orçamentos, quando o mês selecionado não tiver nenhum orçamento, o cartão vazio ("Nenhum orçamento definido para Outubro de 2026") ganha um botão em destaque: **Copiar orçamentos do mês anterior**.

Ao clicar:
- Copia apenas os limites de orçamento do mês imediatamente anterior para o mês selecionado.
- Ignora categorias que já tenham orçamento no mês de destino (nunca duplica).
- Não toca em transações, recorrências, categorias ou status de pagamento.
- Cada orçamento copiado é um registro próprio do mês de destino: editar ou excluir outubro não afeta setembro.
- Mensagem de sucesso: "Orçamentos de Setembro de 2026 copiados para Outubro de 2026 com sucesso." (com contagem quando houver cópia parcial).
- Se o mês anterior não tiver nenhum orçamento: aviso "Setembro de 2026 não possui orçamentos para copiar." e nada é gravado.
- Após a cópia, a tela recarrega os dados e Total Orçado, Total Gasto, Restante, percentual utilizado, barras e alertas são atualizados imediatamente.

Os gastos continuam sendo calculados apenas pelas transações do mês (incluindo ocorrências recorrentes já existentes) — essa lógica não muda.

## Detalhes técnicos

- Nova server function `copiarOrcamentosMesAnterior` em `src/lib/orcamentos.functions.ts`, com `requireSupabaseAuth`:
  - entrada: `{ mes: "YYYY-MM" }` (mês de destino); calcula o mês anterior com virada de ano;
  - lê os orçamentos do mês anterior e do mês de destino (RLS já limita ao usuário);
  - se a origem estiver vazia, retorna `{ copiados: 0, origem }` sem gravar;
  - insere em lote apenas as categorias ausentes no destino, com `user_id`, `categoria_id`, `mes` destino e `limite`;
  - retorna `{ copiados, origem }`.
- Em `src/routes/_authenticated/orcamentos.tsx`: `useServerFn` + `useMutation`, botão no estado vazio (mesmo padrão visual, ícone `Copy`, com estado "Copiando..."), toasts via `sonner`, e invalidação de `["orcamentos"]`, `["resumo"]` e `["previsoes"]` no sucesso.
- Sem alterações de banco, RLS, filtros, transações ou outras páginas.
