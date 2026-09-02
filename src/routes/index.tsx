import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
        {/* Glows discretos azul/ciano */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[36rem] max-w-5xl rounded-full bg-primary/20 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-glow-cyan/15 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/3 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[110px]"
        />

        {/* Header */}
        <header className="relative mx-auto w-full max-w-6xl px-4 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-primary to-glow-cyan shadow-lg shadow-primary/40">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Finanças Pessoal
            </span>
          </div>
        </header>

        {/* Hero centralizado */}
        <section className="relative flex flex-1 items-center justify-center py-8">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-glow-cyan/30 bg-card/60 px-4 py-2 text-sm font-semibold text-foreground shadow-sm shadow-primary/20 backdrop-blur">
              <Lock className="h-4 w-4 text-glow-cyan" />
              Acesso exclusivo após o login
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Suas finanças,{" "}
              <span className="bg-linear-to-r from-primary via-glow-cyan to-glow-cyan bg-clip-text text-transparent">
                sob controle
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg font-semibold leading-relaxed text-foreground/90 sm:text-xl lg:text-2xl">
              Organize transações, categorias, orçamentos, metas e relatórios em
              um só lugar — com privacidade total.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
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
            <p className="mx-auto mt-9 flex max-w-md items-center justify-center gap-2 text-base font-semibold text-foreground/90">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              Seus dados financeiros ficam protegidos e disponíveis somente após
              o login.
            </p>
          </div>
        </section>

        <footer className="relative">
          <div className="mx-auto max-w-6xl px-4 py-5 text-center text-sm font-semibold text-foreground/85">
            Finanças Pessoal · Feito para você gerenciar seu dinheiro com
            clareza.
          </div>
        </footer>
      </div>
    </div>
  );
}
