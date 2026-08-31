# Novas categorias de despesa

Adicionar 7 categorias de despesa ao catálogo do app, sem apagar nem alterar nada do que já existe.

## Categorias a incluir

| Categoria | Ícone (Lucide) | Cor |
| --- | --- | --- |
| Energia Elétrica | zap | amarelo/âmbar |
| Água | droplets | azul |
| Gás | flame | laranja |
| Internet/Telefone | wifi | índigo |
| Dívidas/Parcelamentos | credit-card | vermelho escuro |
| Cuidados Pessoais | scissors | rosa |

"Assinaturas" já existe hoje na lista padrão de despesas, então será mantida como está (não será duplicada).

## Como as categorias chegam à conta do usuário

Hoje as categorias padrão só são criadas quando a conta ainda não tem nenhuma categoria. Como sua conta já tem categorias, as novas não apareceriam sozinhas.

Solução: tornar a rotina de categorias padrão **complementar e idempotente** — em vez de "só cria se estiver vazio", ela passa a inserir apenas as categorias padrão que ainda não existem pelo nome, usando inserção com `ignoreDuplicates`. Assim:

- Categorias já cadastradas (inclusive as que você renomeou, recoloriu ou criou) ficam intactas.
- As 6 novas aparecem automaticamente no próximo carregamento do app.
- Rodar de novo não duplica nada.

Se preferir não adicionar automaticamente, a alternativa é um botão "Adicionar categorias sugeridas" na página Categorias — diga qual prefere.

## Orçamentos, transações e relatórios

Nada muda na mecânica: orçamento é vinculado a `categoria_id` + mês/ano, e cada transação de despesa com aquela categoria e data dentro do mês já é somada ao orçamento correspondente. Como as novas categorias entram pelo mesmo caminho das atuais, elas funcionam imediatamente em Transações, Orçamentos, Dashboard, gráficos e Relatórios. Vou validar no navegador criando um orçamento em "Energia Elétrica" e uma despesa no mesmo mês, conferindo que o consumo aparece no orçamento.

## Detalhes técnicos

- `src/lib/default-categorias.ts`: acrescentar as 6 entradas novas.
- `src/lib/icones.ts`: mapear `zap`, `droplets`, `flame`, `wifi`, `credit-card`, `scissors` para os ícones Lucide correspondentes (fallback atual `Wallet` continua).
- `src/lib/categorias.functions.ts` → `garantirCategoriasPadrao`: remover o curto-circuito "count > 0"; passar a comparar com os nomes já existentes do usuário e inserir só o que falta (mantendo `upsert` com `onConflict: user_id,nome` e `ignoreDuplicates`).
- Nenhuma migração de banco, nenhuma alteração de layout, nenhum dado existente tocado.
