# Correção monetária do campo "Adicionar valor (R$)" — Metas

Correção restrita ao campo de aporte da tela Metas. Nada de layout, cores,
datas, planejamento ou outras telas muda, e nenhum dado cadastrado é alterado.

## O que foi verificado

- A meta "Viagem" está hoje com alvo R$ 2.500,00 e acumulado R$ 2.650,00 —
  confirmando o erro relatado.
- As colunas `valor_alvo` e `valor_acumulado` são `numeric(12,2)`, ou seja o
  banco guarda centavos corretamente; a perda acontece antes de gravar.
- O campo usa o conversor genérico `paraFloat`, que aceita texto livre. Em
  testes isolados ele converte "100,50" corretamente, então a causa exata do
  desvio ainda **não está confirmada** (provável entrada intermediária/colada
  em formato inesperado ou arredondamento em ponto flutuante).

Por isso o primeiro passo do trabalho é reproduzir o caso real antes de fechar
o diagnóstico; a correção abaixo endurece o caminho inteiro do valor.

## Passo 1 — Reproduzir

Rodar no navegador, autenticado, na tela Metas: digitar `100,50` numa meta com
R$ 2.500,00 e observar exatamente o número enviado ao servidor e o gravado.

## Passo 2 — Entrada monetária pt-BR dedicada

Novo helper de moeda (em `src/lib/format.ts`), usado só pelo campo de aporte:

- `parseMoedaBR(texto)`: aceita apenas dígitos, ponto e vírgula; trata vírgula
  como decimal e ponto como milhar; quando só há ponto e ele tem 1 ou 2 casas
  depois (ex.: `100.50`), interpreta como decimal; ignora `R$` e espaços;
  devolve o valor arredondado em centavos (`Math.round(v * 100) / 100`).

Exemplos garantidos: `100,50` → 100,50 · `1.250,75` → 1250,75 · `2500` →
2500,00 · `2.500,00` → 2500,00.

- O campo passa a filtrar a digitação para caracteres válidos e a exibir, em
  texto auxiliar discreto já existente no card, o valor interpretado em BRL
  antes de salvar (sem mudar layout/estrutura do formulário).

## Passo 3 — Sem perda de centavos no cálculo

Em `metas.functions.ts` (`adicionarValorMeta`), somar em centavos inteiros:
`Math.round(atual * 100) + Math.round(valor * 100)`, dividindo por 100 ao
gravar. Isso elimina qualquer deslocamento por ponto flutuante.

Comportamento preservado: continua permitido guardar depois dos 100% e
ultrapassar a meta; o botão "Guardar" continua ativo.

## Passo 4 — Exibição

Os valores já usam `formatarMoeda` (Intl pt-BR/BRL); nada muda além de garantir
que o valor gravado seja o correto.

## Verificação

- Testes unitários do `parseMoedaBR` com os exemplos acima.
- Teste no navegador: adicionar `100,50` a uma meta com R$ 2.500,00 e confirmar
  R$ 2.600,50 na tela e no banco; depois `1.250,75` e confirmar R$ 3.851,25.
- Nenhuma linha existente é apagada ou reescrita no banco.
