# Orçamentos: sistema de alertas com quatro níveis

## Estado atual (verificado)

`src/routes/_authenticated/orcamentos.tsx` usa hoje **três** níveis de alerta, calculados a partir de `percentualReal = gasto / limite * 100`:

- **success** (< 80%): verde, selo "Dentro do orçamento".
- **warning** (80%–99%): amarelo, selo "Perto do limite" + faixa âmbar "Atenção: você já utilizou X%...".
- **danger** (≥ 100%): vermelho, selo "Orçamento estourado" + faixa vermelha "Você excedeu o orçamento em R$ X".

Os mesmos três níveis são usados em dois lugares do arquivo:
1. No **cartão de resumo do mês** (`totais`, linhas ~93–103 e ~234–243): `nivel`, barra `Progress` e cor do "% utilizado".
2. No **cartão de cada orçamento** (dentro do `orcamentos.map`, linhas ~321–469): `nivel`, `barra`, `textoNivel`, `selo`, `rotulo`, `SeloIcon` e as faixas de alerta.

Os dados já são reais: `gastoPorCategoria` vem de `resumoMesQuery(mes)` e `o.limite` vem de `orcamentosQuery(mes)`. Nenhum dado é inventado.

Tokens de cor disponíveis em `src/styles.css`: `--success` (verde), `--warning` (amarelo/laranja), `--danger` (vermelho), mais as variantes `-foreground` e `-soft` em modo claro e escuro. Não existe um token de "vermelho forte" separado.

## O que será modificado

### Única mudança: passar de 3 níveis para 4 níveis de alerta

Novos limiares e mensagens, conforme pedido:

| Faixa | Nível | Cor | Selo | Mensagem/faixa |
|-------|-------|-----|------|----------------|
| 0%–69% | `success` | verde | "Dentro do orçamento" | (nenhuma faixa) |
| 70%–89% | `warning` | amarelo/laranja | "Atenção: orçamento próximo do limite" | `⚠️ Atenção: orçamento próximo do limite (X%)` |
| 90%–99% | `alert` | vermelho | "Alerta: orçamento quase esgotado" | `⚠️ Alerta: orçamento quase esgotado (X%)` |
| ≥ 100% | `danger` | vermelho forte | "Orçamento excedido" | `⚠️ Orçamento excedido em R$ X` (existente) |

### Detalhes da implementação

**1. Cálculo do `nivel` (cartão de resumo e cartão por categoria):**

Substituir a lógica atual de 3 níveis por 4:

```ts
const nivel =
  percentualReal >= 100 ? "danger"
  : percentualReal >= 90 ? "alert"
  : percentualReal >= 70 ? "warning"
  : "success";
```

Aplicar nos dois pontos onde `nivel` é derivado:
- `totais` (linhas ~100–101).
- dentro do `orcamentos.map` (linhas ~328–333).

**2. Cartão de resumo do mês** — atualizar os mapas de cor/estilo para 4 níveis:
- Barra `Progress` (linhas ~236–242): adicionar classe para `alert` (= `[&>div]:bg-danger bg-danger/15`).
- Cor do "% utilizado" (linhas ~222–228): adicionar `alert: "text-danger"`.

**3. Cartão por categoria** — atualizar os mapas para 4 níveis (linhas ~334–359):
- `barra`: adicionar `alert: "[&>div]:bg-danger bg-danger/15"`.
- `textoNivel`: adicionar `alert: "text-danger"`.
- `selo`: adicionar `alert: "bg-danger/10 text-danger ring-danger/20"`.
- `rotulo`: adicionar `alert: "Alerta: orçamento quase esgotado"`; `warning` muda para `"Atenção: orçamento próximo do limite"`; `danger` muda para `"Orçamento excedido"`; `success` mantém `"Dentro do orçamento"`.
- `SeloIcon`: `success` → `CheckCircle2`; `warning`/`alert`/`danger` → `AlertTriangle`.

**4. Faixas de alerta (linhas ~455–469):**

Hoje existem duas faixas (`warning` e `estourou`). Substituir por três faixas mutuamente exclusivas, controladas pelo `nivel`:

- `nivel === "warning"`: faixa âmbar (`bg-warning/10 text-warning ring-warning/20`), texto:
  `Atenção: orçamento próximo do limite ({percentualReal.toFixed(0)}%).`
- `nivel === "alert"`: faixa vermelha (`bg-danger/10 text-danger ring-danger/20`), texto:
  `Alerta: orçamento quase esgotado ({percentualReal.toFixed(0)}%).`
- `nivel === "danger"` (excedido): faixa vermelha **forte** (`bg-danger/15 text-danger ring-danger/40`), texto existente:
  `Orçamento excedido em {formatarMoeda(gasto - o.limite)}.`

Como são mutuamente exclusivas (o `nivel` só assume um valor por categoria), apenas uma faixa aparece por cartão. A faixa de estouro mantém prioridade e o cálculo `gasto - o.limite`.

### Diferenciação visual "vermelho" vs "vermelho forte"

Como só existe o token `--danger` para vermelho, os dois níveis vermelhos (90–99% e ≥100%) usam o mesmo tom de vermelho, mas o nível **excedido** recebe **intensidade mais forte**:
- 90–99% (`alert`): `bg-danger/10`, `ring-danger/20` (vermelho padrão).
- ≥100% (`danger`): `bg-danger/15`, `ring-danger/40` (vermelho mais intenso/faixa mais marcada).

Isso mantém o visual atual, usa somente tokens existentes e respeita o modo claro/escuro (as opacidades funcionam em ambos). Não serão criados novos tokens em `src/styles.css`.

### O que NÃO muda

- Regras de cálculo (`gasto`, `percentual`, `percentualReal`, `estourou`): mantidas.
- Dados: continuam reais de `resumoMesQuery` + `orcamentosQuery`; nada fictício.
- Formulário de novo orçamento, edição inline de limite, exclusão, lista "Sem orçamento definido", seletor de mês: inalterados.
- Modo escuro, responsividade, layout, demais componentes: inalterados.
- Banco de dados, autenticação, server functions, transações, categorias, metas, dashboard e demais páginas: sem mudança.
- Nenhum import novo (`AlertTriangle` e `CheckCircle2` já estão importados).

## Detalhes técnicos

- Arquivo único: `src/routes/_authenticated/orcamentos.tsx`.
- Mudança concentrada em: bloco `totais` (~93–103), barra/cores do resumo (~222–243), e dentro do `orcamentos.map` (~328–469).
- Sem dependências novas, sem CSS, sem migrações, sem server functions.
