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
import type { ReactNode } from "react";

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
    <div className="dark min-h-screen">
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        {/* Glows discretos azul/ciano */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[32rem] max-w-5xl rounded-full bg-primary/15 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-64 -z-10 h-96 w-96 rounded-full bg-glow-cyan/10 blur-[120px]"
        />

        {/* Header */}
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-primary to-glow-cyan shadow-lg shadow-primary/40">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Finanças Pessoal
            </span>
          </div>
          <div className="flex gap-2">
            <Link to="/auth">
              <Button
                variant="ghost"
                className="text-foreground hover:bg-accent hover:text-foreground"
              >
                Entrar
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-linear-to-r from-primary to-glow-cyan font-semibold shadow-lg shadow-primary/40 transition-transform duration-200 hover:scale-[1.03]">
                Começar agora
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:pb-24 sm:pt-24">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-glow-cyan/30 bg-card/60 px-4 py-2 text-sm font-medium text-foreground/90 shadow-sm shadow-primary/20 backdrop-blur">
              <Lock className="h-4 w-4 text-glow-cyan" />
              Acesso exclusivo após o login
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Suas finanças,{" "}
              <span className="bg-linear-to-r from-primary via-glow-cyan to-glow-cyan bg-clip-text text-transparent">
                sob controle
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-foreground/80 sm:text-xl lg:text-2xl">
              Organize transações, categorias, orçamentos, metas e relatórios em
              um só lugar — com privacidade total.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="h-14 gap-2 bg-linear-to-r from-primary to-glow-cyan px-8 text-base font-bold text-primary-foreground shadow-xl shadow-primary/40 transition-all duration-200 hover:scale-[1.04] hover:shadow-primary/60"
                >
                  Criar conta grátis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-border/80 bg-card/50 px-8 text-base font-semibold text-foreground backdrop-blur transition-colors duration-200 hover:border-primary/50 hover:bg-card hover:text-foreground"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>
            <p className="mx-auto mt-10 flex max-w-md items-center justify-center gap-2 text-base font-medium text-foreground/85">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              Seus dados financeiros ficam protegidos e disponíveis somente após
              o login.
            </p>
          </div>
        </section>

        {/* Recursos */}
        <section className="relative mx-auto max-w-5xl px-4 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Recurso
              icon={<TrendingUp className="h-6 w-6" />}
              iconClass="bg-primary/15 text-primary"
              title="Transações"
              desc="Registre entradas e saídas do dia a dia."
            />
            <Recurso
              icon={<Tags className="h-6 w-6" />}
              iconClass="bg-nav-purple/15 text-nav-purple"
              title="Categorias"
              desc="Organize com cores e ícones personalizados."
            />
            <Recurso
              icon={<Target className="h-6 w-6" />}
              iconClass="bg-warning/15 text-warning"
              title="Orçamentos"
              desc="Defina limites mensais por categoria."
            />
            <Recurso
              icon={<Trophy className="h-6 w-6" />}
              iconClass="bg-nav-pink/15 text-nav-pink"
              title="Metas"
              desc="Planeje conquistas e acompanhe o progresso."
            />
            <Recurso
              icon={<PieChart className="h-6 w-6" />}
              iconClass="bg-nav-yellow/15 text-nav-yellow"
              title="Relatórios"
              desc="Visualize sua evolução em gráficos claros."
            />
          </div>
        </section>

        <footer className="relative border-t bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm font-medium text-foreground/75">
            Finanças Pessoal · Feito para você gerenciar seu dinheiro com
            clareza.
          </div>
        </footer>
      </div>
    </div>
  );
}

function Recurso({
  icon,
  iconClass,
  title,
  desc,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  desc: string;
}) {
  return (
    <Card className="group border-border/70 bg-card/60 shadow-sm shadow-primary/10 ring-1 ring-inset ring-white/5 backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20">
      <CardContent className="p-5">
        <div
          className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${iconClass}`}
        >
          {icon}
        </div>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground/75">
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}
