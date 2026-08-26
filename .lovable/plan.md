# Ícones Semânticos em Todo o App

Adicionar ícones semânticos (Lucide) de forma consistente em todas as telas, começando pela lista de transações. Apenas mudanças visuais — nenhuma alteração de funcionalidade, dados ou layout estrutural.

## O que será feito

### 1. Lista de transações (foco principal)
- Exibir o ícone da categoria ao lado de cada transação, em um círculo colorido:
  - Receita: fundo/texto verde (token `success`)
  - Despesa: fundo/texto coral (token `danger`)
  - Sem categoria: ícone genérico neutro (Wallet)
- Usar o helper existente `iconeCategoria()` de `src/lib/icones.ts`
- Ícones de ação (editar/excluir) padronizados com rótulos acessíveis

### 2. Demais telas (consistência)
- **Dashboard**: ícones já existentes nos cards de resumo serão mantidos; adicionar ícone de categoria nas últimas transações do dashboard
- **Metas**: ícone de status por meta (Trophy para concluída, Target em andamento, AlertTriangle para atrasada) mantendo as cores progressivas atuais
- **Orçamentos**: ícone de categoria ao lado do nome de cada orçamento
- **Categorias**: manter e reutilizar o mesmo padrão de círculo colorido
- **Formulários/diálogos**: ícone ao lado dos títulos dos diálogos (transação, categoria, meta)

## Regras
- Somente tokens semânticos existentes (`primary`, `success`, `warning`, `danger`, `muted`) — nenhuma cor hardcoded
- Ícones exclusivamente da biblioteca `lucide-react`
- Preservar responsividade, textos em português e todo comportamento existente
- Sem alterações no banco de dados ou nas server functions

## Verificação
- Typecheck limpo (`tsgo --noEmit`)
- Teste visual no navegador (transações, dashboard, metas, orçamentos) com o usuário de teste
