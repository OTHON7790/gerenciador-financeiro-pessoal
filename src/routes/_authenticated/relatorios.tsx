import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PieChart as PieChartIcon, Wallet } from "lucide-react";
import { categoriasQuery, serieMensalQuery, evolucaoSaldoQuery, resumoMesQuery } from "@/lib/queries";
import {
  mesesAnteriores,
  mesAtual,
  formatarMoeda,
  formatarMoedaEixo,
  formatarMes,
} from "@/lib/format";
import { type Categoria } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios · Finanças Pessoal" },
      {
        name: "description",
        content: "Gráficos e análises das suas finanças ao longo do tempo.",
      },
    ],
  }),
  component: RelatoriosPage,
});

const CORES_GRAFICO = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
];

function RelatoriosPage() {
  const mes = mesAtual();
  const meses = useMemo(() => mesesAnteriores(6), []);

  const { data: categorias } = useSuspenseQuery(categoriasQuery);
  const { data: serie } = useSuspenseQuery(serieMensalQuery(meses));
  const { data: evolucao } = useSuspenseQuery(evolucaoSaldoQuery(meses));
  const { data: resumo } = useSuspenseQuery(resumoMesQuery(mes));

  const mapaCategorias = useMemo(() => {
    const m = new Map<string, Categoria>();
    for (const c of categorias) m.set(c.id, c);
    return m;
  }, [categorias]);

  const dadosSerie = serie.map((s) => ({
    mes: formatarMes(s.mes).slice(0, 3),
    receitas: s.receitas,
    despesas: s.despesas,
    saldo: s.receitas - s.despesas,
  }));

  const dadosEvolucao = evolucao.map((e) => ({
    mes: formatarMes(e.mes).slice(0, 3),
    saldo: e.saldo,
  }));

  const dadosPizza = resumo.porCategoria
    .map((g) => {
      const cat = g.categoria_id ? mapaCategorias.get(g.categoria_id) : undefined;
      return {
        nome: cat?.nome ?? "Sem categoria",
        valor: g.valor,
        cor: cat?.cor ?? "#64748b",
      };
    })
    .sort((a, b) => b.valor - a.valor);

  const totalDespesas = dadosPizza.reduce((s, d) => s + d.valor, 0);

  const config: ChartConfig = {
    receitas: { label: "Receitas", color: "var(--chart-1)" },
    despesas: { label: "Despesas", color: "var(--chart-2)" },
    saldo: { label: "Saldo", color: "var(--chart-3)" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Análise dos últimos {meses.length} meses.
        </p>
      </div>

      {/* Resumo do mês atual */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Receitas do mês</p>
            <p className="text-xl font-bold text-success">
              {formatarMoeda(resumo.receitas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Despesas do mês</p>
            <p className="text-xl font-bold text-danger">
              {formatarMoeda(resumo.despesas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saldo do mês</p>
            <p className="text-xl font-bold">{formatarMoeda(resumo.saldo)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Receitas x Despesas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receitas x Despesas por mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="h-[300px] w-full">
            <BarChart data={dadosSerie}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={45}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="receitas" fill="var(--color-receitas)" radius={4} />
              <Bar dataKey="despesas" fill="var(--color-despesas)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Evolução financeira */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" /> Evolução financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <ChartContainer
            config={config}
            className="h-[280px] w-full sm:h-[340px]"
          >
            <LineChart
              data={dadosSerie}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                interval="preserveStartEnd"
                minTickGap={8}
              />
              <YAxis
                tickFormatter={(v) => formatarMoedaEixo(Number(v))}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={72}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "4 4", strokeOpacity: 0.5 }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {config[name as keyof typeof config]?.label ?? name}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatarMoeda(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke="var(--color-receitas)"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 0, fill: "var(--color-receitas)" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="var(--color-despesas)"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 0, fill: "var(--color-despesas)" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="var(--color-saldo)"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 0, fill: "var(--color-saldo)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Despesas por categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChartIcon className="h-4 w-4" /> Despesas por categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPizza.length === 0 ? (
              <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Sem despesas em{" "}
                  {formatarMes(mes).replace(/^./, (c) => c.toUpperCase())}.
                </p>
              </div>
            ) : (
              <ChartContainer config={config} className="mx-auto h-[260px] w-full">
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="nome" hideLabel />}
                  />
                  <Pie
                    data={dadosPizza}
                    dataKey="valor"
                    nameKey="nome"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {dadosPizza.map((d, i) => (
                      <Cell key={i} fill={d.cor} />
                    ))}
                  </Pie>
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ChartContainer>
            )}
            {dadosPizza.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {dadosPizza.slice(0, 5).map((d) => (
                  <div
                    key={d.nome}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: d.cor }}
                      />
                      {d.nome}
                    </span>
                    <span className="font-medium">
                      {totalDespesas > 0
                        ? `${((d.valor / totalDespesas) * 100).toFixed(0)}%`
                        : "0%"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evolução do saldo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução do saldo acumulado</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[300px] w-full">
              <AreaChart data={dadosEvolucao}>
                <defs>
                  <linearGradient id="saldoRel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-saldo)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-saldo)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={50}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="saldo"
                  stroke="var(--color-saldo)"
                  fill="url(#saldoRel)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
