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
  Wallet,
  X,
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
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/categorias", label: "Categorias", icon: Tags },
  { to: "/orcamentos", label: "Orçamentos", icon: Target },
  { to: "/metas", label: "Metas", icon: Trophy },
  { to: "/previsoes", label: "Previsões", icon: LineChart },
  { to: "/relatorios", label: "Relatórios", icon: PieChart },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const ativo =
          location.pathname === item.to ||
          location.pathname.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              ativo
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                : "text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
          >
            {ativo && (
              <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary-foreground/80" />
            )}
            <Icon className="h-4 w-4 shrink-0" />
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
              <SheetHeader className="mb-6 flex flex-row items-center justify-between space-y-0">
                <SheetTitle asChild>
                  <div>
                    <Brand />
                  </div>
                </SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                  className="text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
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
