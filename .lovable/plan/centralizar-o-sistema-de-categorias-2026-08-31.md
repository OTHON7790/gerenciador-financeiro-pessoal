# Centralizar o sistema de categorias

## Situação atual (verificada no código)

- Todas as telas (Transações, Orçamentos, Relatórios, Dashboard, Previsões) já leem a mesma consulta compartilhada `categoriasQuery`, que ordena por tipo e depois por nome. Não há listas de categorias digitadas manualmente em componentes.
- A lista padrão fica em um único arquivo, e a categoria **Segurança** (ícone de escudo) já está presente nela.
- A causa real do problema: a rotina que cria as categorias padrão que faltam para o usuário (`garantirCategoriasPadrao`) só é disparada na tela **Dashboard**. Quem entra direto em Orçamentos (ou fica na aba sem passar pelo Dashboard depois de uma atualização da lista padrão) nunca recebe as categorias novas — por isso "Segurança" e outras não aparecem no seletor de **Novo orçamento**.
- Detalhe adicional em Orçamentos: o seletor esconde categorias que já têm orçamento no mês (comportamento correto e mantido), mas categorias inexistentes na conta simplesmente não existem para escolher.

## O que será feito

1. Mover a sincronização das categorias padrão do Dashboard para o layout autenticado, de modo que ela rode uma única vez em qualquer tela do app (Orçamentos, Transações, Previsões, Relatórios etc.).
2. Ao criar categorias faltantes, atualizar automaticamente o cache de categorias para que os seletores abertos passem a listá-las imediatamente, sem recarregar a página.
3. Remover o disparo duplicado no Dashboard, deixando uma única fonte de verdade para a criação e para a leitura das categorias.
4. Garantir ordenação alfabética (pt-BR, ignorando acentos) em toda a lista compartilhada, mantendo o agrupamento receita/despesa já existente nos seletores.
5. Confirmar que "Segurança" está na lista padrão com ícone de escudo.

## Verificação

- Abrir o app direto na tela **Orçamentos** (sem passar pelo Dashboard) e conferir que o seletor "Categoria" do card **Novo orçamento** lista as categorias novas, incluindo **Segurança**, em ordem alfabética.
- Conferir também os seletores de Transações, filtros, Previsões e Relatórios.

## Garantias

- Nenhuma transação, orçamento, meta ou valor existente é alterado ou excluído; apenas categorias padrão ausentes são inseridas (operação idempotente já existente).
- Nenhuma mudança de design ou layout.

## Detalhes técnicos

- Criar um hook compartilhado (ex.: `useCategoriasSincronizadas`) chamado em `src/routes/_authenticated/route.tsx`, que executa `garantirCategoriasPadrao` e invalida a queryKey `["categorias"]` quando `criadas > 0`.
- Retirar o `useEffect` de onboarding de `src/routes/_authenticated/dashboard.tsx`.
- Ajustar o `select` de `categoriasQuery` em `src/lib/queries.ts` para ordenação por nome com `localeCompare("pt-BR", { sensitivity: "base" })`.
- Nenhuma migração de banco necessária.
