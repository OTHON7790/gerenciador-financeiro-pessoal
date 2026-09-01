# Padronizar valores monetários (BRL) em todo o app

Uma única regra de entrada, conversão, cálculo e exibição de dinheiro, sem
mudar layout, cores, dados ou funcionalidades.

## O que foi verificado

- Existem hoje dois conversores em `src/lib/format.ts`: `paraFloat` (genérico,
  usado em Transações, Orçamentos e Metas/diálogo) e `parseMoedaBR` (só usado
  no campo "Adicionar valor (R$)" da tela Metas).
- `paraFloat` só remove o ponto quando ele é seguido de exatamente 3 dígitos,
  então casos como `1.250,75` funcionam, mas o comportamento diverge do
  `parseMoedaBR` em outros formatos — são duas regras diferentes convivendo.
- Campos monetários encontrados: `transacao-dialog.tsx` (valor da transação e
  campos de recorrência), `meta-dialog.tsx` (valor-alvo e já guardado),
  `orcamentos.tsx` (novo limite e edição inline do limite), `metas.tsx`
  (aporte). Todos usam `inputMode="decimal"` com texto livre.
- Exibição já é centralizada em `formatarMoeda` / `formatarMoedaCompacta` /
  `formatarMoedaEixo` (Intl pt-BR/BRL) — os cálculos de dashboard, relatórios e
  previsões somam números vindos do banco (`numeric(12,2)`), não strings.

## Passo 1 — Utilitário único

`parseMoedaBR` em `src/lib/format.ts` passa a ser a única função de entrada
monetária, com as regras confirmadas por teste:

```text
100        -> 100,00
100,50     -> 100,50
100.50     -> 100,50
1250,75    -> 1250,75
1250.75    -> 1250,75
1.250,75   -> 1250,75
1.250      -> 1250,00   (ponto com 3 dígitos = milhar)
R$ 2.500   -> 2500,00
vazio/lixo -> 0
```

Regra: vírgula sempre decimal; ponto é decimal apenas quando é o único ponto e
tem 1 ou 2 dígitos depois; caso contrário é milhar. Resultado sempre arredondado
em centavos (`Math.round(v * 100) / 100`).

Adicionar também `somarCentavos(...valores)` para somas/subtrações feitas em
centavos inteiros, evitando deslocamento de ponto flutuante.

## Passo 2 — Trocar todos os pontos de entrada

Substituir `paraFloat` por `parseMoedaBR` em:

- `src/components/transacao-dialog.tsx` (valor e validação)
- `src/components/meta-dialog.tsx` (valor-alvo, já guardado, validação)
- `src/routes/_authenticated/orcamentos.tsx` (novo limite e edição inline)

`paraFloat` é removido do arquivo (ou passa a apenas delegar) para não sobrar
uma segunda implementação.

## Passo 3 — Cálculos sem perda de centavos

- Agregações em `transacoes.functions.ts` e `previsoes.functions.ts` (receitas,
  despesas, saldo, acumulado, por categoria, orçado) passam a somar em centavos
  inteiros e dividir por 100 no final.
- `metas.functions.ts` já soma em centavos — mantido.
- Percentuais (orçamentos e metas) continuam calculados sobre os valores já
  normalizados; nenhuma faixa de alerta ou regra de negócio muda.

## Passo 4 — Exibição

Nada de layout muda. Apenas garantir que todo valor exibido passe por
`formatarMoeda` (ou as variantes de eixo/compacta) — revisão dos textos de
Dashboard, Relatórios, Previsões, Orçamentos, Metas e Transações para achar
qualquer número solto sem formatação.

## Preservado

- Botão "Guardar" continua ativo depois dos 100% da meta, e é permitido
  ultrapassar o valor-alvo.
- Nenhum dado já gravado é alterado; nenhuma migração de banco.
- Layout, cores, filtros de período e ícones intactos.

## Verificação

- Testes unitários em `src/lib/__tests__/format-moeda.test.ts` cobrindo todos os
  formatos da tabela acima, mais `somarCentavos`.
- Teste no navegador: cadastrar transação `1250.75` e conferir R$ 1.250,75 na
  lista e nos totais; definir orçamento `1.250,75`; aporte de meta `100.50`.
