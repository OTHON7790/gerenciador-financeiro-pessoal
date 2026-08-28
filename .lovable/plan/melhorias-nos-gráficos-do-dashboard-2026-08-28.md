# Melhorias nos gráficos do Dashboard

Confirmado no banco: hoje só existem transações em agosto/2026 (receitas R$ 4.760,00 e despesas R$ 2.250,50). Todos os meses anteriores aparecem zerados nos dois gráficos.

## O que muda

### 1. Dados de demonstração (apenas para meses sem transações reais)
- Criar um módulo novo `src/lib/demo-serie.ts` que gera valores históricos plausíveis em BRL (receitas entre ~R$ 3.800 e R$ 6.200, despesas entre ~R$ 2.100 e R$ 4.900), variando mês a mês de forma determinística (mesma sequência sempre, sem números aleatórios a cada render).
- Regra de prioridade: para cada mês do período, se houver qualquer transação real, usa-se exclusivamente o valor real. Só meses totalmente sem movimento recebem o valor de demonstração. Agosto/2026 continua exibindo os números reais atuais.
- Desativação automática: quando o usuário já tiver transações reais em 3 ou mais meses distintos, a demonstração deixa de ser aplicada e os gráficos passam a mostrar somente dados reais (inclusive meses zerados).
- Aviso discreto: pequeno texto "Dados de demonstração em meses sem transações" nos cartões, enquanto a demonstração estiver ativa.

### 2. Gráfico "Receitas x Despesas"
- Passa a usar a série com o preenchimento acima, eliminando meses vazios.
- Eixo vertical formatado em Real (R$ 1.500, R$ 4.000), sem o rótulo "k". Abreviação "mil" somente quando o valor exigir.
- Tooltip mantém o formato completo em R$.

### 3. Gráfico "Evolução financeira"
- Mantém as três linhas com cores distintas: Receitas (verde), Despesas (vermelho), Saldo (azul), reforçando o contraste do Saldo para não se confundir com as outras.
- Pontos visíveis em cada mês e ponto ampliado no hover.
- Tooltip mostra o mês no cabeçalho, o nome da série e o valor completo em R$.
- Filtros 3 / 6 / 12 meses e Personalizado passam a recalcular a série efetivamente exibida — hoje o intervalo personalizado e os períodos maiores podem ficar presos ao resultado anterior enquanto a nova consulta carrega; será garantida a atualização e a demonstração seguirá o período escolhido.
- Legenda clicável para ligar/desligar cada série permanece como está.

## O que não muda
Banco de dados, autenticação, transações, categorias, orçamentos, metas, cálculos financeiros, demais seções do Dashboard, menu lateral, tema claro/escuro e responsividade.

## Detalhes técnicos
- Arquivos afetados: `src/routes/_authenticated/dashboard.tsx` (consumo dos dados e eixos), `src/lib/format.ts` (formatador de eixo em BRL sem "k") e o novo `src/lib/demo-serie.ts`.
- A mesclagem real/demo acontece no cliente, sem gravar nada no banco.
