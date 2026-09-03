import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Target,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Copy,
} from "lucide-react";
import {
  categoriasQuery,
  orcamentosQuery,
  resumoMesQuery,
  comprometidoMesQuery,
} from "@/lib/queries";
import {
  salvarOrcamento,
  excluirOrcamento,
  copiarOrcamentosMesAnterior,
} from "@/lib/orcamentos.functions";
import { type Categoria, type Orcamento } from "@/lib/schemas";
import { formatarMoeda, formatarMes, mesAtual } from "@/lib/format";
import { parseMoedaBR } from "@/lib/format";
import { iconeCategoria } from "@/lib/icones";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PeriodoSelector,
  mesInicialValido,
} from "@/components/periodo-selector";

export const Route = createFileRoute("/_authenticated/orcamentos")({
  head: () => ({
    meta: [
      { title: "Orçamentos · Finanças Pessoal" },
      {
        name: "description",
        content: "Defina limites de gastos por categoria e acompanhe o progresso.",
      },
    ],
  }),
  component: OrcamentosPage,
});

function OrcamentosPage() {
  const [mes, setMes] = useState(() => mesInicialValido(mesAtual()));

  const { data: categorias } = useSuspenseQuery(categoriasQuery);
  const { data: orcamentos, isPending } = useSuspenseQuery(orcamentosQuery(mes));
  const { data: resumo } = useSuspenseQuery(resumoMesQuery(mes));
  const { data: comprometido } = useSuspenseQuery(comprometidoMesQuery(mes));

  const queryClient = useQueryClient();
  const salvar = useServerFn(salvarOrcamento);
  const excluir = useServerFn(excluirOrcamento);
  const copiar = useServerFn(copiarOrcamentosMesAnterior);

  const orcamentosPorCategoria = useMemo(() => {
    const m = new Map<string, Orcamento>();
    for (const o of orcamentos) m.set(o.categoria_id, o);
    return m;
  }, [orcamentos]);

  const gastoPorCategoria = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of resumo.porCategoria)
      if (g.categoria_id) m.set(g.categoria_id, g.valor);
    return m;
  }, [resumo]);

  // Despesas recorrentes pendentes (valor comprometido) por categoria
  const comprometidoPorCategoria = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of comprometido.porCategoria)
      if (g.categoria_id) m.set(g.categoria_id, g.valor);
    return m;
  }, [comprometido]);

  const despesaCategorias = categorias.filter((c) => c.tipo === "despesa");

  const semOrcamento = useMemo(
    () =>
      despesaCategorias.filter(
        (c) =>
          !orcamentosPorCategoria.has(c.id) &&
          ((gastoPorCategoria.get(c.id) ?? 0) > 0 ||
            (comprometidoPorCategoria.get(c.id) ?? 0) > 0),
      ),
    [
      despesaCategorias,
      orcamentosPorCategoria,
      gastoPorCategoria,
      comprometidoPorCategoria,
    ],
  );

  const totais = useMemo(() => {
    const orcado = orcamentos.reduce((s, o) => s + o.limite, 0);
    const gasto = orcamentos.reduce(
      (s, o) => s + (gastoPorCategoria.get(o.categoria_id) ?? 0),
      0,
    );
    const comprometidoTotal = orcamentos.reduce(
      (s, o) => s + (comprometidoPorCategoria.get(o.categoria_id) ?? 0),
      0,
    );
    const utilizado = gasto + comprometidoTotal;
    const percentualReal = orcado > 0 ? (utilizado / orcado) * 100 : 0;
    const nivel =
      percentualReal >= 100 ? "danger"
      : percentualReal >= 90 ? "alert"
      : percentualReal >= 70 ? "warning"
      : "success";
    return {
      orcado,
      gasto,
      comprometido: comprometidoTotal,
      utilizado,
      percentualReal,
      nivel,
    } as const;
  }, [orcamentos, gastoPorCategoria, comprometidoPorCategoria]);

  // Indicador automático de situação das categorias (mês selecionado)
  const situacao = useMemo(() => {
    const excedidos: { nome: string; excesso: number }[] = [];
    const atingidos: string[] = [];
    const proximos: string[] = [];
    for (const o of orcamentos) {
      const utilizado =
        (gastoPorCategoria.get(o.categoria_id) ?? 0) +
        (comprometidoPorCategoria.get(o.categoria_id) ?? 0);
      const nome =
        despesaCategorias.find((c) => c.id === o.categoria_id)?.nome ??
        "Categoria";
      const percentual = o.limite > 0 ? (utilizado / o.limite) * 100 : 0;
      if (percentual > 100) {
        excedidos.push({ nome, excesso: utilizado - o.limite });
      } else if (percentual >= 100) {
        atingidos.push(nome);
      } else if (percentual >= 80) {
        proximos.push(nome);
      }
    }
    const totalExcedido = excedidos.reduce((s, e) => s + e.excesso, 0);
    const nivel =
      excedidos.length > 0 ? "excedido"
      : atingidos.length > 0 ? "atingido"
      : proximos.length > 0 ? "proximo"
      : "controle";
    return { excedidos, atingidos, proximos, totalExcedido, nivel } as const;
  }, [
    orcamentos,
    gastoPorCategoria,
    comprometidoPorCategoria,
    despesaCategorias,
  ]);


  // formulário de novo orçamento
  const [novaCategoria, setNovaCategoria] = useState<string>("");
  const [novoLimite, setNovoLimite] = useState("");

  const salvarMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        categoria_id: novaCategoria,
        mes,
        limite: parseMoedaBR(novoLimite),
      };
      return salvar({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      queryClient.invalidateQueries({ queryKey: ["previsoes"] });
      toast.success("Orçamento definido!");
      setNovaCategoria("");
      setNovoLimite("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizarMutation = useMutation({
    mutationFn: (args: { id: string; limite: number; categoria_id: string }) =>
      salvar({
        data: {
          id: args.id,
          limite: args.limite,
          categoria_id: args.categoria_id,
          mes,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      queryClient.invalidateQueries({ queryKey: ["previsoes"] });
    },
  });

  const [excluindo, setExcluindo] = useState<Orcamento | null>(null);
  const excluirMutation = useMutation({
    mutationFn: () => excluir({ data: { id: excluindo!.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      queryClient.invalidateQueries({ queryKey: ["previsoes"] });
      toast.success("Orçamento removido.");
      setExcluindo(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copiarMutation = useMutation({
    mutationFn: () => copiar({ data: { mes } }),
    onSuccess: (res) => {
      const nomeOrigem = formatarMes(res.origem).replace(/^./, (c) =>
        c.toUpperCase(),
      );
      const nomeDestino = formatarMes(mes).replace(/^./, (c) =>
        c.toUpperCase(),
      );
      if (res.semOrigem) {
        toast.info(`${nomeOrigem} não possui orçamentos para copiar.`);
        return;
      }
      if (res.copiados === 0) {
        toast.info(
          `Todas as categorias de ${nomeOrigem} já possuem orçamento em ${nomeDestino}.`,
        );
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
      queryClient.invalidateQueries({ queryKey: ["previsoes"] });
      toast.success(
        `Orçamentos de ${nomeOrigem} copiados para ${nomeDestino} com sucesso.`,
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orçamentos</h1>
        <p className="text-sm text-muted-foreground">
          Defina limites de gastos e acompanhe o progresso.
        </p>
      </div>

      <PeriodoSelector mes={mes} onChange={setMes} />

      {/* Resumo do mês */}
      {orcamentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Resumo de {formatarMes(mes).replace(/^./, (c) => c.toUpperCase())}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Total orçado
                </p>
                <p className="text-lg font-semibold text-warning">
                  {formatarMoeda(totais.orcado)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Total gasto
                </p>
                <p className="text-lg font-semibold text-nav-purple">
                  {formatarMoeda(totais.gasto)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Total comprometido
                </p>
                <p className="text-lg font-semibold text-nav-yellow">
                  {formatarMoeda(totais.comprometido)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Recorrentes pendentes
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {totais.utilizado > totais.orcado
                    ? "Total excedido"
                    : "Disponível"}
                </p>
                <p
                  className={`text-lg font-semibold ${
                    totais.utilizado > totais.orcado
                      ? "text-danger"
                      : "text-nav-cyan"
                  }`}
                >
                  {formatarMoeda(Math.abs(totais.orcado - totais.utilizado))}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Utilizado
                </p>
                <p
                  className={`text-lg font-semibold ${
                    {
                      success: "text-success",
                      warning: "text-warning",
                      alert: "text-danger",
                      danger: "text-danger",
                    }[totais.nivel]
                  }`}
                >
                  {totais.percentualReal.toFixed(0)}%
                </p>
              </div>
            </div>
            <Progress
              value={Math.min(100, totais.percentualReal)}
              className={`mt-4 h-2.5 ${
                {
                  success: "[&>div]:bg-success bg-success/15",
                  warning: "[&>div]:bg-warning bg-warning/15",
                  alert: "[&>div]:bg-danger bg-danger/15",
                  danger: "[&>div]:bg-danger bg-danger/15",
                }[totais.nivel]
              }`}
            />

            {situacao.nivel === "controle" && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success ring-1 ring-success/20">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Orçamentos sob controle.
              </div>
            )}

            {situacao.nivel === "proximo" && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm font-medium text-warning ring-1 ring-warning/20">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {situacao.proximos.length === 1
                  ? `1 orçamento está próximo do limite: ${situacao.proximos[0] ?? ""}.`
                  : `${situacao.proximos.length} orçamentos estão próximos do limite: ${situacao.proximos.join(", ")}.`}
              </div>
            )}

            {situacao.nivel === "atingido" && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger ring-1 ring-danger/20">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {situacao.atingidos.length === 1
                  ? `Limite atingido em ${situacao.atingidos[0] ?? ""}.`
                  : `Limite atingido em ${situacao.atingidos.length} orçamentos: ${situacao.atingidos.join(", ")}.`}
              </div>
            )}

            {situacao.nivel === "excedido" && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger/15 px-3 py-2 text-sm font-semibold text-danger ring-1 ring-danger/40">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {situacao.excedidos.length === 1
                    ? `1 orçamento excedido em ${formatarMoeda(situacao.totalExcedido)}: ${situacao.excedidos[0]?.nome ?? ""}.`
                    : `${situacao.excedidos.length} orçamentos excedidos em ${formatarMoeda(situacao.totalExcedido)}: ${situacao.excedidos.map((e) => e.nome).join(", ")}.`}
                  {situacao.proximos.length > 0 &&
                    (situacao.proximos.length === 1
                      ? ` 1 orçamento está próximo do limite: ${situacao.proximos[0] ?? ""}.`
                      : ` ${situacao.proximos.length} orçamentos estão próximos do limite: ${situacao.proximos.join(", ")}.`)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}


      {/* Novo orçamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" /> Novo orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs text-muted-foreground">Categoria</label>
              <Select value={novaCategoria} onValueChange={setNovaCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {despesaCategorias
                    .filter((c) => !orcamentosPorCategoria.has(c.id))
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40 space-y-1.5">
              <label className="text-xs text-muted-foreground">Limite (R$)</label>
              <Input
                inputMode="decimal"
                value={novoLimite}
                onChange={(e) => setNovoLimite(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <Button
              onClick={() => salvarMutation.mutate()}
              disabled={!novaCategoria || parseMoedaBR(novoLimite) <= 0}
            >
              Adicionar
            </Button>
          </div>
          {despesaCategorias.filter((c) => !orcamentosPorCategoria.has(c.id))
            .length === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Todas as categorias de despesa já possuem orçamento neste mês.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lista de orçamentos */}
      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : orcamentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum orçamento definido para{" "}
              {formatarMes(mes).replace(/^./, (c) => c.toUpperCase())}.
            </p>
            <Button
              className="mt-2 w-full max-w-xs gap-2"
              onClick={() => copiarMutation.mutate()}
              disabled={copiarMutation.isPending}
            >
              <Copy className="h-4 w-4" />
              {copiarMutation.isPending
                ? "Copiando..."
                : "Copiar orçamentos do mês anterior"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orcamentos.map((o) => {
            const cat = despesaCategorias.find((c) => c.id === o.categoria_id);
            const gasto = gastoPorCategoria.get(o.categoria_id) ?? 0;
            const comprometidoCat =
              comprometidoPorCategoria.get(o.categoria_id) ?? 0;
            const utilizado = gasto + comprometidoCat;
            const percentual =
              o.limite > 0 ? Math.min(100, (utilizado / o.limite) * 100) : 0;
            const percentualReal =
              o.limite > 0 ? (utilizado / o.limite) * 100 : 0;
            const estourou = utilizado > o.limite;
            const nivel =
              percentualReal >= 100
                ? "danger"
                : percentualReal >= 90
                  ? "alert"
                  : percentualReal >= 70
                    ? "warning"
                    : "success";
            const barra = {
              success: "[&>div]:bg-success bg-success/15",
              warning: "[&>div]:bg-warning bg-warning/15",
              alert: "[&>div]:bg-danger bg-danger/15",
              danger: "[&>div]:bg-danger bg-danger/15",
            }[nivel];
            const textoNivel = {
              success: "text-success",
              warning: "text-warning",
              alert: "text-danger",
              danger: "text-danger",
            }[nivel];
            const selo = {
              success: "bg-success/10 text-success ring-success/20",
              warning: "bg-warning/10 text-warning ring-warning/20",
              alert: "bg-danger/10 text-danger ring-danger/20",
              danger: "bg-danger/10 text-danger ring-danger/20",
            }[nivel];
            const rotulo = {
              success: "Dentro do orçamento",
              warning: "Atenção: orçamento próximo do limite",
              alert: "Alerta: orçamento quase esgotado",
              danger: "Orçamento excedido",
            }[nivel];
            const SeloIcon =
              nivel === "success" ? CheckCircle2 : AlertTriangle;
            const Icon = cat ? iconeCategoria(cat.icone) : Target;

            return (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-border/60"
                        style={{
                          backgroundColor: (cat?.cor ?? "#64748b") + "22",
                          color: cat?.cor ?? "#64748b",
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {cat?.nome ?? "Categoria"}
                        </p>
                        <span
                          className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${selo}`}
                        >
                          <SeloIcon className="h-3 w-3" />
                          {rotulo}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-28"
                        inputMode="decimal"
                        defaultValue={formatarMoeda(o.limite).replace(/\s/g, "")}
                        onBlur={(e) => {
                          const v = parseMoedaBR(e.target.value);
                          if (v !== o.limite && v >= 0) {
                            atualizarMutation.mutate({ id: o.id, limite: v, categoria_id: o.categoria_id });
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setExcluindo(o)}
                        aria-label="Excluir orçamento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Orçamento
                      </p>
                      <p className="text-sm font-semibold">
                        {formatarMoeda(o.limite)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Gasto no mês
                      </p>
                      <p className="text-sm font-semibold">
                        {formatarMoeda(gasto)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Comprometido
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          comprometidoCat > 0
                            ? "text-nav-yellow"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatarMoeda(comprometidoCat)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {estourou ? "Excedido" : "Disponível"}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          estourou ? "text-danger" : "text-success"
                        }`}
                      >
                        {formatarMoeda(Math.abs(o.limite - utilizado))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Utilizado
                      </p>
                      <p className={`text-sm font-semibold ${textoNivel}`}>
                        {percentualReal.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Progress value={percentual} className={`h-2.5 ${barra}`} />
                  </div>

                  {nivel === "warning" && !estourou && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm font-medium text-warning ring-1 ring-warning/20">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Atenção: orçamento próximo do limite (
                      {percentualReal.toFixed(0)}% utilizado).
                    </div>
                  )}

                  {nivel === "alert" && !estourou && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger ring-1 ring-danger/20">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Alerta: orçamento quase esgotado (
                      {percentualReal.toFixed(0)}% utilizado).
                    </div>
                  )}

                  {estourou && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger/15 px-3 py-2 text-sm font-semibold text-danger ring-1 ring-danger/40">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Orçamento excedido em{" "}
                      {formatarMoeda(utilizado - o.limite)}.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Categorias de despesa sem orçamento definido */}
      {semOrcamento.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" /> Sem orçamento definido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {semOrcamento.map((c) => {
              const Icon = iconeCategoria(c.icone);
              const gasto = gastoPorCategoria.get(c.id) ?? 0;
              const comprometidoCat = comprometidoPorCategoria.get(c.id) ?? 0;
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: c.cor + "22",
                        color: c.cor,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatarMoeda(gasto)} gastos neste mês
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNovaCategoria(c.id)}
                  >
                    Definir limite
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}


      <AlertDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O orçamento será removido deste mês.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => excluirMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
