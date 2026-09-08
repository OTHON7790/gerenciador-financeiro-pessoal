import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/lib/supabase-client";

/** Anexa a sessão do cliente às funções protegidas do aplicativo. */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);