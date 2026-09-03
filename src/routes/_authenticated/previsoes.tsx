import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { previsaoAnualQuery } from "@/lib/queries";
import {
  formatarMoeda,
  formatarMoedaEixo,
  formatarMes,
  mesAtual,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  PeriodoSelector,
  NOMES_MESES,
  mesInicialValido,
} from "@/components/periodo-selector";

export const Route = createFileRoute("/_authenticated/previsoes")({
  head: () => ({
    meta: [
      { title: "Previsões Financeiras · Finanças Pessoal" },
      {
        name: "description",
        content:
          "Compare receitas previstas, despesas orçadas e gastos reais mês a mês.",
      },
      { property: "og:title", content: "Previsões Financeiras" },
      {
        property: "og:description",
        content:
          "Acompanhe o previsto x realizado das suas finanças ao longo do ano.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    void context.queryClient.ensureQueryData(
      previsaoAnualQuery(new Date().getFullYear()),
    ),
  component: PrevisoesPage,
});


const config = {
  receitas: { label: "Receitas", color: "#16a34a" },
  despesasPrevistas: { label: "Despesas previstas", color: "#f97316" },
  gastosReais: { label: "Gastos reais", color: "#ef4444" },
  saldoProjetado: { label: "Saldo projetado", color: "#2563eb" },
} satisfies ChartConfig;

function nivelDe(percentual: number) {
  if (percentual >= 100)
    return { chave: "excedido", texto: "Excedido", classe: "bg-red-600 text-white" } as const;
  if (percentual >= 90)
    return { chave: "alerta", texto: "Alerta", classe: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" } as const;
  if (percentual >= 70)
    return { chave: "atencao", texto: "Atenção", classe: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" } as const;
  return { chave: "controle", texto: "Controle", classe: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" } as const;
}

function PrevisoesPage() {
  const [mes, setMes] = useState(() => mesInicialValido(mesAtual()));

  const ano = Number(mes.slice(0, 4));
  const mesNum = Number(mes.slice(5, 7));

  const { data: linhas } = useSuspenseQuery(previsaoAnualQuery(ano));

  const dados = useMemo(
    () =>
      linhas.map((l, i) => {
        const receitas = l.receitaReal > 0 ? l.receitaReal : null;
        const despesasPrevistas = l.temOrcamento ? l.orcado : null;
        const gastosReais = l.temTransacoes ? l.despesaReal : null;
        const saldoProjetado =
          receitas === null && despesasPrevistas === null
            ? null
            : (receitas ?? 0) - (despesasPrevistas ?? 0);
        return {
          chave: l.mes,
          mes: NOMES_MESES[i]!.slice(0, 3),
          receitas,
          despesasPrevistas,
          gastosReais,
          saldoProjetado,
          temOrcamento: l.temOrcamento,
          temTransacoes: l.temTransacoes,
          orcado: l.orcado,
          receitaReal: l.receitaReal,
          despesaReal: l.despesaReal,
        };
      }),
    [linhas],
  );

  const atual = dados[mesNum - 1]!;
  const anterior = mesNum > 1 ? dados[mesNum - 2] : undefined;

  const percentualAtual =
    atual.orcado > 0 ? (atual.despesaReal / atual.orcado) * 100 : 0;
  const altaDespesas =
    anterior && anterior.despesaReal > 0
      ? (atual.despesaReal - anterior.despesaReal) / anterior.despesaReal
      : 0;

  const cards = [
    {
      titulo: "Receitas previstas",
      valor: atual.receitas,
      icone: TrendingUp,
      classe: "text-success",
      nota:
        atual.receitaReal > 0
          ? "Receita real do mês"
          : "Nenhuma receita lançada no mês",
    },
    {
      titulo: "Despesas previstas",
      valor: atual.despesasPrevistas,
      icone: Target,
      classe: "text-warning",
      nota: atual.temOrcamento
        ? "Soma dos orçamentos do mês"
        : "Nenhum orçamento definido",
    },
    {
      titulo: "Gastos reais",
      valor: atual.gastosReais,
      icone: TrendingDown,
      classe: "text-danger",
      nota: atual.temTransacoes
        ? "Despesas lançadas no mês"
        : "Nenhuma transação no mês",
    },
    {
      titulo: "Saldo projetado",
      valor: atual.saldoProjetado,
      icone: Wallet,
      classe:
        (atual.saldoProjetado ?? 0) < 0 ? "text-danger" : "text-primary",
      nota: "Receitas previstas − despesas previstas",
    },
  ];


  return (
    <div className="space-y-6">
      {/* Cabeçalho + período */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Previsões Financeiras
          </h1>
          <p className="text-sm text-muted-foreground">
            Previsto x realizado a partir dos seus dados reais.
          </p>
        </div>
        <PeriodoSelector mes={mes} onChange={setMes} />
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icone;
          return (
            <Card key={c.titulo} className="min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.titulo}
                </CardTitle>
                <Icon className={cn("h-4 w-4", c.classe)} />
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-2xl font-semibold tabular-nums",
                    c.valor === null ? "text-muted-foreground" : c.classe,
                  )}
                >
                  {c.valor === null ? "Sem dados" : formatarMoeda(c.valor)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.nota}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas */}
      {((atual.saldoProjetado ?? 0) < 0 ||
        percentualAtual >= 100 ||
        altaDespesas > 0.3) && (
        <div className="space-y-2">
          {percentualAtual >= 100 && (
            <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Orçamento de {formatarMes(mes)} excedido: gastos de{" "}
                {formatarMoeda(atual.despesaReal)} contra{" "}
                {formatarMoeda(atual.orcado)} previstos.
              </span>
            </div>
          )}
          {(atual.saldoProjetado ?? 0) < 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Saldo projetado negativo ({formatarMoeda(atual.saldoProjetado ?? 0)})

                para {formatarMes(mes)}.
              </span>
            </div>
          )}
          {altaDespesas > 0.3 && (
            <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Despesas {Math.round(altaDespesas * 100)}% acima do mês anterior.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Gráfico */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" /> Evolução das previsões · {ano}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <ChartContainer
            config={config}
            className="h-[300px] w-full sm:h-[360px]"
          >
            <LineChart
              data={dados}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                interval="preserveStartEnd"
                minTickGap={4}
              />
              <YAxis
                tickFormatter={(v) => formatarMoedaEixo(Number(v))}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={72}
              />
              <ReferenceLine
                x={NOMES_MESES[mesNum - 1]!.slice(0, 3)}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
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
                type="linear"
                dataKey="receitas"
                stroke="var(--color-receitas)"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2, stroke: "var(--card)", fill: "var(--color-receitas)" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--card)" }}
              />
              <Line
                type="linear"
                dataKey="despesasPrevistas"
                stroke="var(--color-despesasPrevistas)"
                strokeWidth={2.5}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
              />
              <Line
                type="linear"
                dataKey="gastosReais"
                stroke="var(--color-gastosReais)"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2, stroke: "var(--card)", fill: "var(--color-gastosReais)" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--card)" }}
              />
              <Line
                type="linear"
                dataKey="saldoProjetado"
                stroke="var(--color-saldoProjetado)"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2, stroke: "var(--card)", fill: "var(--color-saldoProjetado)" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--card)" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Previsto x Realizado */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base">
            Despesas — Previsto x Realizado · {ano}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Mês</th>
                <th className="py-2 pr-3 text-right font-medium">
                  Despesas previstas
                </th>
                <th className="py-2 pr-3 text-right font-medium">
                  Despesas realizadas
                </th>
                <th className="py-2 pr-3 text-right font-medium">Restante do orçamento</th>
                <th className="py-2 pr-3 text-right font-medium">% usado</th>
                <th className="py-2 text-right font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((d, i) => {
                const pct = d.orcado > 0 ? (d.gastosReais / d.orcado) * 100 : 0;
                const nivel = nivelDe(pct);
                const diferenca = d.orcado - d.gastosReais;
                const selecionado = i === mesNum - 1;
                return (
                  <tr
                    key={d.chave}
                    className={cn(
                      "border-b last:border-0",
                      selecionado && "bg-muted/50",
                    )}
                  >
                    <td className="py-2 pr-3 font-medium">{NOMES_MESES[i]}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {d.temOrcamento ? (
                        formatarMoeda(d.orcado)
                      ) : (
                        <span className="text-muted-foreground">Sem dados</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {d.temTransacoes ? (
                        formatarMoeda(d.gastosReais)
                      ) : (
                        <span className="text-muted-foreground">Sem dados</span>
                      )}
                    </td>
                    <td
                      className={cn(
                        "py-2 pr-3 text-right tabular-nums",
                        d.temOrcamento &&
                          (diferenca < 0
                            ? "text-danger"
                            : "text-success"),
                      )}
                    >
                      {d.temOrcamento ? (
                        formatarMoeda(diferenca)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {d.temOrcamento ? (
                        `${Math.round(pct)}%`
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {d.temOrcamento ? (
                        <Badge className={cn("gap-1", nivel.classe)}>
                          {nivel.chave === "controle" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {nivel.texto}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sem dados
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
