# Correção: ícone "X" duplicado no menu lateral mobile

## Problema
Na versão mobile, ao abrir o menu lateral (Sheet), aparecem dois ícones "X" sobrepostos no canto superior direito.

## Causa
O componente `SheetContent` do Shadcn UI já inclui internamente um botão de fechar com ícone `X` (implementado via `SheetPrimitive.Close`). No entanto, em `src/components/app-shell.tsx`, dentro do `SheetHeader`, há um segundo botão `X` manual, causando a duplicação visual.

## Solução
Remover o botão "Fechar" manual do `SheetHeader` no `AppShell`, mantendo o botão padrão do `SheetContent`, que já fecha o menu corretamente.

## Ajustes planejados
- `src/components/app-shell.tsx`:
  - Excluir o `<Button>` com ícone `<X />` localizado dentro do `<SheetHeader>` do menu mobile.
  - Manter o `SheetHeader` com a marca (`Brand`) alinhada à esquerda.
  - Garantir que o botão padrão do `SheetContent` permaneça no canto superior direito e funcione normalmente.

## O que NÃO será alterado
- Menu, navegação, itens e rodapé do `AppShell`.
- Layout, cores, tipografia, temas e autenticação.
- Funcionalidades financeiras, banco de dados ou dados do usuário.
- Componente `SheetContent` do Shadcn UI.

## Verificação
- Typecheck sem erros.
- Preview mobile: abrir o menu lateral e confirmar que há apenas um ícone "X", alinhado no canto superior direito, que fecha o menu normalmente.
