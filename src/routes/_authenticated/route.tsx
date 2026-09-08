import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { precisaSegundoFator } from "@/lib/mfa";
import { AppShell } from "@/components/app-shell";
import { useCategoriasSincronizadas } from "@/hooks/use-categorias-sincronizadas";
import { useRecorrenciasSincronizadas } from "@/hooks/use-recorrencias-sincronizadas";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    // 2FA opcional: sessão com segundo fator pendente não acessa o app.
    if (await precisaSegundoFator()) {
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: LayoutAutenticado,
});


function LayoutAutenticado() {
  // Fonte única: sincroniza as categorias padrão em qualquer tela do app
  useCategoriasSincronizadas();
  // Materializa as ocorrências das despesas recorrentes ativas
  useRecorrenciasSincronizadas();
  return <AppShell />;
}
