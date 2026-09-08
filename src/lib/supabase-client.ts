import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { brokeredPreviewStorage } from "@/integrations/supabase/previewAuthStorage";

// Credenciais públicas do cliente. As variáveis da build continuam sendo a
// fonte preferida; estes valores evitam que uma publicação válida fique sem
// conexão quando a plataforma não injetar VITE_SUPABASE_* no bundle.
const URL_PUBLICA_FALLBACK = "https://gcuyeebwclajhipcxxsx.supabase.co";
const CHAVE_PUBLICAVEL_FALLBACK =
  "sb_publishable_5MbbL_2Bs0sTUnv3f0F5BQ_6sQEnZwp";

// @ts-expect-error Acesso estático necessário para substituição pelo Vite.
const URL_PUBLICA = import.meta.env.VITE_SUPABASE_URL || URL_PUBLICA_FALLBACK;
const CHAVE_PUBLICAVEL =
  // @ts-expect-error Acesso estático necessário para substituição pelo Vite.
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || CHAVE_PUBLICAVEL_FALLBACK;

function criarFetchPublicavel(chave: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request
        ? input.headers
        : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // Chaves publicáveis atuais são opacas e devem ser enviadas em `apikey`.
    if (headers.get("Authorization") === `Bearer ${chave}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", chave);

    return fetch(input, { ...init, headers });
  };
}

function criarCliente() {
  return createClient<Database>(URL_PUBLICA, CHAVE_PUBLICAVEL, {
    global: { fetch: criarFetchPublicavel(CHAVE_PUBLICAVEL) },
    auth: {
      storage: brokeredPreviewStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let cliente: ReturnType<typeof criarCliente> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof criarCliente>, {
  get(_, prop, receiver) {
    cliente ??= criarCliente();
    return Reflect.get(cliente, prop, receiver);
  },
});