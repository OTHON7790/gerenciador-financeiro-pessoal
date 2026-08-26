# Módulo Metas Financeiras — Plano

Novo módulo para o Finanças Pessoal, seguindo exatamente os padrões já usados em
Orçamentos: server functions autenticadas, RLS por usuário, cards e barras de
progresso do design system atual. Nenhuma página existente será redesenhada.

## 1. Banco de dados (uma migração)

Nova tabela `public.metas`:

| Campo | Descrição |
| --- | --- |
| nome | nome da meta (ex.: Notebook) |
| valor_alvo | valor a alcançar |
| valor_acumulado | quanto já foi guardado (default 0) |
| prazo | data limite, opcional |
| cor / icone | identidade visual do card (defaults) |
| criado_em / atualizado_em | datas de controle |

Regras de acesso: `GRANT` para `authenticated` e `service_role` (sem `anon`),
RLS habilitada e uma política única `metas dono` com
`user_id = auth.uid()` em using e with check — o mesmo padrão das outras três
tabelas. Sem essa política nenhum usuário consegue ler, alterar ou excluir metas
de outro usuário, nem pela API direta.

Percentual, valor restante e status **não são colunas**: são derivados em tempo
de leitura, evitando dados inconsistentes.

Um trigger atualiza `atualizado_em` a cada alteração.

## 2. Arquivos a criar

- `src/lib/metas.functions.ts` — server functions com `requireSupabaseAuth`:
  `listarMetas`, `salvarMeta` (cria/edita), `excluirMeta`,
  `adicionarValorMeta` (soma ao acumulado, nunca negativo).
- `src/components/meta-dialog.tsx` — formulário de criar/editar (nome,
  valor-alvo, valor inicial, prazo opcional), espelhando `transacao-dialog.tsx`.
- `src/routes/_authenticated/metas.tsx` — página `/metas` com head metadata
  própria, grid de cards, barra de progresso, botão "Adicionar valor",
  editar, excluir com `AlertDialog` de confirmação e empty state.

## 3. Arquivos a modificar (mudanças pequenas e aditivas)

- `src/lib/schemas.ts` — adicionar `metaSchema`, `aporteSchema` e o tipo `Meta`.
- `src/lib/queries.ts` — adicionar `metasQuery`.
- `src/components/app-shell.tsx` — inserir "Metas" no array `NAV` entre
  Orçamentos e Relatórios (uma linha).
- `src/routes/_authenticated/dashboard.tsx` — um card resumido "Metas" no fim
  da página, listando até 3 metas em andamento com barra de progresso e link
  para `/metas`. Nenhum bloco existente é alterado.
- `src/integrations/supabase/types.ts` — regenerado automaticamente pela
  migração.

## 4. Cálculos

Feitos em um helper puro (`progressoMeta`) usado pela página e pelo dashboard:

```text
percentual = valor_alvo > 0 ? (valor_acumulado / valor_alvo) * 100 : 0
restante   = max(valor_alvo - valor_acumulado, 0)
status     = percentual >= 100      -> "Concluída"
             prazo vencido e < 100  -> "Atrasada"
             caso contrário         -> "Em andamento"
```

Barra de progresso limitada a 100% na largura, com as cores progressivas já
existentes: verde ao concluir, âmbar quando perto do prazo/limite, azul em
andamento, vermelho quando atrasada. Metas concluídas ganham selo "Concluída".

Adicionar valor a uma meta **não** cria transação nesta versão.

## 5. Isolamento por usuário

Três camadas, iguais às atuais: rota sob `_authenticated/` (gate de login),
server functions com `requireSupabaseAuth` (agem como o usuário, com
`user_id` vindo do token e nunca do cliente) e RLS por `auth.uid()` no banco.
Nenhuma chave ou credencial vai para o cliente.

## 6. Reaproveitamento

`Card`, `Progress`, `Dialog`, `AlertDialog`, `Input`, `Button`, `Select`,
`Skeleton`, `sonner` (toasts), `formatarMoeda`/`formatarData`, `iconeCategoria`
e os tokens semânticos de cor — nada novo de design é introduzido.

## 7. Riscos

Baixos e contidos: o módulo é aditivo. Os únicos toques em arquivos existentes
são uma entrada no menu, um card novo no fim do dashboard e adições em
`schemas.ts`/`queries.ts`. A migração só cria uma tabela — não altera
`transacoes`, `categorias` nem `orcamentos`. Ponto de atenção: o prazo deve usar
o mesmo tratamento de data local já corrigido em `formatarData`, para não
deslocar um dia.

## 8. Ordem de implementação

1. Migração da tabela `metas` (RLS + grants + trigger).
2. `schemas.ts`, `metas.functions.ts`, `queries.ts`.
3. `meta-dialog.tsx` e página `/metas`.
4. Item no menu e card no dashboard.
5. Verificação: typecheck e teste do fluxo autenticado no navegador.
