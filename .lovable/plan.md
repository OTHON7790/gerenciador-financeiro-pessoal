# Plano: Refinar a lógica da seção "Planejamento da meta"

Melhoria **somente na lógica de cálculo e na apresentação** da seção
"Planejamento da meta" dentro de cada `CardMeta` em `src/routes/_authenticated/metas.tsx`.
Nenhuma outra funcionalidade é tocada: barra de progresso, status atual
(`progressoMeta`), botão Guardar, criar/editar/excluir, navegação, dashboard,
banco de dados, autenticação e server functions permanecem intactos.

## Escopo dos arquivos alterados

1. `src/lib/schemas.ts` — reescrever a função `planejarMeta` (e ajustar
   `SituacaoMeta`) para devolver os novos campos de planejamento mensal.
   `progressoMeta`, `parseDataLocal` e `mesesEntre` continuam iguais.
2. `src/routes/_authenticated/metas.tsx` — substituir **somente** o bloco
   interno da seção "Planejamento da meta" (linhas ~304–367) pela nova
   apresentação. O restante do `CardMeta` não muda.

## Nova lógica de cálculo (`planejarMeta`)

Entrada: `Meta` (campos `valor_alvo`, `valor_acumulado`, `prazo`,
`criado_em`). Cálculos puros no cliente, recalculados a cada render.

```text
SE valor_acumulado >= valor_alvo (100%):
    situacao = "concluida"

SE prazo ausente/inválido:
    situacao = "sem_prazo"

SENÃO:
    hoje        = hoje (00:00)
    limite      = parseDataLocal(prazo)
    inicio      = parseDataLocal(criado_em) ?? hoje

    totalMeses      = max(mesesEntre(inicio, limite), 1)
    mesesPassados  = clamp(mesesEntre(inicio, hoje), 0, totalMeses)
    mesesRestantes = max(mesesEntre(hoje, limite), 0)

    metaMensal      = valor_alvo / totalMeses
    esperadoHoje    = metaMensal * mesesPassados      // clamp [0, valor_alvo]
    acumulado       = valor_acumulado
    diferenca      = acumulado - esperadoHoje         // >0 adiantado, <0 atrasado
    restante       = max(valor_alvo - acumulado, 0)
    valorMensalNovo = mesesRestantes > 0 ? restante / mesesRestantes : restante

    SE limite < hoje (prazo vencido) e restante > 0:
        situacao = "fora"
    SENÃO SE acumulado >= esperadoHoje:
        situacao = "dentro"
    SENÃO SE acumulado >= esperadoHoje * 0.9:
        situacao = "atencao"
    SENÃO:
        situacao = "fora"
```

Exemplo do enunciado: meta R$ 6.000 em 6 meses → `metaMensal` R$ 1.000/mês.
Após 2 meses → `esperadoHoje` R$ 2.000. Se guardou R$ 2.000+ → "Dentro da
meta"; R$ 1.800 (90%) → "Atenção"; R$ 1.000 → "Fora da meta".

Retorno de `planejarMeta`:
```ts
{
  metaMensal: number;        // planejado por mês
  esperadoHoje: number;      // quanto deveria estar guardado
  acumulado: number;         // quanto realmente guardou
  diferenca: number;         // acumulado - esperadoHoje
  restante: number;
  mesesRestantes: number;
  valorMensalNovo: number;   // necessário daqui pra frente
  situacao: SituacaoMeta;    // "concluida" | "dentro" | "atencao" | "fora" | "sem_prazo"
  rotulo: string;            // "Meta alcançada" | "Dentro da meta" | "Atenção" | "Fora da meta" | "Sem prazo"
  atrasado: boolean;         // diferenca < 0 (para mensagem de recuperação)
}
```

Casos de borda tratados: prazo vencido, `mesesPassados = 0` (recém-criada →
`esperadoHoje = 0` → "dentro"), `totalMeses = 0` (limite == criação →
tratado como 1), `restante = 0` → "concluida". Valores monetários
arredondados para 2 casas na exibição via `formatarMoeda`.

## Apresentação na seção "Planejamento da meta"

Mesmo contêiner `border-t pt-4`, título "Planejamento da meta". Mantém os
estados `sem_prazo` e `concluida` atuais (mensagem neutra / troféu verde).
Para os demais estados, reorganiza em:

1. **Mensagem de destaque** (`text-base`/`text-lg`, boa legibilidade):
   - Dentro da meta: `Para alcançar sua meta até {data}, guarde
     aproximadamente {valorMensalNovo} por mês.`
   - Atrasada (`diferenca < 0`): `Você está {formatarMoeda(|diferenca|)}
     abaixo do planejado. Para recuperar o atraso e atingir sua meta no
     prazo, guarde {formatarMoeda(valorMensalNovo)} por mês nos próximos
     {mesesRestantes} mês(es).` (em `text-danger` quando "fora",
     `text-warning` quando "atencao").
   - Adiantada (`diferenca > 0`): `Você está {formatarMoeda(diferenca)}
     à frente do planejado.` (texto neutro/sucesso).

2. **Selo de situação** (cores semânticas já existentes + ícone Lucide):
   - `dentro` → verde (`bg-success/10 text-success`) + `CheckCircle2` +
     "Dentro da meta"
   - `atencao` → amarelo (`bg-warning/10 text-warning`) + `AlertTriangle`
     + "Atenção"
   - `fora` → vermelho (`bg-danger/10 text-danger`) + `AlertTriangle` +
     "Fora da meta"
   - `concluida` → verde + `Trophy` + "Meta alcançada"

3. **Linha de detalhes** (`text-xs muted-foreground`), em colunas
   responsivas (`grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3`), com os
   seis valores pedidos:
   - Meta mensal planejada: `{formatarMoeda(metaMensal)}/mês`
   - Deveria ter guardado: `{formatarMoeda(esperadoHoje)}`
   - Realmente acumulado: `{formatarMoeda(acumulado)}`
   - Diferença: `{formatarMoeda(diferenca)}` (verde se ≥0, vermelho se <0)
   - Meses restantes: `{mesesRestantes} mês(es)`
   - Novo valor/mês: `{formatarMoeda(valorMensalNovo)}/mês`

## Regras de não-regressão

- `progressoMeta` (barra de progresso, `%`, selo de status e cores do
  card) **inalterado** — continua governando o cabeçalho e a barra.
- Criar/editar/excluir, `adicionarValorMeta` (Guardar), `MetaDialog`,
  navegação, dashboard `CardMetas` **intactos**.
- Sem migrations, sem server functions, sem alterar `metas.functions.ts`,
  `queries.ts`, schema do banco ou outras rotas.
- Reaproveita `formatarMoeda`, `formatarData`, `parseDataLocal`,
  `mesesEntre` e ícones Lucide já usados (`Trophy`, `AlertTriangle`,
  `CheckCircle2`).
- Cores via tokens OKLCH (`bg-success/10 text-success`,
  `bg-warning/10 text-warning`, `bg-danger/10 text-danger`) — funciona em
  modo claro e escuro, sem hex hardcode.

## Verificação

- Typecheck limpo (`tsgo`).
- Checagem no navegador (Playwright) em `/metas`:
  1. Meta com prazo futuro e valor acumulado ≥ esperado → selo verde
     "Dentro da meta" + mensagem de valor mensal.
  2. Meta com valor acumulado um pouco abaixo (~90%) → selo amarelo
     "Atenção" + mensagem de recuperação.
  3. Meta com valor acumulado bem abaixo → selo vermelho "Fora da meta" +
     mensagem "Você está R$ X abaixo do planejado...".
  4. Meta sem prazo → mensagem neutra atual.
  5. Meta 100% → troféu verde "Meta alcançada".
