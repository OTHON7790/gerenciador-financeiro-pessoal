import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardPreview() {
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
