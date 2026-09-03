# Orçamentos: recorrentes pendentes como valor comprometido

## Situação atual (verificada)

O resumo do mês (`resumoMes`) já soma por categoria **apenas despesas pagas** — despesas pendentes ficam totalmente de fora. Em Outubro/2026 existem 7 despesas recorrentes pendentes somando R$ 1.640,00 (60, 120, 150, 200, 350, 360, 400), todas com vínculo de recorrência. Hoje elas não aparecem em nenhum indicador da página Orçamentos.

## O que muda

Na página Orçamentos, cada categoria e o resumo passam a distinguir três valores:

- **Gasto no mês**: despesas efetivamente pagas (regra atual, inalterada).
- **Comprometido**: despesas **recorrentes** ainda pendentes previstas para o mês.
- **Disponível**: orçamento − gasto pago − comprometido.

Regras:
- Despesas pendentes **não recorrentes** continuam fora do cálculo (gastos variáveis).
- Uma recorrente que muda de Pendente para Pago sai de "Comprometido" e entra em "Gasto" — nunca soma duas vezes, pois a classificação é por status atual da mesma transação.
- Barra de progresso e percentual utilizado passam a usar (pago + comprometido) / limite.
- Selos e alertas (Controle / Atenção / Atingido / Excedido) usam o mesmo total utilizado.
- No resumo superior: **Total gasto** continua só pagas, entra um novo bloco **Total comprometido**, e **Restante** = Total orçado − Total gasto − Total comprometido.
- Quando não houver recorrentes pendentes na categoria, o bloco "Comprometido" aparece zerado/discreto, sem poluir o cartão.

Nada é gravado no banco: os valores vêm das transações recorrentes que já existem e já aparecem em Transações. Geração de recorrências, filtros, status, Dashboard, Transações e a função "Copiar orçamentos do mês anterior" permanecem intactos.

## Detalhes técnicos

- Nova server function `comprometidoMes` em `src/lib/transacoes.functions.ts` (mesmo padrão de `resumoMes`, com `requireSupabaseAuth`): lê transações do mês com `tipo = 'despesa'`, `status_pagamento = 'pendente'` e `recorrencia_id não nulo`, agregando em centavos por `categoria_id`; retorna `{ total, porCategoria: [{ categoria_id, valor }] }`.
- Nova query `comprometidoMesQuery(mes)` em `src/lib/queries.ts`, chave `["comprometido", mes]`.
- `src/routes/_authenticated/orcamentos.tsx`: consome a nova query, cria `comprometidoPorCategoria`, ajusta `totais` (novo campo `comprometido`, `utilizado = gasto + comprometido`, `percentual` sobre `utilizado`), ajusta `situacao` para usar `utilizado`, e atualiza os cartões (linhas Gasto / Comprometido / Disponível) e o resumo (grade passa a 5 blocos, mantendo o padrão visual e responsivo atual).
- Invalidações existentes de `["resumo"]` nas mutações de Transações/Orçamentos ganham também `["comprometido"]`, para atualização imediata ao marcar como pago.
- Sem migrações, sem alteração de RLS, sem mudanças em `orcamentos.functions.ts` nem nas demais páginas.
