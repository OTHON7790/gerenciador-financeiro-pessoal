# Plano: Data de início nas Metas

Adicionar o campo **Data de início** a cada meta e usá-lo como base real do
planejamento mensal (hoje o cálculo usa a data de criação da meta).

## O que muda para o usuário

No formulário de meta (criar e editar) passam a existir 5 campos:
Nome da meta, Valor-alvo, Já guardado, **Data de início** e Prazo final.

A seção "Planejamento da meta" continua com o mesmo visual, mas os números
passam a ser calculados a partir da data de início informada:

- total de meses entre início e prazo;
- valor mensal planejado (valor-alvo ÷ total de meses);
- quanto deveria estar acumulado até hoje;
- quanto realmente está acumulado;
- diferença (à frente / abaixo do planejado);
- meses restantes até o prazo;
- novo valor mensal necessário para atingir a meta no prazo.

Status pela comparação acumulado × esperado hoje:
- **Dentro da meta** (verde): acumulado ≥ esperado;
- **Atenção** (amarelo): entre 90% e 100% do esperado;
- **Fora da meta** (vermelho): abaixo de 90% do esperado, ou prazo vencido
  com valor faltando.

Adiantado → "Você está R$ X à frente do planejado."
Atrasado → "Você está R$ X abaixo do planejado. Para recuperar o atraso e
atingir sua meta no prazo, guarde R$ Y por mês nos próximos Z meses."

Cada meta calcula tudo isoladamente; várias metas em paralelo não se afetam.

## Detalhes técnicos

1. **Banco** — migration adicionando `data_inicio date` (nullable) em
   `public.metas`. Sem alterar RLS, grants, triggers ou demais tabelas.
   Metas existentes ficam com `data_inicio` nulo e continuam funcionando:
   o cálculo cai no fallback atual (`criado_em`).
2. **`src/lib/schemas.ts`** — `metaSchema` ganha `data_inicio` (formato
   `YYYY-MM-DD`, nullable/opcional); tipo `Meta` ganha o campo;
   `planejarMeta` passa a usar `data_inicio ?? criado_em` como início.
   Se início ≥ prazo, `totalMeses` é tratado como 1.
   `progressoMeta` permanece inalterado.
3. **`src/lib/metas.functions.ts`** — `salvarMeta` grava `data_inicio`
   no insert e no update. Demais funções intactas.
4. **`src/components/meta-dialog.tsx`** — novo input `type="date"`
   "Data de início" ao lado de "Prazo final", em grid de 2 colunas;
   valor padrão vazio (opcional). Validação: se ambas preenchidas,
   início não pode ser depois do prazo.
5. **`src/routes/_authenticated/metas.tsx`** — sem mudança de layout;
   apenas exibe os valores já recalculados. Opcionalmente a linha de
   detalhes mostra o período (início → prazo).

## Não muda

Barra de progresso, botão Guardar, criar/editar/excluir, dashboard,
autenticação, outras páginas e demais tabelas.

## Verificação

- Typecheck limpo.
- Teste no navegador: criar meta com início e prazo, conferir meta mensal,
  esperado hoje, diferença e status; editar a data de início e ver os
  números recalcularem; meta antiga (sem início) continua correta.
