# Orçamentos: alerta de atenção no nível amarelo

## Estado atual (verificado)

`src/routes/_authenticated/orcamentos.tsx` já implementa os três níveis pedidos:

- **Verde** (< 80%): selo "Dentro do orçamento".
- **Amarelo** (80%–99%): selo "Perto do limite".
- **Vermelho** (≥ 100%): selo "Orçamento estourado" + faixa vermelha "Você excedeu o orçamento em R$ X".

A porcentagem e os valores já são calculados automaticamente das despesas reais da categoria no mês selecionado (`gastoPorCategoria`, derivado de `resumoMesQuery(mes)`).

## O que será modificado

### Única alteração: adicionar a mensagem de atenção no nível amarelo

Hoje existe faixa de alerta apenas para o estouro (vermelho, ≥ 100%). Adicionar uma faixa amarela equivalente para o nível 80%–99%, logo acima da faixa vermelha existente:

```text
⚠️ Atenção: você já utilizou X% do orçamento desta categoria.
```

- Aparece quando `nivel === "warning"` (80% ≤ percentualReal < 100%) e `!estourou`.
- Usa os mesmos tokens/estilos do alerta vermelho já existente, porém em amarelo: `bg-warning/10`, `text-warning`, `ring-warning/20`, ícone `AlertTriangle`.
- `X` = `percentualReal.toFixed(0)` (já calculado por categoria).
- O alerta vermelho atual (`estourou`) permanece inalterado e tem prioridade (só um dos dois aparece por categoria, pois são mutuamente exclusivos: < 100% vs ≥ 100%).

### Nenhuma outra mudança

- Regras de cores, limiares (80% / 100%) e selos: mantidos.
- Cartão de resumo do mês, cartões de categoria, lista "Sem orçamento definido", formulário, edições/exclusões: inalterados.
- Sem mudanças em banco de dados, transações, metas, autenticação, server functions ou outras páginas.
- Cores apenas via tokens semânticos existentes (`success`, `warning`, `danger`).

## Detalhes técnicos

- Arquivo: `src/routes/_authenticated/orcamentos.tsx`, dentro do `map` de cada orçamento, imediatamente antes do bloco `{estourou && (...)}` atual (linhas ~455).
- Adicionar um bloco `{nivel === "warning" && !estourou && (...)}` espelhando a estrutura do alerta vermelho.
- `AlertTriangle` já está importado; nenhum import novo.
