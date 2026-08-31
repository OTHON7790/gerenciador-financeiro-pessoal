# Padronizar filtros de período (Ano + Mês)

## Objetivo

Todas as telas com recorte por data passam a usar o mesmo controle: um seletor de **Ano** (2026–2030), um seletor de **Mês** (Janeiro a Dezembro, sempre os 12) e as setas anterior/próximo com virada automática de ano. O período selecionado filtra de fato as consultas de dados (mês/ano armazenado), não apenas o visual.

## Componente compartilhado

Criar `src/components/periodo-selector.tsx`, extraindo exatamente o padrão que já funciona hoje na página Orçamentos:

- props: `mes` ("AAAA-MM") e `onChange`
- Select Ano com 2026, 2027, 2028, 2029, 2030
- Select Mês com os 12 meses
- setas ChevronLeft/ChevronRight com rollover (Dez 2026 → Jan 2027, Jan 2027 → Dez 2026)
- mesma aparência atual (mesmos tamanhos, mesmos botões outline)

## Aplicação por página

**Orçamentos** — trocar o bloco atual pelo componente compartilhado. Comportamento e dados inalterados.

**Previsões Financeiras** — trocar os seletores atuais pelo componente compartilhado; continua carregando o ano selecionado e destacando o mês escolhido.

**Transações** — hoje há setas de ano e uma lista única de meses. Passa a ter os dois selects (Ano + Mês) e as setas navegando mês a mês com virada de ano. O filtro continua enviando o mês para a consulta de transações.

**Dashboard/Painel** — hoje é fixo no mês atual. Passa a ter o seletor Ano + Mês no topo, controlando os cards de Saldo/Receitas/Despesas, as transações recentes e o recorte dos gráficos. Os botões 3/6/12 meses e "Personalizado" do gráfico "Evolução financeira" continuam existindo, mas a janela passa a terminar no mês selecionado em vez do mês atual.

**Relatórios** — hoje é fixo nos últimos 6 meses. Passa a ter o seletor Ano + Mês; os cards e o resumo do mês usam o mês selecionado, e os gráficos usam a janela de meses terminando nele.

**Metas** — usa datas de início/prazo por meta, não filtro de período; permanece como está.

## Garantias

- Nenhuma transação, orçamento, categoria ou meta é criada, alterada ou apagada.
- Nenhuma migração de banco; só leitura filtrada pelo mês/ano já armazenado.
- Nada fora dos filtros de período é modificado; design atual preservado.

## Verificação

Testar no navegador: trocar ano e mês em cada página e confirmar que os números mudam conforme os dados reais do período (incluindo meses sem dados, que continuam mostrando zero/"Sem dados"), e que as setas viram o ano corretamente em dezembro e janeiro.
