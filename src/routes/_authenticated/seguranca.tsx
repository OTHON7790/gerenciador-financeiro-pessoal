import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Seguranca2FA } from "@/components/seguranca-2fa";

export const Route = createFileRoute("/_authenticated/seguranca")({
  head: () => ({
    meta: [
      { title: "Segurança da conta · Finanças Pessoais" },
      {
        name: "description",
        content:
          "Gerencie a segurança da sua conta e ative a autenticação em dois fatores (2FA) opcional.",
      },
      { property: "og:title", content: "Segurança da conta · Finanças Pessoais" },
      {
        property: "og:description",
        content:
          "Gerencie a segurança da sua conta e ative a autenticação em dois fatores (2FA) opcional.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaginaSeguranca,
});

function PaginaSeguranca() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Segurança</h1>
          <p className="text-sm text-muted-foreground">
            Configurações de proteção da sua conta.
          </p>
        </div>
      </header>

      <Seguranca2FA />
    </div>
  );
}
