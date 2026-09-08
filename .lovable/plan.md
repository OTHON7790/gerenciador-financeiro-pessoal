# Diagnóstico: login trava após clicar em ENTRAR (conta com 2FA)

## O que foi verificado agora

- As configurações de conexão estão completas — não é falta de variáveis.
- A conta othon.moraes65@gmail.com tem **um autenticador 2FA válido e confirmado** (criado em 04/09).
- Um teste de entrada com senha errada funciona normalmente: o pedido chega ao servidor e a mensagem de erro aparece. Ou seja, o caminho de erro está OK.
- Nos registros da conta **não há nenhuma entrada bem-sucedida desde 04/09**, apesar das tentativas de hoje.
- Com uma sessão de teste, a checagem que o app usa para decidir se pede o código 2FA respondeu **"nenhum nível de segurança"** (vazio), mesmo existindo um autenticador confirmado.

## Causa provável (ainda não confirmada em 100%)

O app faz **duas chamadas de autenticação em sequência imediata** ao clicar em ENTRAR:
1. valida e-mail e senha;
2. logo depois, pergunta se falta o segundo fator.

Duas coisas podem acontecer aí, e ambas explicam a tela girando sem mensagem:

1. **Travamento na segunda chamada.** Dentro do preview, a sessão é guardada por um canal assíncrono. A segunda pergunta é feita antes de a gravação terminar e fica esperando um bloqueio interno que nunca é liberado — a promessa nunca retorna, então o botão continua girando e nenhum erro é mostrado (o código só desliga o "carregando" depois dessa resposta).
2. **Resposta vazia da checagem de 2FA.** Foi isso que o teste mostrou: a checagem responde "vazio" em vez de "falta o segundo fator". Nesse caso o app não abre a tela do código, tenta ir para o Dashboard, e a portaria da área logada refaz a mesma checagem e devolve para a tela de login — indo e voltando sem mensagem alguma.

Em ambos os casos o problema é o **mesmo ponto do código**: a decisão de mostrar a etapa do código 2FA depende de uma checagem frágil, feita logo após o login e baseada na cópia local da sessão, em vez de olhar diretamente os autenticadores confirmados da conta.

## Passo 1 da correção: confirmar qual dos dois é

Registrar temporariamente (no console do navegador) o que a segunda checagem devolve logo após um login real bem-sucedido, para saber se ela trava ou se responde vazio.

## Correção proposta

1. **Decidir o 2FA pela lista de autenticadores**, não pelo "nível" da sessão: após validar a senha, consultar os autenticadores confirmados da conta; havendo um, abrir a etapa do código.
2. **Evitar o travamento**: garantir que a segunda consulta só ocorra depois que a sessão estiver gravada, e envolver todo o fluxo em proteção contra erro/tempo limite, sempre desligando o "carregando" e mostrando uma mensagem clara se algo falhar.
3. **Alinhar a portaria da área logada** para usar exatamente o mesmo critério, evitando idas e vindas entre login e Dashboard.
4. **Plano de resgate**: se ainda assim a conta ficar inacessível, é possível desativar o 2FA dessa conta pelo banco para você entrar e reativá-lo em seguida.

## Detalhes técnicos

- Arquivos envolvidos: `src/components/auth-panel.tsx` (função `entrar`) e `src/routes/_authenticated/route.tsx`.
- Hoje ambos usam `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`; no teste ele retornou `{currentLevel: null, nextLevel: null}` mesmo com fator `verified` em `auth.mfa_factors`, porque lê `session.user.factors` da cópia local.
- Trocar por `supabase.auth.mfa.listFactors()` (fonte da verdade no servidor) + `try/finally` com `setCarregando(null)` garantido.
- Nenhuma alteração em dados, cálculos, telas ou outras funcionalidades.
