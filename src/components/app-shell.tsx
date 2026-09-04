import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Target,
  PieChart,
  Trophy,
  LineChart,
  Menu,
  LogOut,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, cor: "azul" },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight, cor: "verde" },
  { to: "/categorias", label: "Categorias", icon: Tags, cor: "roxo" },
  { to: "/orcamentos", label: "Orçamentos", icon: Target, cor: "laranja" },
  { to: "/metas", label: "Metas", icon: Trophy, cor: "rosa" },
  { to: "/previsoes", label: "Previsões", icon: LineChart, cor: "ciano" },
  { to: "/relatorios", label: "Relatórios", icon: PieChart, cor: "amarelo" },
] as const;

const CORES_NAV = {
  azul: {
    icone: "text-primary",
    ativo: "bg-primary/20 dark:bg-primary/25 text-primary",
    barra: "bg-primary",
    hover: "hover:bg-primary/12 dark:hover:bg-primary/18",
  },
  verde: {
    icone: "text-success",
    ativo: "bg-success/20 dark:bg-success/25 text-success",
    barra: "bg-success",
    hover: "hover:bg-success/12 dark:hover:bg-success/18",
  },
  roxo: {
    icone: "text-nav-purple",
    ativo: "bg-nav-purple/20 dark:bg-nav-purple/25 text-nav-purple",
    barra: "bg-nav-purple",
    hover: "hover:bg-nav-purple/12 dark:hover:bg-nav-purple/18",
  },
  laranja: {
    icone: "text-warning",
    ativo: "bg-warning/20 dark:bg-warning/25 text-warning",
    barra: "bg-warning",
    hover: "hover:bg-warning/12 dark:hover:bg-warning/18",
  },
  rosa: {
    icone: "text-nav-pink",
    ativo: "bg-nav-pink/20 dark:bg-nav-pink/25 text-nav-pink",
    barra: "bg-nav-pink",
    hover: "hover:bg-nav-pink/12 dark:hover:bg-nav-pink/18",
  },
  ciano: {
    icone: "text-nav-cyan",
    ativo: "bg-nav-cyan/20 dark:bg-nav-cyan/25 text-nav-cyan",
    barra: "bg-nav-cyan",
    hover: "hover:bg-nav-cyan/12 dark:hover:bg-nav-cyan/18",
  },
  amarelo: {
    icone: "text-nav-yellow",
    ativo: "bg-nav-yellow/20 dark:bg-nav-yellow/25 text-nav-yellow",
    barra: "bg-nav-yellow",
    hover: "hover:bg-nav-yellow/12 dark:hover:bg-nav-yellow/18",
  },
} as const;


function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const ativo =
          location.pathname === item.to ||
          location.pathname.startsWith(item.to + "/");
        const Icon = item.icon;
        const cor = CORES_NAV[item.cor];
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              ativo
                ? cn(cor.ativo, "font-semibold")
                : cn(
                    "text-sidebar-foreground/90 hover:text-sidebar-foreground",
                    cor.hover,
                  ),
            )}

          >
            {ativo && (
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full",
                  cor.barra,
                )}
              />
            )}
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                cor.icone,
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 text-sidebar-primary-foreground shadow-soft">
        <Wallet className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-sidebar-foreground">Finanças</p>
        <p className="text-[11px] text-sidebar-muted-foreground">Pessoal</p>
      </div>
    </div>
  );
}

function useEmailUsuario() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (ativo) setEmail(data.session?.user.email ?? null);
    });
    return () => {
      ativo = false;
    };
  }, []);
  return email;
}

function RodapeUsuario({ onSair }: { onSair: () => void }) {
  const email = useEmailUsuario();
  const inicial = (email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="mt-6 space-y-3 border-t border-sidebar-border pt-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-foreground">
          {inicial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-sidebar-foreground">
            {email ?? "Carregando..."}
          </p>
          <p className="text-[11px] text-sidebar-muted-foreground">Conectado</p>
        </div>
      </div>
      <Link
        to="/seguranca"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-sidebar-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <ShieldCheck className="h-4 w-4" />
        Segurança da conta
      </Link>
      <div className="flex items-center justify-between gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={onSair}
          className="gap-2 text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Brand />
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <RodapeUsuario onSair={sair} />
      </aside>

      {/* Conteúdo */}
      <div className="lg:pl-64">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar/95 px-4 backdrop-blur lg:hidden">
          <Brand />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu"
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-72 flex-col border-sidebar-border bg-sidebar p-5"
            >
              <SheetHeader className="mb-6 flex flex-row items-center space-y-0">
                <SheetTitle asChild>
                  <div>
                    <Brand />
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
              <RodapeUsuario onSair={sair} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
