# Transações Recorrentes

Adicionar despesas recorrentes (mensal e anual) que se materializam como transações reais nos meses correspondentes, entrando normalmente em despesas, saldo, orçamentos, previsões e relatórios — sem tocar em nada já cadastrado.

## Como vai funcionar para o usuário

1. No diálogo de transação, quando o tipo for **Despesa**, aparece um switch **"Despesa recorrente"**.
2. Ativado, mostra:
   - **Frequência**: Mensal ou Anual
   - **Data de início** (padrão: a data da transação)
   - **Data de término** (opcional; em branco = sem fim previsto)
3. Ao salvar, o app cria a regra de recorrência e gera as ocorrências: da data de início até a data de término, ou — quando não há término — até 12 meses à frente do mês atual (a geração avança sozinha conforme o tempo passa).
4. Cada ocorrência é uma transação normal na lista, com um selo discreto de "Recorrente". Aparece nos filtros de ano/mês, categorias, orçamentos, previsões e relatórios exatamente como qualquer despesa.
5. Ao **editar** uma ocorrência recorrente, o app pergunta antes de salvar:
   - **Somente esta ocorrência** — altera apenas aquele mês (fica marcada como "editada manualmente" e nunca mais é sobrescrita pela regra)
   - **Esta e as próximas** — atualiza a regra e as ocorrências futuras ainda não editadas individualmente; meses passados ficam intactos
6. Ao **excluir** uma ocorrência, a mesma pergunta: só aquele mês, ou encerrar a recorrência dali em diante.

## Regras importantes

- Nenhuma transação existente é alterada ou reclassificada; a recorrência só afeta o que for criado a partir de agora.
- Sem duplicatas: cada regra tem no máximo uma ocorrência por mês de referência, garantido pelo banco.
- Dia inválido no mês (ex.: dia 31 em fevereiro) usa o último dia do mês.
- Valor editado em um mês específico não é sobrescrito por atualizações futuras da regra.
- Recorrência apenas para despesas nesta etapa, como solicitado.

## Detalhes técnicos

**Banco (migração aditiva, sem alterar dados):**
- Nova tabela `public.recorrencias`: `id`, `user_id`, `descricao`, `valor`, `categoria_id`, `frequencia` (novo enum `frequencia_recorrencia`: `mensal`, `anual`), `dia_referencia`, `data_inicio`, `data_fim` (nullable), `ativa`, timestamps. RLS `user_id = auth.uid()` + GRANTs para `authenticated`/`service_role`, no mesmo padrão das tabelas atuais.
- Em `public.transacoes`, duas colunas novas e nulas: `recorrencia_id` (FK → `recorrencias`, ON DELETE SET NULL) e `ocorrencia_ref` (texto `YYYY-MM`), mais `editada_manualmente boolean not null default false`. Índice único parcial em (`recorrencia_id`, `ocorrencia_ref`) para impedir duplicatas.
- Regenerar os tipos do banco.

**Server functions (`src/lib/recorrencias.functions.ts`, padrão `requireSupabaseAuth`):**
- `criarRecorrencia`, `atualizarRecorrencia` (com escopo `apenas_esta` / `esta_e_proximas`), `encerrarRecorrencia`, `listarRecorrencias`.
- `sincronizarRecorrencias`: gera/atualiza ocorrências faltantes via upsert idempotente no índice único, até `data_fim` ou 12 meses à frente. Chamada no layout autenticado junto da sincronização de categorias já existente, invalidando os caches de transações/resumo/orçamentos quando cria algo.

**UI:**
- `src/components/transacao-dialog.tsx`: bloco de recorrência (switch + frequência + datas), visível só para despesa; ao editar uma transação com `recorrencia_id`, abre um `AlertDialog` com as opções de escopo antes de gravar.
- `src/routes/_authenticated/transacoes.tsx`: selo "Recorrente" na linha e mesma pergunta de escopo na exclusão.
- Zod schemas novos em `src/lib/schemas.ts`; query options em `src/lib/queries.ts`.
- Nenhuma alteração no layout, na paleta ou nos cálculos existentes — as ocorrências são transações comuns, então resumo, orçamentos, previsões e relatórios continuam usando exatamente o código atual.
