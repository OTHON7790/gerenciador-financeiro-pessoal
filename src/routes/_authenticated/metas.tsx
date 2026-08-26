import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Target, Plus, Trash2, Pencil, CheckCircle2 } from "lucide-react";
import { metasQuery } from "@/lib/queries";
import { adicionarValorMeta, excluirMeta } from "@/lib/metas.functions";
import { progressoMeta, type Meta } from "@/lib/schemas";
import { formatarMoeda, formatarData, paraFloat } from "@/lib/format";
import { MetaDialog } from "@/components/meta-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas · Finanças Pessoal" },
      {
        name: "description",
        content:
          "Crie metas financeiras, guarde valores e acompanhe o progresso rumo aos seus objetivos.",
      },
      { property: "og:title", content: "Metas · Finanças Pessoal" },
      {
        property: "og:description",
        content:
          "Crie metas financeiras, guarde valores e acompanhe o progresso rumo aos seus objetivos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MetasPage,
});

function MetasPage() {
  const { data: metas } = useSuspenseQuery(metasQuery);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [metaEditando, setMetaEditando] = useState<Meta | null>(null);
  const [metaExcluindo, setMetaExcluindo] = useState<Meta | null>(null);

  const queryClient = useQueryClient();
  const excluir = useServerFn(excluirMeta);

  const exclusao = useMutation({
    mutationFn: (id: string) => excluir({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      toast.success("Meta excluída.");
      setMetaExcluindo(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const concluidas = metas.filter(
    (m) => progressoMeta(m).status === "concluida",
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Metas
          </h1>
          <p className="text-sm text-muted-foreground">
            {metas.length === 0
              ? "Defina objetivos e acompanhe seu progresso."
              : `${metas.length} meta(s) · ${concluidas} concluída(s)`}
          </p>
        </div>
        <Button
          onClick={() => {
            setMetaEditando(null);
            setDialogAberto(true);
          }}
        >
          <Plus /> Nova meta
        </Button>
      </div>

      {metas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Target className="h-7 w-7" />
            </div>
            <p className="font-medium text-foreground">
              Nenhuma meta cadastrada
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Crie sua primeira meta — um notebook, uma viagem ou a reserva de
              emergência — e acompanhe quanto falta para alcançá-la.
            </p>
            <Button
              className="mt-2"
              onClick={() => {
                setMetaEditando(null);
                setDialogAberto(true);
              }}
            >
              <Plus /> Criar meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {metas.map((meta) => (
            <CardMeta
              key={meta.id}
              meta={meta}
              onEditar={() => {
                setMetaEditando(meta);
                setDialogAberto(true);
              }}
              onExcluir={() => setMetaExcluindo(meta)}
            />
          ))}
        </div>
      )}

      <MetaDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        meta={metaEditando}
      />

      <AlertDialog
        open={metaExcluindo !== null}
        onOpenChange={(v) => !v && setMetaExcluindo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
            <AlertDialogDescription>
              A meta &quot;{metaExcluindo?.nome}&quot; e todo o progresso
              registrado serão removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => metaExcluindo && exclusao.mutate(metaExcluindo.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CardMeta({
  meta,
  onEditar,
  onExcluir,
}: {
  meta: Meta;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const { percentual, restante, status, rotulo } = progressoMeta(meta);
  const [valor, setValor] = useState("");

  const queryClient = useQueryClient();
  const adicionar = useServerFn(adicionarValorMeta);

  const aporte = useMutation({
    mutationFn: () => adicionar({ data: { id: meta.id, valor: paraFloat(valor) } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      toast.success("Valor adicionado à meta!");
      setValor("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cores = {
    concluida: {
      barra: "[&>div]:bg-success bg-success/15",
      texto: "text-success",
      selo: "bg-success/10 text-success",
    },
    atrasada: {
      barra: "[&>div]:bg-danger bg-danger/15",
      texto: "text-danger",
      selo: "bg-danger/10 text-danger",
    },
    andamento: {
      barra:
        percentual >= 70
          ? "[&>div]:bg-warning bg-warning/15"
          : "[&>div]:bg-primary bg-primary/15",
      texto: percentual >= 70 ? "text-warning" : "text-primary",
      selo:
        percentual >= 70
          ? "bg-warning/10 text-warning"
          : "bg-primary/10 text-primary",
    },
  }[status];

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              {status === "concluida" ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Target className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{meta.nome}</p>
              <p className="text-xs text-muted-foreground">
                {meta.prazo
                  ? `Prazo: ${formatarData(meta.prazo)}`
                  : "Sem prazo definido"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditar}
              aria-label="Editar meta"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onExcluir}
              aria-label="Excluir meta"
              className="text-muted-foreground hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              {formatarMoeda(meta.valor_acumulado)}
              <span className="text-muted-foreground">
                {" "}
                de {formatarMoeda(meta.valor_alvo)}
              </span>
            </span>
            <span className={`font-semibold ${cores.texto}`}>
              {percentual.toFixed(0)}%
            </span>
          </div>
          <Progress
            value={Math.min(percentual, 100)}
            className={`h-2.5 ${cores.barra}`}
          />
          <div className="flex items-center justify-between text-xs">
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${cores.selo}`}
            >
              {rotulo}
            </span>
            <span className="text-muted-foreground">
              {restante > 0
                ? `Faltam ${formatarMoeda(restante)}`
                : "Objetivo alcançado"}
            </span>
          </div>
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (paraFloat(valor) <= 0) {
              toast.error("Informe um valor válido.");
              return;
            }
            aporte.mutate();
          }}
        >
          <Input
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Adicionar valor (R$)"
            aria-label={`Adicionar valor à meta ${meta.nome}`}
          />
          <Button type="submit" variant="outline" disabled={aporte.isPending}>
            <Plus /> Guardar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
