# Plano: Seção "Planejamento da meta" na página Metas

Melhoria **somente visual e de cálculo** na página `/metas`. Nenhuma alteração em
banco de dados, autenticação, server functions, outras páginas ou funcionalidades
existentes (barra de progresso, status, botão Guardar, criar/editar/excluir).

## Escopo dos arquivos alterados
1. `src/lib/schemas.ts` — adicionar uma **nova** função `planejarMeta(meta)`.
   A função `progressoMeta` existente permanece **intacta** (continua alimentando a
   barra de progresso e o selo de status atual).
2. `src/routes/_authenticated/metas.tsx` — adicionar a seção
   "Planejamento da meta" dentro de `CardMeta`, **abaixo** do bloco de progresso
   atual. Nenhuma remoção de UI existente.

## Lógica de cálculo (`planejarMeta`)

Entrada: um objeto `Meta` (campos `valor_alvo`, `valor_acumulado`, `prazo`,
`criado_em`). Todos os cálculos são puros (cliente), recalculados a cada render,
então refletem automaticamente qualquer alteração de valor guardado/alvo/prazo.

```text
percentual   = valor_acumulado / valor_alvo * 100
restante     = max(valor_alvo - valor_acumulado, 0)

SE percentual >= 100:
    situacao = "concluida"        // verde + troféu, "Meta alcançada"
SE prazo ausente:
    situacao = "sem_prazo"        // mensagem neutra
SENÃO:
    hoje           = data de hoje (00:00)
    limite         = data do prazo (local, mesmo parser YYYY-MM-DD de progressoMeta)
    mesesRestantes = meses inteiros entre hoje e limite (>= 0 se no futuro)
    valorMensal    = restante / mesesRestantes  (quando mesesRestantes > 0)

    // ritmo: usar criado_em como início do plano
    totalMeses  = meses entre criado_em e limite
    mesesPassados = meses entre criado_em e hoje  (clamp [0, totalMeses])
    esperadoAgora = valor_alvo * (mesesPassados / totalMeses)
    ritmo = valor_acumulado / esperadoAgora      // quanto do esperado foi atingido

    SE limite < hoje (prazo vencido) OU mesesRestantes <= 0 com restante > 0:
        situacao = "risco"        // vermelho
    SENÃO SE mesesPassados == 0 OU ritmo >= 1:
        situacao = "boa"          // verde
    SENÃO SE ritmo >= 0.7:
        situacao = "atencao"      // amarelo
    SENÃO:
        situacao = "risco"        // vermelho
```

Casos de bordem tratados: prazo vencido, mesesPassados = 0 (meta recém-criada,
ainda não há ritmo → "boa"), totalMeses = 0 (prazo == criação → "risco" se não
concluída), restante = 0 (→ "concluida"). `valorMensal` arredondado para 2 casas
para exibição; `mesesRestantes` exibido como inteiro ("X mês(es)").

## Apresentação na seção "Planejamento da meta"

Dentro de `CardMeta`, após o bloco `<Progress>`/status atual, adicionar um bloco
separado por uma borda superior discreta (`border-t pt-4`) contendo:

1. **Título** "Planejamento da meta" — texto small, fonte semibold muted.
2. **Mensagem de destaque** (fonte maior, `text-base`/`text-lg`, boa legibilidade):
   - Com prazo: `Para alcançar sua meta até {formatarData(prazo)}, guarde
     aproximadamente {formatarMoeda(valorMensal)} por mês.`
   - Sem prazo: `Defina um prazo para calcular o valor mensal necessário.`
3. **Indicador de situação** — selo colorido com ícone, usando tokens semânticos
   já existentes (`success`, `warning`, `danger`, `primary`):
   - `concluida` → verde (`success`) + ícone `Trophy` + texto "Meta alcançada"
   - `boa` → verde (`success`) + ícone `CheckCircle2` + "Bom andamento"
   - `atencao` → amarelo (`warning`) + ícone `AlertTriangle` + "Atenção"
   - `risco` → vermelho (`danger`) + ícone `AlertTriangle` + "Risco"
4. **Linha de detalhes** (texto pequeno, `text-xs muted-foreground`) com os três
   valores: `Faltam {formatarMoeda(restante)}` ·
   `{mesesRestantes} mês(es) restante(s)` ·
   `{formatarMoeda(valorMensal)}/mês` — omitida quando não há prazo.

## Regras de não-regressão
- `progressoMeta` e seu `StatusMeta`/`rotulo`/cores **inalterados** — a barra de
  progresso e o selo atual continuam iguais.
- `MetaDialog`, criar/editar/excluir, `adicionarValorMeta` (botão Guardar),
  navegação e dashboard `CardMetas` **intactos**.
- Sem migrations, sem server functions, sem alterar `metas.functions.ts`,
  `queries.ts`, schema do banco ou outras rotas.
- Reaproveita helpers existentes: `formatarMoeda`, `formatarData` (de
  `@/lib/format`) e ícones Lucide já usados (`Trophy`, `AlertTriangle`,
  `CheckCircle2`).
- Cores via tokens OKLCH do design system (`bg-success/10 text-success` etc.),
  nunca hex hardcode — funciona em modo claro e escuro.

## Verificação
- Typecheck limpo (`tsgo`).
- Checagem no navegador (Playwright) na rota `/metas`: criar uma meta com prazo
  futuro e valor guardado parcial, validar mensagem de valor mensal e cor do
  indicador; criar meta sem prazo e validar a mensagem neutra; adicionar valor
  até 100% e validar "Meta alcançada" verde com troféu.
