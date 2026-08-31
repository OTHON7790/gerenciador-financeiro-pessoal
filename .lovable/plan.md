# Categorias em ordem alfabética (A–Z)

## Objetivo
Todas as listas e seletores de categorias exibem as categorias em ordem alfabética real do português (acentos tratados corretamente: Água antes de Alimentação, Dívidas junto do D), de forma automática para categorias futuras.

## Situação atual
As categorias vêm do banco ordenadas por tipo e nome, mas essa ordenação é por bytes: nomes com acento (Água, Dívidas/Parcelamentos) acabam no fim da lista, depois do Z.

## Mudança
Ordenar as categorias em um único ponto central — a consulta compartilhada usada por Transações, Orçamentos, Relatórios, Dashboard e a página Categorias. Assim toda tela herda a ordem correta, e qualquer categoria nova entra automaticamente na posição certa.

Ordem final: primeiro por tipo (receita/despesa, como já é hoje), depois por nome de A a Z com comparação em português.

## Detalhes técnicos
- Em `src/lib/queries.ts`, adicionar um `select` em `categoriasQuery` que retorna a lista ordenada com `localeCompare(b.nome, "pt-BR", { sensitivity: "base" })`, mantendo o agrupamento por tipo.
- Nenhuma alteração em `listarCategorias` nem no banco.
- Consumidores (`transacoes.tsx`, `orcamentos.tsx`, `relatorios.tsx`, `dashboard.tsx`, `categorias.tsx`, `transacao-dialog.tsx`) continuam usando `categoriasQuery` sem mudanças — os filtros por tipo preservam a ordem.

## Fora do escopo
Nenhuma categoria criada, renomeada, excluída ou duplicada; nenhum dado alterado; nenhum ajuste de layout.
