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

create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid not null references public.categorias(id) on delete cascade,
  mes text not null,
  limite numeric(12,2) not null check (limite >= 0),
  criado_em timestamptz not null default now(),
  unique (user_id, categoria_id, mes)
);
grant select, insert, update, delete on public.orcamentos to authenticated;
grant all on public.orcamentos to service_role;
alter table public.orcamentos enable row level security;
create policy "orcamentos dono" on public.orcamentos
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());