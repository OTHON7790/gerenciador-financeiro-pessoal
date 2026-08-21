# Gerenciador Financeiro Pessoal — Plano

App de finanças pessoais com login, transações, categorias, orçamentos e
gráficos, em português e valores em Real (R$). Nível intermediário para portfólio.

## 1. Pré-requisito: ativar Lovable Cloud

Antes de qualquer código, habilitar Lovable Cloud (backend Supabase gerenciado):
- Banco PostgreSQL, autenticação de usuários e RLS por usuário.
- A ativação cria `src/integrations/supabase/` (client, auth-middleware, auth-attacher)
  e o layout gerenciado `src/routes/_authenticated/route.tsx` (gate de login → `/auth`).
- Após habilitar, cada tabela do schema precisa de `GRANT` + RLS por `auth.uid()`.

## 2. Banco de dados (migração)

Três tabelas, todas com `user_id` e RLS scoped por `auth.uid()`.

```sql
-- Categorias
create type public.tipo_lancamento as enum ('receita', 'despesa');

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  tipo public.tipo_lancamento not null,
  cor text not null default '#3b82f6',
  icone text not null default 'wallet',
  criado_em timestamptz not null default now(),
  unique (user_id, nome)
);
grant select, insert, update, delete on public.categorias to authenticated;
grant all on public.categorias to service_role;
alter table public.categorias enable row level security;
create policy "categorias dono" on public.categorias
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Transações
create table public.transacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid references public.categorias(id) on delete set null,
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  tipo public.tipo_lancamento not null,
  data date not null default current_date,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.transacoes to authenticated;
grant all on public.transacoes to service_role;
alter table public.transacoes enable row level security;
create policy "transacoes dono" on public.transacoes
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Orçamentos (limite mensal por categoria)
create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid not null references public.categorias(id) on delete cascade,
  mes text not null,  -- formato 'YYYY-MM'
  limite numeric(12,2) not null check (limite >= 0),
  criado_em timestamptz not null default now(),
  unique (user_id, categoria_id, mes)
);
grant select, insert, update, delete on public.orcamentos to authenticated;
grant all on public.orcamentos to service_role;
alter table public.orcamentos enable row level security;
create policy "orcamentos dono" on public.orcamentos
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
```

A migração também insere categorias-padrão (Alimentação, Transporte, Moradia,
Salário, etc.) — mas como dependem de `user_id`, serão criadas por usuário no
primeiro acesso via server function, e não via INSERT literal na migração.

## 3. Páginas e rotas

```
src/routes/
  index.tsx                      -> /  (landing pública com CTA "Entrar")
  auth.tsx                       -> /auth (sign in / sign up)
  _authenticated/route.tsx       -> gate gerenciado (não editar)
  _authenticated/dashboard.tsx   -> /dashboard
  _authenticated/transacoes.tsx  -> /transacoes
  _authenticated/categorias.tsx  -> /categorias
  _authenticated/orcamentos.tsx  -> /orcamentos
  _authenticated/relatorios.tsx  -> /relatorios
```

Layout do app (sidebar + topbar) vive em `src/routes/__root.tsx` ou num
componente `AppShell` renderizado dentro de `_authenticated/route.tsx`.

### Detalhe das páginas

**/dashboard** — visão geral
- Cards de saldo atual, receitas e despesas do mês.
- Barra de progresso de orçamento geral.
- Gráfico de pizza (despesas por categoria, mês atual).
- Lista das 5 transações mais recentes.

**/transacoes** — CRUD principal
- Tabela/lista com filtros: mês, tipo, categoria.
- Botão "Nova transação" abre dialog (descrição, valor, tipo, categoria, data).
- Editar e excluir por linha.
- Valores formatados em R$ com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

**/categorias** — gerenciar categorias
- Lista de categorias com cor e ícone (lucide).
- Criar/editar/excluir. Tipo receita ou despesa.

**/orcamentos** — definir limites
- Seletor de mês.
- Para cada categoria de despesa, definir/editar limite mensal.
- Mostra gasto atual vs limite com barra de progresso e alerta ao estourar.

**/relatorios** — gráficos
- Gráfico de barras: receitas vs despesas por mês (últimos 6 meses).
- Gráfico de linha: evolução do saldo.
- Gráfico de pizza: despesas por categoria no período.

## 4. Camada de dados (server functions)

Arquivos em `src/lib/*.functions.ts` (thin wrappers, helper em `*.server.ts`):
- `categorias.functions.ts` — listar/criar/atualizar/excluir categorias.
- `transacoes.functions.ts` — CRUD de transações + agregações (saldo, totais mensais, por categoria).
- `orcamentos.functions.ts` — CRUD de orçamentos + gasto atual por categoria.
- `onboarding.functions.ts` — cria categorias-padrão no primeiro acesso do usuário.

Todas usam `.middleware([requireSupabaseAuth])` e operam via `context.supabase`
(RLS como usuário). Validação com Zod nos `inputValidator`.

Leitura nas páginas: loader com `context.queryClient.ensureQueryData(queryOptions)` +
`useSuspenseQuery` no componente. Mutações via `useServerFn` + `useMutation`
com invalidação de queries.

## 5. UX e visual

- Layout com sidebar fixa (desktop) + menu inferior (mobile), topbar com mês atual.
- Tema limpo/profissional usando os tokens do design system (não hardcoded).
- Componentes shadcn já disponíveis: Card, Dialog, Table, Select, Tabs, Progress, Button, Input, Sonner (toasts).
- Gráficos com **recharts** (já instalado), atrás de `<ClientOnly>` pois usa APIs de browser.
- Tudo em português; datas com `date-fns` locale pt-BR.
- Feedback: toasts ao salvar/excluir, estados de loading, empty states amigáveis.

## 6. Ordem de implementação

1. Ativar Lovable Cloud.
2. Criar a migração com as 3 tabelas + RLS + GRANTs.
3. Server functions de categorias + onboarding.
4. Layout do app (AppShell) e página /categorias.
5. Server functions de transações + página /transacoes (CRUD).
6. Página /dashboard (cards + gráfico de pizza).
7. Server functions de orçamentos + página /orcamentos.
8. Página /relatorios (gráficos de barras/linha/pizza).
9. Página pública / (landing) e /auth (login).
10. Revisão: build, testes de fluxo no browser, head metadata por rota.
