# Orçamentos: controle mensal por categoria

## Estado atual (verificado)

A página Orçamentos já permite definir um limite por categoria de despesa por mês, já cruza com as despesas reais do mês selecionado e já mostra barra verde/amarelo/vermelho com o valor excedido. O diálogo de nova transação já invalida a query de orçamentos, então o valor gasto atualiza sozinho.

Falta refinar apresentação, resumo geral e a atualização quando a despesa é editada/excluída pela página Transações.

## O que será modificado

### 1. Cartão de resumo do mês (novo, no topo da página)
Totais somados de todos os orçamentos do mês selecionado:
- Total orçado
- Total gasto
- Total restante (ou total excedido, em vermelho)
- Barra geral com a mesma escala de cores

### 2. Cartão de cada categoria (melhor legibilidade)
Exibir de forma explícita os quatro valores pedidos:
- Orçamento mensal
- Gasto no mês
- Restante
- Porcentagem utilizada (em destaque, colorida pelo status)

Quando ultrapassar: faixa/selo vermelho "Excedeu R$ X" bem visível, com ícone de alerta. Selo de status por cartão: "Dentro do orçamento" (verde), "Perto do limite" (amarelo, a partir de 80%), "Orçamento estourado" (vermelho, a partir de 100%). Hoje o amarelo começa em 70%; passará para 80% para ficar mais coerente com "próximo do limite".

### 3. Categorias de despesa sem orçamento
Pequena lista abaixo, mostrando quanto foi gasto no mês em categorias que ainda não têm limite definido, com atalho para definir um limite.

### 4. Atualização automática
Adicionar a invalidação da chave `orcamentos` também na página Transações (edição e exclusão), para que o gasto do orçamento acompanhe qualquer alteração de despesa, não só a criação.

## Detalhes técnicos

- Arquivo principal: `src/routes/_authenticated/orcamentos.tsx` (apresentação e cálculos derivados em `useMemo`).
- Ajuste pontual em `src/routes/_authenticated/transacoes.tsx`: incluir `queryKey: ["orcamentos"]` nas invalidações.
- Cálculos continuam derivados de `orcamentosQuery(mes)` + `resumoMesQuery(mes)`; nenhum dado novo é gravado.
- Sem mudanças em banco de dados, autenticação, server functions ou outras páginas.
- Cores apenas via tokens semânticos existentes (`success`, `warning`, `danger`).
