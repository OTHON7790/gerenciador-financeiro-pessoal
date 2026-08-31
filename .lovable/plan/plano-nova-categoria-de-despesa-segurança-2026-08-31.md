# Plano: Nova categoria de despesa "Segurança"

## Objetivo
Adicionar a categoria de despesa **Segurança** (ícone de escudo) para gastos como câmeras de vigilância, alarmes, monitoramento e manutenção de equipamentos de segurança.

## O que será alterado

1. **`src/lib/default-categorias.ts`**
   - Adicionar à lista `CATEGORIAS_PADRAO` a entrada:
     - nome: `Segurança`, tipo: `despesa`, cor: `#0f766e` (teal escuro — não conflita com as cores existentes), icone: `shield-check`.
   - Nenhuma entrada existente será modificada ou removida.

2. **`src/lib/icones.ts`**
   - Importar `ShieldCheck` do lucide-react e registrar a chave `"shield-check"` no mapa `MAPA`.

3. **Aparecimento automático (já existente, sem código extra)**
   - A função idempotente `garantirCategoriasPadrao` (src/lib/categorias.functions.ts) insere apenas as categorias padrão que ainda não existem para o usuário. Assim, ao abrir o app, "Segurança" será criada automaticamente para cada usuário.
   - A ordenação alfabética por `localeCompare` na `categoriasQuery` (src/lib/queries.ts) posiciona "Segurança" junto das demais em todos os seletores (Transações, Orçamentos, filtros, Previsões e Relatórios), pois todos consomem essa mesma query.

## O que NÃO será alterado
- Nenhuma categoria existente, dados cadastrados, transações, orçamentos, metas ou valores.
- Nenhum layout ou lógica financeira.
- Nenhuma migração de banco: a tabela `categorias` e as policies já suportam a nova linha.

## Verificação
- Confirmar que a categoria aparece em ordem alfabética nos seletores de Transações, Orçamentos, Previsões e Relatórios, com o ícone de escudo renderizado.
- Confirmar que nenhum dado existente foi modificado.
