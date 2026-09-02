import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  Tags,
  Target,
  PieChart,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Finanças Pessoal · Gerencie suas receitas e despesas" },
      {
        name: "description",
        content:
          "Aplicativo completo de gestão financeira pessoal: transações, categorias, orçamentos e relatórios.",
      },
      { property: "og:title", content: "Finanças Pessoal" },
      {
        property: "og:description",
        content:
          "Gerencie receitas, despesas, orçamentos e acompanhe seus relatórios num só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // pequena conveniência: se já logado, segue para o dashboard
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary-soft/40">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">Finanças Pessoal</span>
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
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            100% gratuito · dados protegidos
          </div>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Suas finanças,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              sob controle
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            Registre receitas e despesas, organize por categorias, defina
            orçamentos mensais e acompanhe tudo em gráficos claros.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link to="/auth">
              <Button size="lg" className="gap-1.5">
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
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
            {["Transações ilimitadas", "Orçamentos por categoria", "Metas financeiras"].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <DashboardPreview />
      </section>


      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<TrendingUp className="h-5 w-5" />}
            title="Transações"
            desc="Registre receitas e despesas com filtros por mês, tipo e categoria."
          />
          <Feature
            icon={<Tags className="h-5 w-5" />}
            title="Categorias"
            desc="Organize com cores e ícones. Categorias padrão já vêm prontas."
          />
          <Feature
            icon={<Target className="h-5 w-5" />}
            title="Orçamentos"
            desc="Defina limites de gastos e veja o progresso em tempo real."
          />
          <Feature
            icon={<PieChart className="h-5 w-5" />}
            title="Relatórios"
            desc="Gráficos de receitas, despesas e evolução do saldo."
          />
        </div>
      </section>

      <footer className="border-t bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
          Finanças Pessoal · Feito para você gerenciar seu dinheiro com clareza.
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function DashboardPreview() {
  const meses = [
    { mes: "Abr", receitas: 62, despesas: 41 },
    { mes: "Mai", receitas: 70, despesas: 52 },
    { mes: "Jun", receitas: 58, despesas: 46 },
    { mes: "Jul", receitas: 81, despesas: 55 },
    { mes: "Ago", receitas: 76, despesas: 49 },
    { mes: "Set", receitas: 88, despesas: 58 },
  ];
  const max = 100;

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent blur-2xl"
      />
      <Card className="overflow-hidden border-border/70 shadow-xl">
        <div className="flex items-center justify-between border-b bg-card/80 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">Dashboard</span>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            Setembro · 2026
          </span>
        </div>

        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat rotulo="Saldo" valor="R$ 4.812,30" tom="primary" />
            <MiniStat rotulo="Receitas" valor="R$ 8.750,00" tom="success" />
            <MiniStat rotulo="Despesas" valor="R$ 3.937,70" tom="destructive" />
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold">Receitas x Despesas</span>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <i className="h-2 w-2 rounded-full bg-success" /> Receitas
                </span>
                <span className="flex items-center gap-1">
                  <i className="h-2 w-2 rounded-full bg-destructive" /> Despesas
                </span>
              </div>
            </div>
            <div className="flex h-28 items-end justify-between gap-2.5">
              {meses.map((m) => (
                <div key={m.mes} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-24 w-full items-end justify-center gap-1">
                    <div
                      className="w-1/3 rounded-t-sm bg-success"
                      style={{ height: `${(m.receitas / max) * 100}%` }}
                    />
                    <div
                      className="w-1/3 rounded-t-sm bg-destructive/80"
                      style={{ height: `${(m.despesas / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.mes}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold">Orçamento · Alimentação</span>
              <span className="text-muted-foreground tabular-nums">68%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[68%] rounded-full bg-success" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              R$ 812,00 de R$ 1.200,00 utilizados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({
  rotulo,
  valor,
  tom,
}: {
  rotulo: string;
  valor: string;
  tom: "primary" | "success" | "destructive";
}) {
  const tons = {
    primary: "border-primary/25 bg-primary/10 text-primary",
    success: "border-success/25 bg-success/10 text-success",
    destructive: "border-destructive/25 bg-destructive/10 text-destructive",
  } as const;
  return (
    <div className={`rounded-xl border p-3 ${tons[tom]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
        {rotulo}
      </p>
      <p className="mt-1 text-sm font-bold tabular-nums">{valor}</p>
    </div>
  );
}
