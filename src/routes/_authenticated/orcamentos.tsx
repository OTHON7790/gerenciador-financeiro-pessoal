import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Target, Plus, Trash2 } from "lucide-react";
import { categoriasQuery, orcamentosQuery, resumoMesQuery } from "@/lib/queries";
import { salvarOrcamento, excluirOrcamento } from "@/lib/orcamentos.functions";
import { type Categoria, type Orcamento } from "@/lib/schemas";
import { formatarMoeda, formatarMes, mesAtual, mesesAnteriores } from "@/lib/format";
import { paraFloat } from "@/lib/format";
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
  const [mes, setMes] = useState(mesAtual());
  const meses = useMemo(() => mesesAnteriores(6).slice().reverse(), []);

  const { data: categorias } = useSuspenseQuery(categoriasQuery);
  const { data: orcamentos, isPending } = useSuspenseQuery(orcamentosQuery(mes));
  const { data: resumo } = useSuspenseQuery(resumoMesQuery(mes));

  const queryClient = useQueryClient();
  const salvar = useServerFn(salvarOrcamento);
  const excluir = useServerFn(excluirOrcamento);

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

  const despesaCategorias = categorias.filter((c) => c.tipo === "despesa");

  // formulário de novo orçamento
  const [novaCategoria, setNovaCategoria] = useState<string>("");
  const [novoLimite, setNovoLimite] = useState("");

  const salvarMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        categoria_id: novaCategoria,
        mes,
        limite: paraFloat(novoLimite),
      };
      return salvar({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento definido!");
      setNovaCategoria("");
      setNovoLimite("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizarMutation = useMutation({
    mutationFn: (args: { id: string; limite: number }) =>
      salvar({ data: { id: args.id, limite: args.limite, categoria_id: "", mes } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
    },
  });

  const [excluindo, setExcluindo] = useState<Orcamento | null>(null);
  const excluirMutation = useMutation({
    mutationFn: () => excluir({ data: { id: excluindo!.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento removido.");
      setExcluindo(null);
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

      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Mês:</label>
        <Select value={mes} onValueChange={setMes}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {meses.map((m) => (
              <SelectItem key={m} value={m}>
                {formatarMes(m).replace(/^./, (c) => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
              disabled={!novaCategoria || paraFloat(novoLimite) <= 0}
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
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orcamentos.map((o) => {
            const cat = despesaCategorias.find((c) => c.id === o.categoria_id);
            const gasto = gastoPorCategoria.get(o.categoria_id) ?? 0;
            const percentual =
              o.limite > 0 ? Math.min(100, (gasto / o.limite) * 100) : 0;
            const estourou = gasto > o.limite;
            const Icon = cat ? iconeCategoria(cat.icone) : Target;

            return (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
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
                        <p className="text-xs text-muted-foreground">
                          {formatarMoeda(gasto)} de {formatarMoeda(o.limite)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-28"
                        inputMode="decimal"
                        defaultValue={formatarMoeda(o.limite).replace(/\s/g, "")}
                        onBlur={(e) => {
                          const v = paraFloat(e.target.value);
                          if (v !== o.limite && v >= 0) {
                            atualizarMutation.mutate({ id: o.id, limite: v });
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
                  <div className="mt-3">
                    <Progress
                      value={percentual}
                      className={`h-2 ${estourou ? "[&>div]:bg-red-500" : ""}`}
                    />
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {percentual.toFixed(0)}% usado
                      </span>
                      <span
                        className={
                          estourou
                            ? "font-medium text-danger"
                            : "text-muted-foreground"
                        }
                      >
                        {estourou
                          ? `Estourou ${formatarMoeda(gasto - o.limite)}`
                          : `Resta ${formatarMoeda(o.limite - gasto)}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
