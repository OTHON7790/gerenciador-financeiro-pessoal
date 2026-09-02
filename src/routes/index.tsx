import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wallet,
  TrendingUp,
  Tags,
  Target,
  Trophy,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Finanças Pessoal · Gerencie suas receitas e despesas" },
      {
        name: "description",
        content:
          "Aplicativo completo de gestão financeira pessoal: transações, categorias, orçamentos, metas e relatórios.",
      },
      { property: "og:title", content: "Finanças Pessoal" },
      {
        property: "og:description",
        content:
          "Organize transações, categorias, orçamentos, metas e relatórios num só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Finanças Pessoal
          </span>
        </div>
        <div className="flex gap-2">
          <Link to="/auth">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link to="/auth">
            <Button>Começar agora</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-primary/15 blur-[120px]"
        />
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-14 text-center sm:pb-20 sm:pt-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Lock className="h-3.5 w-3.5 text-primary" />
            Acesso exclusivo após o login
          </div>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Suas finanças,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              sob controle
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Organize transações, categorias, orçamentos, metas e relatórios em
            um só lugar — com privacidade total.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="gap-1.5 shadow-lg shadow-primary/30">
                Criar conta grátis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Seus dados financeiros ficam protegidos e disponíveis somente após o
            login.
          </p>
        </div>
      </section>

      {/* Recursos */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Recurso
            icon={<TrendingUp className="h-5 w-5" />}
            title="Transações"
            desc="Registre entradas e saídas do dia a dia."
          />
          <Recurso
            icon={<Tags className="h-5 w-5" />}
            title="Categorias"
            desc="Organize com cores e ícones personalizados."
          />
          <Recurso
            icon={<Target className="h-5 w-5" />}
            title="Orçamentos"
            desc="Defina limites mensais por categoria."
          />
          <Recurso
            icon={<Trophy className="h-5 w-5" />}
            title="Metas"
            desc="Planeje conquistas e acompanhe o progresso."
          />
          <Recurso
            icon={<PieChart className="h-5 w-5" />}
            title="Relatórios"
            desc="Visualize sua evolução em gráficos claros."
          />
        </div>
      </section>

      <footer className="border-t bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
          Finanças Pessoal · Feito para você gerenciar seu dinheiro com clareza.
        </div>
      </footer>
    </div>
  );
}

function Recurso({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card className="border-border/70 bg-card/60 backdrop-blur transition-colors hover:border-primary/30">
      <CardContent className="p-5">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          {icon}
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}
