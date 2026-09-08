import { supabase } from "@/lib/supabase-client";

/** Lê a reivindicação "aal" do token da sessão atual (aal1 / aal2 / null). */
function lerAalDoToken(accessToken?: string | null): string | null {
  if (!accessToken) return null;
  const parte = accessToken.split(".")[1];
  if (!parte) return null;
  try {
    const json = atob(parte.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { aal?: string };
    return payload.aal ?? null;
  } catch {
    return null;
  }
}

/**
 * Decide se a etapa do código 2FA ainda precisa ser cumprida.
 *
 * Fonte da verdade: a lista de autenticadores do servidor (listFactors),
 * porque `getAuthenticatorAssuranceLevel()` depende da cópia local da sessão
 * e pode responder vazio mesmo com um autenticador confirmado.
 *
 * Nunca lança e nunca fica pendurado: em caso de falha ou demora, devolve
 * `false` para não trancar o usuário fora do app.
 */
export async function precisaSegundoFator(
  timeoutMs = 8000,
): Promise<boolean> {
  const verificacao = (async () => {
    const { data: sessao } = await supabase.auth.getSession();
    const token = sessao.session?.access_token;
    if (!token) return false;
    // Já cumpriu o segundo fator nesta sessão.
    if (lerAalDoToken(token) === "aal2") return false;

    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return false;
    return (data?.totp ?? []).some((f) => f.status === "verified");
  })();

  const limite = new Promise<boolean>((resolve) =>
    setTimeout(() => resolve(false), timeoutMs),
  );

  try {
    return await Promise.race([verificacao, limite]);
  } catch {
    return false;
  }
}
