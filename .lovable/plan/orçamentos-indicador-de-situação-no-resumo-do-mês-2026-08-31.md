# Orçamentos — Indicador de situação no "Resumo do mês"

Escopo: apenas `src/routes/_authenticated/orcamentos.tsx`. Nenhuma outra página, cálculo, dado ou funcionalidade é alterada.

## O que será adicionado

Dentro do card "Resumo do mês" (que hoje exibe Total orçado, Total gasto, Restante e Utilizado), será acrescentado um **indicador automático de situação**, em faixa horizontal abaixo do Progress existente, calculado dinamicamente a partir dos orçamentos e das transações reais do mês selecionado (fonte já presente na página: `orcamentos` + `gastoPorCategoria`, derivado de `resumoMesQuery(mes)`).

## Regras do indicador

Calculado com `useMemo`, por orçamento do mês: `percentual = gasto / limite * 100`.

1. **Sob controle** (nenhuma categoria ≥ 80%): faixa verde (`bg-success/10`, `text-success`, `ring-success/20`, ícone `CheckCircle2`): "Orçamentos sob controle".
2. **Próximo do limite** (categorias entre 80% e 99%, nenhuma ≥ 100%): faixa amarela (`warning`, ícone `AlertTriangle`): aviso informando quantos orçamentos estão próximos do limite (ex.: "2 orçamentos estão próximos do limite"), listando os nomes das categorias.
3. **Limite atingido** (alguma categoria em exatamente 100%, nenhuma acima): faixa vermelha (`danger`, ícone `AlertTriangle`): informa que o limite foi atingido, com o nome da(s) categoria(s).
4. **Excedido** (uma ou mais categorias > 100%): faixa vermelha forte (`bg-danger/15`, `ring-danger/40`, `text-danger`, ícone `AlertTriangle`): alerta informando **quantos orçamentos foram excedidos** e o **valor total excedido em BRL** via `formatarMoeda` (soma de `gasto − limite` das categorias acima de 100%). Se houver também categorias entre 80–99%, o aviso menciona adicionalmente quantas estão próximas do limite.

Exemplo citado: Compras com orçamento de R$ 200,00 e gasto de R$ 250,00 → o resumo reconhece "1 orçamento excedido" e "R$ 50,00 excedidos".

## Comportamento

- Recalcula automaticamente ao trocar o mês (as queries já são chaveadas pelo mês) e a qualquer alteração de transações/orçamentos (invalidações já existentes).
- Não usa dados fixos ou mockados — somente os dados reais já carregados na página.
- A lógica individual dos cards de orçamento (níveis 0–69 / 70–89 / 90–99 / ≥100) permanece intocada; o indicador é um cálculo novo e independente, restrito ao bloco do resumo.

## Visual

- Segue o padrão atual das faixas de alerta da página (rounded-lg, px-3 py-2, ring-1, ícone à esquerda), tokens semânticos `success`/`warning`/`danger`, modo escuro e responsividade preservados; valores em moeda BRL.
