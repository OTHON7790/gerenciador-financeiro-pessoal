import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import {
  categoriasQuery,
  transacoesQuery,
  resumoMesQuery,
  serieMensalQuery,
  evolucaoSaldoQuery,
  garantirCategoriasPadrao,
} from "@/lib/queries";
import { mesesAnteriores, mesAtual, formatarMoeda, formatarData, formatarMes } from "@/lib/format";
import { type Categoria } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransacaoDialog } from "@/components/transacao-dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { iconeCategoria } from "@/lib/icones";
import { metasQuery } from "@/lib/queries";
import { progressoMeta } from "@/lib/schemas";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Finanças Pessoal" },
      {
        name: "description",
        content: "Visão geral das suas receitas, despesas e saldo do mês.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const mes = mesAtual();
  const meses = useMemo(() => mesesAnteriores(6), []);
  const queryClient = useQueryClient();
  const garantir = useServerFn(garantirCategoriasPadrao);

  const [dialogoAberto, setDialogoAberto] = useState(false);

  // Onboarding: garante categorias padrão no primeiro acesso
  useEffect(() => {
    garantir()
      .then((res) => {
        if (res.criadas > 0) queryClient.invalidateQueries({ queryKey: ["categorias"] });
      })
      .catch(() => {});
  }, [garantir, queryClient]);

  const { data: categorias } = useSuspenseQuery(categoriasQuery);
  const { data: transacoes } = useSuspenseQuery(transacoesQuery({ limite: 6 }));
  const { data: resumo } = useSuspenseQuery(resumoMesQuery(mes));
  const { data: serie } = useSuspenseQuery(serieMensalQuery(meses));
  const { data: evolucao } = useSuspenseQuery(evolucaoSaldoQuery(meses));

  const mapaCategorias = useMemo(() => {
    const m = new Map<string, Categoria>();
    for (const c of categorias) m.set(c.id, c);
    return m;
  }, [categorias]);

  const dadosSerie = serie.map((s) => ({
    mes: formatarMes(s.mes).replace(/^./, (c) => c.toUpperCase()),
    receitas: s.receitas,
    despesas: s.despesas,
  }));

  const dadosEvolucao = evolucao.map((e) => ({
    mes: formatarMes(e.mes).replace(/^./, (c) => c.toUpperCase()),
    saldo: e.saldo,
  }));

  const configGrafico: ChartConfig = {
    receitas: { label: "Receitas", color: "var(--chart-1)" },
    despesas: { label: "Despesas", color: "var(--chart-2)" },
    saldo: { label: "Saldo", color: "var(--chart-3)" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {formatarMes(mes).replace(/^./, (c) => c.toUpperCase())}
          </p>
        </div>
        <Button onClick={() => setDialogoAberto(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova transação
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardResumo
          titulo="Saldo do mês"
          valor={resumo.saldo}
          icon={<Wallet className="h-5 w-5" />}
          cor="text-primary"
        />
        <CardResumo
          titulo="Receitas"
          valor={resumo.receitas}
          icon={<TrendingUp className="h-5 w-5" />}
          cor="text-success"
        />
        <CardResumo
          titulo="Despesas"
          valor={resumo.despesas}
          icon={<TrendingDown className="h-5 w-5" />}
          cor="text-danger"
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receitas x Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={configGrafico} className="h-[240px] w-full">
              <BarChart data={dadosSerie}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="receitas" fill="var(--color-receitas)" radius={4} />
                <Bar dataKey="despesas" fill="var(--color-despesas)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução do saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={configGrafico} className="h-[240px] w-full">
              <AreaChart data={dadosEvolucao}>
                <defs>
                  <linearGradient id="saldoFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-saldo)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-saldo)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={50}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="saldo"
                  stroke="var(--color-saldo)"
                  fill="url(#saldoFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transações recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Transações recentes</CardTitle>
          <Link to="/transacoes">
            <Button variant="ghost" size="sm" className="gap-1">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {transacoes.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma transação ainda. Clique em “Nova transação” para começar.
            </div>
          ) : (
            <ul className="divide-y">
              {transacoes.map((t) => {
                const cat = t.categoria_id
                  ? mapaCategorias.get(t.categoria_id)
                  : null;
                const Icon = cat ? iconeCategoria(cat.icone) : Wallet;
                return (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-border/60"
                      style={{
                        backgroundColor: (cat?.cor ?? "#64748b") + "22",
                        color: cat?.cor ?? "#64748b",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat?.nome ?? "Sem categoria"} · {formatarData(t.data)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        t.tipo === "receita"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {t.tipo === "receita" ? "+" : "−"}
                      {formatarMoeda(t.valor)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <CardMetas />

      <TransacaoDialog
        open={dialogoAberto}
        onOpenChange={setDialogoAberto}
        categorias={categorias}
      />
    </div>
  );
}

function CardResumo({
  titulo,
  valor,
  icon,
  cor,
}: {
  titulo: string;
  valor: number;
  icon: React.ReactNode;
  cor: string;
}) {
  const fundo = cor.includes("success")
    ? "bg-success-soft"
    : cor.includes("danger")
      ? "bg-danger-soft"
      : "bg-primary-soft";
  return (
    <Card className="overflow-hidden hover:shadow-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${fundo} ${cor}`}
          >
            {icon}
          </span>
        </div>
        <p
          className={`mt-3 text-2xl font-bold tracking-tight ${
            valor < 0 ? "text-danger" : ""
          }`}
        >
          {formatarMoeda(valor)}
        </p>
      </CardContent>
    </Card>
  );
}


function CardMetas() {
  const { data: metas } = useSuspenseQuery(metasQuery);
  if (metas.length === 0) return null;

  const emAndamento = metas
    .filter((m) => progressoMeta(m).status !== "concluida")
    .slice(0, 3);
  const destaque = emAndamento.length > 0 ? emAndamento : metas.slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Metas</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/metas">
            Ver todas <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {destaque.map((meta) => {
          const { percentual, restante, status } = progressoMeta(meta);
          const barra =
            status === "concluida"
              ? "[&>div]:bg-success bg-success/15"
              : status === "atrasada"
                ? "[&>div]:bg-danger bg-danger/15"
                : percentual >= 70
                  ? "[&>div]:bg-warning bg-warning/15"
                  : "[&>div]:bg-primary bg-primary/15";
          return (
            <div key={meta.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{meta.nome}</span>
                <span className="text-muted-foreground">
                  {percentual.toFixed(0)}%
                </span>
              </div>
              <Progress
                value={Math.min(percentual, 100)}
                className={`h-2 ${barra}`}
              />
              <p className="text-xs text-muted-foreground">
                {restante > 0
                  ? `Faltam ${formatarMoeda(restante)} de ${formatarMoeda(meta.valor_alvo)}`
                  : "Objetivo alcançado"}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
