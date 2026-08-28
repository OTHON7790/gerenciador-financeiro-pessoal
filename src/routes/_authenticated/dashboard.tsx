import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useSuspenseQuery, useQueryClient, useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import {
  categoriasQuery,
  transacoesQuery,
  resumoMesQuery,
  serieMensalQuery,
  garantirCategoriasPadrao,
} from "@/lib/queries";
import {
  mesesAnteriores,
  mesesEntre,
  mesAtual,
  formatarMoeda,
  formatarMoedaEixo,
  formatarData,
  formatarMes,
} from "@/lib/format";
import { type Categoria } from "@/lib/schemas";
import { aplicarDemo } from "@/lib/demo-serie";

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
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
  

  const mapaCategorias = useMemo(() => {
    const m = new Map<string, Categoria>();
    for (const c of categorias) m.set(c.id, c);
    return m;
  }, [categorias]);

  const { dados: serieBase, demo: demoBarras } = useMemo(
    () => aplicarDemo(serie),
    [serie],
  );

  const dadosSerie = serieBase.map((s) => ({
    mes: formatarMes(s.mes).replace(/^./, (c) => c.toUpperCase()),
    receitas: s.receitas,
    despesas: s.despesas,
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
          tom="primary"
        />
        <CardResumo
          titulo="Receitas"
          valor={resumo.receitas}
          icon={<TrendingUp className="h-5 w-5" />}
          tom="success"
        />
        <CardResumo
          titulo="Despesas"
          valor={resumo.despesas}
          icon={<TrendingDown className="h-5 w-5" />}
          tom="danger"
        />
      </div>

      {/* Gráficos */}
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card className="min-w-0 overflow-hidden shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Receitas x Despesas</CardTitle>
            {demoBarras && (
              <p className="text-xs text-muted-foreground">
                Dados de demonstração em meses sem transações
              </p>
            )}
          </CardHeader>

          <CardContent className="min-w-0 overflow-hidden">
            <ChartContainer
              config={configGrafico}
              className="h-[260px] w-full min-w-0 sm:h-[300px]"
            >
              <BarChart
                data={dadosSerie}
                barGap={4}
                barCategoryGap="20%"
                margin={{ left: 4, right: 8, top: 8 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 4"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                  tickMargin={8}
                  interval="preserveStartEnd"
                  minTickGap={8}
                />
                <YAxis
                  tickFormatter={(v) => formatarMoedaEixo(Number(v))}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                  width={56}
                  tickMargin={4}
                />


                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <span className="flex w-full justify-between gap-4">
                          <span className="capitalize text-muted-foreground">
                            {name}
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatarMoeda(Number(value))}
                          </span>
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="receitas"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="despesas"
                  fill="var(--chart-2)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <CardEvolucaoFinanceira />

      </div>


      {/* Transações recentes */}
      <Card className="shadow-card">
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
            <ul className="divide-y divide-border/60">
              {transacoes.map((t) => {
                const cat = t.categoria_id
                  ? mapaCategorias.get(t.categoria_id)
                  : null;
                const Icon = cat ? iconeCategoria(cat.icone) : Wallet;
                const receita = t.tipo === "receita";
                return (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/60"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset"
                      style={{
                        backgroundColor: (cat?.cor ?? "#64748b") + "1f",
                        color: cat?.cor ?? "#64748b",
                        borderColor: "transparent",
                        boxShadow: `inset 0 0 0 1px ${(cat?.cor ?? "#64748b")}33`,
                      }}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{t.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat?.nome ?? "Sem categoria"} · {formatarData(t.data)}
                      </p>
                    </div>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${
                        receita
                          ? "bg-success/10 text-success"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      {receita ? "+" : "−"}
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

const PERIODOS = [3, 6, 12] as const;
type Periodo = (typeof PERIODOS)[number] | "custom";

const SERIES = [
  { chave: "receitas", rotulo: "Receitas", cor: "var(--chart-1)", largura: 2.5 },
  { chave: "despesas", rotulo: "Despesas", cor: "var(--chart-2)", largura: 2.5 },
  { chave: "saldo", rotulo: "Saldo", cor: "var(--chart-3)", largura: 3.25 },
] as const;

function CardEvolucaoFinanceira() {
  const [periodo, setPeriodo] = useState<Periodo>(6);
  const [ocultas, setOcultas] = useState<string[]>([]);
  const padrao = useMemo(() => mesesAnteriores(6), []);
  const [inicio, setInicio] = useState(padrao[0]!);
  const [fim, setFim] = useState(padrao[padrao.length - 1]!);

  const meses = useMemo(
    () =>
      periodo === "custom"
        ? mesesEntre(inicio, fim)
        : mesesAnteriores(periodo),
    [periodo, inicio, fim],
  );

  const { data: serie = [], isFetching } = useQuery({
    ...serieMensalQuery(meses),
    placeholderData: keepPreviousData,
  });

  // Mantém apenas os meses do período selecionado, mesmo enquanto
  // a consulta do novo intervalo ainda está carregando.
  const serieDoPeriodo = useMemo(
    () => serie.filter((s) => meses.includes(s.mes)),
    [serie, meses],
  );

  const { dados: serieFinal, demo } = useMemo(
    () => aplicarDemo(serieDoPeriodo),
    [serieDoPeriodo],
  );

  const dados = serieFinal.map((s) => ({
    mes: formatarMes(s.mes).replace(/^./, (c) => c.toUpperCase()),
    receitas: s.receitas,
    despesas: s.despesas,
    saldo: s.receitas - s.despesas,
  }));


  const config: ChartConfig = {
    receitas: { label: "Receitas", color: "var(--chart-1)" },
    despesas: { label: "Despesas", color: "var(--chart-2)" },
    saldo: { label: "Saldo", color: "var(--chart-3)" },
  };

  const alternar = (chave: string) =>
    setOcultas((atual) =>
      atual.includes(chave)
        ? atual.filter((c) => c !== chave)
        : [...atual, chave],
    );

  const botao = (ativo: boolean) =>
    `shrink-0 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
      ativo
        ? "bg-background text-foreground shadow-soft"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <Card className="min-w-0 overflow-hidden shadow-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="min-w-0 space-y-0.5">
          <CardTitle className="text-base">Evolução financeira</CardTitle>
          {demo && (
            <p className="text-xs text-muted-foreground">
              Dados de demonstração em meses sem transações
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-wrap gap-1 rounded-lg bg-muted p-1">
          {PERIODOS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriodo(p)}
              className={botao(periodo === p)}
            >
              {p} meses
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPeriodo("custom")}
            className={botao(periodo === "custom")}
          >
            Personalizado
          </button>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 space-y-3 overflow-hidden">
        {periodo === "custom" && (
          <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/30 p-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground">
              Mês inicial
              <input
                type="month"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground">
              Mês final
              <input
                type="month"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              />
            </label>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {SERIES.map((s) => {
            const ativa = !ocultas.includes(s.chave);
            return (
              <button
                key={s.chave}
                type="button"
                onClick={() => alternar(s.chave)}
                aria-pressed={ativa}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  ativa
                    ? "border-border bg-background text-foreground"
                    : "border-dashed border-border/60 text-muted-foreground line-through opacity-60"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border-2"
                  style={{
                    borderColor: s.cor,
                    backgroundColor: ativa ? s.cor : "transparent",
                  }}
                />
                {s.rotulo}
              </button>
            );
          })}
        </div>
        <ChartContainer
          config={config}
          className={`h-[260px] w-full transition-opacity sm:h-[300px] ${
            isFetching ? "opacity-70" : "opacity-100"
          }`}
        >
          <LineChart data={dados} margin={{ left: 4, right: 8, top: 8 }}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
              tickMargin={8}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tickFormatter={(v) => formatarMoedaEixo(Number(v))}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--muted-foreground)"
              width={72}
            />
            <ChartTooltip
              cursor={{
                stroke: "var(--muted-foreground)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
                strokeOpacity: 0.6,
              }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <span className="flex w-full justify-between gap-4">
                      <span className="capitalize text-muted-foreground">
                        {name}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatarMoeda(Number(value))}
                      </span>
                    </span>
                  )}
                />
              }
            />
            {SERIES.filter((s) => !ocultas.includes(s.chave)).map((s) => (
              <Line
                key={s.chave}
                type="monotone"
                dataKey={s.chave}
                name={s.rotulo}
                stroke={s.cor}
                strokeWidth={s.largura}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={{ r: 3.5, strokeWidth: 2, stroke: "var(--card)", fill: s.cor }}
                activeDot={{ r: 6.5, strokeWidth: 2.5, stroke: "var(--card)" }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const TONS = {
  primary: {
    barra: "bg-primary",
    chip: "bg-primary text-primary-foreground",
    valor: "text-foreground",
    brilho: "bg-primary/10",
  },
  success: {
    barra: "bg-success",
    chip: "bg-success text-success-foreground",
    valor: "text-success",
    brilho: "bg-success/10",
  },
  danger: {
    barra: "bg-danger",
    chip: "bg-danger text-danger-foreground",
    valor: "text-danger",
    brilho: "bg-danger/10",
  },
} as const;

function CardResumo({
  titulo,
  valor,
  icon,
  tom,
}: {
  titulo: string;
  valor: number;
  icon: React.ReactNode;
  tom: keyof typeof TONS;
}) {
  const t = TONS[tom];
  return (
    <Card className="relative overflow-hidden shadow-card transition-shadow hover:shadow-lg">
      <span className={`absolute inset-x-0 top-0 h-1 ${t.barra}`} />
      <span
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${t.brilho}`}
      />
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {titulo}
          </p>
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-soft ${t.chip}`}
          >
            {icon}
          </span>
        </div>
        <p
          className={`mt-4 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl ${
            tom === "primary" && valor < 0 ? "text-danger" : t.valor
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
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Metas</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/metas">
            Ver todas <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {destaque.map((meta) => {
          const { percentual, restante, status } = progressoMeta(meta);
          const barra =
            status === "concluida"
              ? "[&>div]:bg-success bg-success/20"
              : status === "atrasada"
                ? "[&>div]:bg-danger bg-danger/20"
                : percentual >= 70
                  ? "[&>div]:bg-warning bg-warning/20"
                  : "[&>div]:bg-primary bg-primary/20";
          const corTexto =
            status === "concluida"
              ? "text-success"
              : status === "atrasada"
                ? "text-danger"
                : percentual >= 70
                  ? "text-warning"
                  : "text-primary";
          return (
            <div
              key={meta.id}
              className="space-y-2 rounded-xl border border-border/70 bg-muted/30 p-4"
            >
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate font-semibold">{meta.nome}</span>
                <span className={`text-base font-bold tabular-nums ${corTexto}`}>
                  {percentual.toFixed(0)}%
                </span>
              </div>
              <Progress
                value={Math.min(percentual, 100)}
                className={`h-2.5 ${barra}`}
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
