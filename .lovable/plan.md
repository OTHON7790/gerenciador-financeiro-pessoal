# 2FA opcional (TOTP) — Finanças Pessoais

Adicionar autenticação em dois fatores **opcional**, usando o recurso nativo de MFA
(TOTP) já disponível no backend do projeto. Nada de código improvisado: os segredos
ficam no serviço de autenticação, nunca no banco do app nem em texto simples.

## O que o usuário verá

### Nova área "Segurança" (`/seguranca`, dentro do app autenticado)
- Item **Autenticação em dois fatores (2FA)** com status **Ativada** / **Desativada**
  (padrão: Desativada).
- Se desativada: botão **Ativar 2FA** → abre diálogo com QR Code + chave manual para
  o app autenticador (Google Authenticator, Authy, 1Password etc.) e campo para o
  código de 6 dígitos que conclui a ativação.
- Se ativada: badge verde "Ativada" + botão **Desativar 2FA** (com confirmação).
- Link para a área no rodapé do menu lateral, junto do usuário/Sair.

### Login
- Quem **não** ativou o 2FA: entra exatamente como hoje, e-mail + senha.
- Quem ativou: após e-mail e senha, a mesma tela mostra um passo adicional
  "Código de verificação" (6 dígitos) antes de liberar as páginas protegidas.
  Botão "Voltar" cancela e volta ao formulário de login.

Visual escuro, responsivo e no padrão atual do app.

## Detalhes técnicos

- **Enroll**: `supabase.auth.mfa.enroll({ factorType: 'totp' })` → retorna QR (SVG) e
  `secret`; confirmação com `mfa.challenge` + `mfa.verify`. Fator não verificado é
  removido (`mfa.unenroll`) se o usuário cancelar.
- **Status**: `supabase.auth.mfa.listFactors()` (fatores TOTP com `status: 'verified'`).
- **Desativar**: `mfa.unenroll({ factorId })`, exigindo um código válido antes.
- **Login**: após `signInWithPassword`, checar
  `mfa.getAuthenticatorAssuranceLevel()`; se `currentLevel: 'aal1'` e
  `nextLevel: 'aal2'`, exibir o passo do código e chamar `mfa.challengeAndVerify`.
  Só então navegar para o destino.
- **Gate das rotas protegidas**: `src/routes/_authenticated/route.tsx` passa a
  redirecionar para `/auth` também quando o usuário tem 2FA pendente
  (`nextLevel === 'aal2'` e `currentLevel === 'aal1'`), evitando acesso com sessão
  parcial.
- Arquivos novos: `src/routes/_authenticated/seguranca.tsx` e
  `src/components/seguranca-2fa.tsx`. Alterações pontuais em
  `src/components/auth-panel.tsx`, `src/components/app-shell.tsx` e no gate.
- Sem migração de banco, sem alteração em transações, categorias, orçamentos, metas,
  previsões ou relatórios. Nenhum dado é apagado.

## Configuração externa necessária

- É preciso **habilitar o MFA/TOTP nas configurações de autenticação do backend**
  (feito por mim via ferramenta de configuração, sem ação sua) — sem isso o
  `enroll` retorna erro de recurso desabilitado.
- Nenhum serviço de terceiros, chave de API ou custo adicional.
- Risco a comunicar: quem ativar o 2FA e perder o app autenticador precisa de
  reset manual da conta; por isso o fluxo mostra a chave manual para backup.

## Ordem de implementação

1. Habilitar TOTP no backend de autenticação.
2. Componente `Seguranca2FA` (status, enroll com QR, verificação, desativar).
3. Rota `/seguranca` + link no menu lateral.
4. Passo de código no login (`auth-panel.tsx`).
5. Reforço do gate `_authenticated` para sessão aal1 pendente.
6. Verificação: login sem 2FA inalterado, ativar/desativar, login com 2FA,
   typecheck e checagem das rotas.
