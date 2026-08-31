# Plano — Seletor de período da página Orçamentos (Ano + Mês separados)

## Contexto atual (confirmado em `src/routes/_authenticated/orcamentos.tsx`)
- O estado é uma única string `mes` no formato `"YYYY-MM"` (inicia no mês atual).
- Um único `Select` lista os 12 meses do ano corrente junto com o ano no rótulo.
- As setas ‹ › (`mudarAno`) trocam apenas o ano, mantendo o mês.
- Os dados (`orcamentosQuery`, `resumoMesQuery`, salvamento e edições) usam `mes` como chave — nada disso muda.

## Alterações propostas (somente `src/routes/_authenticated/orcamentos.tsx`)

1. **Dois seletores separados no lugar do seletor único:**
   - **Ano**: `Select` com as opções 2026, 2027, 2028, 2029 e 2030 (rótulo simples, ex. "2026").
   - **Mês**: `Select` com sempre os 12 meses (Janeiro a Dezembro), independente do ano escolhido.
   - O estado `mes` (`"YYYY-MM"`) continua sendo a fonte única de verdade; os seletores apenas leem/derivam dele (`ano = mes.slice(0,4)`, `mesNum = mes.slice(5,7)`) e o atualizam montando a string de volta.

2. **Setas com virada automática de ano:**
   - Nova função `mudarMes(delta)`: avança/retrocede o mês com módulo 12.
   - Dezembro → Janeiro avança o ano automaticamente; Janeiro → Dezembro retrocede o ano automaticamente (ex.: `2026-12` + 1 → `2027-01`; `2027-01` − 1 → `2026-12`).
   - Os rótulos `aria-label` das setas passam a refletir o mês/ano resultante.

3. **Layout:** a linha do seletor passa a mostrar `Ano: [select]   Mês: [select]   ‹ ›`, mantendo o visual atual (botões ghost, tamanhos e espaçamentos existentes), responsivo para celular.

## O que NÃO muda
- Banco de dados, RLS, orçamentos já cadastrados, vínculo `mes` por orçamento.
- Cálculos de totais, níveis de alerta, barras de progresso e banners do "Resumo do mês".
- Formulário de novo orçamento, edições de limite, exclusão, mês padrão (mês atual ao abrir).
- Demais páginas e o tema claro/escuro.

## Validação
- Typecheck (`bunx tsgo --noEmit -p tsconfig.json`).
- Automação no preview: trocar ano (2026→2027) confirma que os 12 meses aparecem; usar as setas em Dezembro/Janeiro confirma a virada de ano; verificar que orçamentos do mês continuam carregando corretamente.
