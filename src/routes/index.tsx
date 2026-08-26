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
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          100% gratuito · dados protegidos
        </div>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Suas finanças,{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            sob controle
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Registre receitas e despesas, organize por categorias, defina
          orçamentos mensais e acompanhe tudo em gráficos claros.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
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
