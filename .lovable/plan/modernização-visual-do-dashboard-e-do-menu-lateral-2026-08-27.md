# Modernização visual do Dashboard e do menu lateral

Alteração puramente visual. Sem mudanças em banco de dados, autenticação, rotas, consultas, cálculos, transações, orçamentos, metas ou regras de negócio. Nenhum dado fictício.

## Menu lateral (azul-marinho)

- Sidebar passa a usar fundo azul-marinho escuro em ambos os temas (novos valores para os tokens `--sidebar*` no tema claro; no escuro permanece coerente).
- Texto claro, ícones com opacidade média; item selecionado com fundo azul vivo, texto branco e uma barra indicadora à esquerda; hover com azul translúcido.
- Marca (carteira) mantida com o chip em gradiente, agora sobre fundo escuro.
- Itens mantidos exatamente: Dashboard, Transações, Categorias, Orçamentos, Metas, Relatórios e Sair.
- Rodapé novo: avatar com inicial + e-mail do usuário logado (lido da sessão já existente, somente leitura), botão de tema claro/escuro e o botão Sair. Sem tocar em login/logout.
- Topbar mobile ganha o mesmo tom escuro; o Sheet lateral continua abrindo/fechando igual, com o mesmo conteúdo (nav + rodapé).

## Tema claro/escuro

- Novo `ThemeToggle` que alterna a classe `dark` no `<html>` e guarda a escolha em `localStorage`, com leitura após a hidratação (evita mismatch de SSR). Padrão: tema claro.
- Nenhuma dependência nova; usa o `@custom-variant dark` já configurado.

## Dashboard

- **Três cartões principais**: Saldo (azul), Receitas (verde), Despesas (vermelho) com faixa/realce colorido, ícone em círculo sólido, rótulo em maiúsculas discretas e valor bem maior (`text-3xl`/`4xl`, tabular-nums) para máxima hierarquia.
- **Gráficos**: cores mais fortes vindas dos tokens de chart, grid mais discreto, eixos com contraste legível, tooltip com moeda formatada, barras arredondadas e área do saldo com gradiente mais intenso; altura maior e melhor aproveitamento do espaço.
- **Transações recentes**: linhas com chip de categoria mais definido, separadores suaves, valor positivo em verde e negativo em vermelho com sinal claro e fonte tabular.
- **Metas**: cada meta em bloco delimitado, barra de progresso mais espessa e com cor por status (verde/âmbar/vermelho/azul já existentes), percentual em destaque.

## Técnico

- Arquivos afetados: `src/styles.css` (tokens da sidebar e ajustes de chart), `src/components/app-shell.tsx`, novo `src/components/theme-toggle.tsx`, `src/routes/_authenticated/dashboard.tsx`.
- Somente tokens semânticos, sem cores fixas em componentes.
- Responsividade e breakpoints atuais preservados; verificação com typecheck e conferência visual em desktop e mobile.
