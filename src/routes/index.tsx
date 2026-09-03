import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth-panel";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Finanças Pessoais · Controle total do seu dinheiro" },
      {
        name: "description",
        content:
          "Organize suas finanças, acompanhe seus objetivos e tenha clareza total da sua vida financeira. Entre ou crie sua conta.",
      },
      { property: "og:title", content: "Finanças Pessoais" },
      {
        property: "og:description",
        content:
          "Organize suas finanças, acompanhe seus objetivos e tenha clareza total da sua vida financeira.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return <AuthScreen />;
}
