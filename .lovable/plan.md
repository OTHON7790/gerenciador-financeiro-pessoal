# Mais contraste e legibilidade no modo claro

Ajuste exclusivamente visual, feito nos valores de cor do tema claro. Nada de cálculos, dados, layout, navegação ou modo escuro.

## O que muda

- **Textos principais e títulos**: tom mais escuro e sólido, para leitura confortável em fundo claro.
- **Textos secundários** (legendas, rótulos "Categoria", "Limite", notas dos cartões): deixam de ser cinza-claro e passam a um cinza bem mais escuro, com contraste alto sobre branco.
- **Gráficos**: eixos, nomes dos meses, números e legendas usam o mesmo cinza escuro; as linhas de grade ficam levemente mais visíveis, sem poluir.
- **Bordas e divisórias**: bordas de cartões, campos de texto, seletores e separadores de listas ficam mais perceptíveis (hoje quase somem no fundo claro).
- **Fundo**: leve aumento da diferença entre o fundo da página e os cartões brancos, para os cartões se destacarem.
- **Cores de identificação**: verde (receitas), vermelho/coral (despesas), azul (saldo), laranja (atenção) e as cores das categorias e do menu continuam as mesmas na identidade; apenas os tons usados como texto pequeno ficam um pouco mais escuros quando necessário para leitura.

## Telas verificadas

Dashboard, Transações, Categorias, Orçamentos, Metas, Previsões, Relatórios e Segurança — além dos formulários e diálogos.

## Técnico

- Alterações apenas no bloco `:root` de `src/styles.css` (`--foreground`, `--muted-foreground`, `--border`, `--input`, `--background`, `--secondary-foreground`, `--accent-foreground` e ajuste fino de tons de `success`/`warning`/`danger` e `chart-*` usados como texto).
- O bloco `.dark` permanece byte a byte igual.
- Nenhum componente ou rota é alterado: todas as telas já usam os tokens semânticos (`text-muted-foreground`, `border`, `--color-chart-*`), então a mudança se propaga sozinha.
- Verificação: typecheck e conferência visual das páginas no modo claro em desktop e mobile, além de confirmar que o modo escuro segue idêntico.
