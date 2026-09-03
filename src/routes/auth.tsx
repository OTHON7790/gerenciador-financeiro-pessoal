import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth-panel";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar · Finanças Pessoais" },
      {
        name: "description",
        content:
          "Acesse sua conta do Finanças Pessoais para organizar receitas, despesas, orçamentos e metas.",
      },
      { property: "og:title", content: "Entrar · Finanças Pessoais" },
      {
        property: "og:description",
        content:
          "Acesse sua conta do Finanças Pessoais para organizar receitas, despesas, orçamentos e metas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return <AuthScreen />;
}
