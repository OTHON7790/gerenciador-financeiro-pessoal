# Corrigir o QR Code do 2FA

O 2FA já usa o recurso nativo de autenticação em dois fatores do backend (não é simulação):
a ativação chama o serviço de autenticação, que gera e guarda o segredo, e o código de 6 dígitos
é validado no servidor. O problema está na forma como o QR Code é exibido na tela.

## Causa provável

A tela mostra a imagem que o serviço devolve pronta (um desenho de QR embutido em texto).
Esse formato costuma falhar ao ser exibido diretamente em uma imagem no navegador, resultando
em um QR borrado, vazio ou ilegível para o aplicativo autenticador — mesmo com o segredo correto.

O mesmo retorno traz também o endereço `otpauth://` oficial, que é a fonte confiável.

## O que será feito

1. Desenhar o QR Code na própria tela a partir do endereço `otpauth://` devolvido pelo serviço
   de autenticação (biblioteca de geração de QR no navegador), em vez de usar a imagem pronta.
   Assim o QR e a chave manual passam a vir exatamente do mesmo segredo.
2. Identificar a conta no aplicativo autenticador como "Finanças Pessoais" + e-mail do usuário,
   para o registro aparecer com nome legível.
3. Descarte correto de tentativas: ao cancelar, sair da tela ou reiniciar a configuração, o
   registro pendente é removido no backend e um novo segredo é gerado do zero.
4. Mensagens de erro mais claras quando a ativação for recusada (por exemplo, recurso ainda
   não habilitado no serviço de autenticação) — e, se for esse o caso, habilito o recurso.
5. Verificação de que o recurso de dois fatores está ativo no serviço de autenticação do projeto.

Sem logs de segredo, sem gravar segredo ou código no banco do aplicativo.

## Detalhes técnicos

- Adicionar dependência `qrcode` (ou `qrcode.react`) e renderizar `data.totp.uri`.
- `mfa.enroll({ factorType: 'totp', issuer: 'Finanças Pessoais', friendlyName })`;
  guardar `id`, `uri`, `secret` em estado local.
- Limpeza: `mfa.unenroll` para fatores TOTP com `status !== 'verified'` antes de novo enroll,
  no cancelamento e no unmount do componente.
- Confirmação continua por `mfa.challengeAndVerify` (validação no servidor).
- Exibir `error.message` do backend em vez de texto genérico no enroll.
- Checar/ativar TOTP nas configurações de autenticação do projeto.

## O que NÃO muda

Layout, login, cadastro, recuperação de senha, gate das rotas protegidas, banco de dados e
todos os módulos financeiros permanecem exatamente como estão.
