import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Wallet, Filter } from "lucide-react";
import { categoriasQuery, transacoesQuery } from "@/lib/queries";
import { excluirTransacao } from "@/lib/transacoes.functions";
import { type Categoria, type Transacao, type TipoTransacao } from "@/lib/schemas";
import { formatarMoeda, formatarData, mesAtual, mesesAnteriores, formatarMes } from "@/lib/format";
import { iconeCategoria } from "@/lib/icones";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { TransacaoDialog } from "@/components/transacao-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/transacoes")({
  head: () => ({
    meta: [
      { title: "Transações · Finanças Pessoal" },
      {
        name: "description",
        content: "Lista e filtre todas as suas receitas e despesas.",
      },
    ],
  }),
  component: TransacoesPage,
});

type FiltroTipo = "todas" | TipoTransacao;

function TransacoesPage() {
  const [mes, setMes] = useState(mesAtual());
  const [tipo, setTipo] = useState<FiltroTipo>("todas");
  const [categoriaId, setCategoriaId] = useState<string>("todas");
  const [busca, setBusca] = useState("");

  const { data: categorias } = useSuspenseQuery(categoriasQuery);
  const filtros = {
    mes,
    ...(tipo !== "todas" ? { tipo } : {}),
    ...(categoriaId !== "todas" ? { categoria_id: categoriaId } : {}),
  };
  const { data: transacoes, isPending } = useSuspenseQuery(
    transacoesQuery(filtros),
  );

  const queryClient = useQueryClient();
  const excluir = useServerFn(excluirTransacao);

  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [editando, setEditando] = useState<Transacao | null>(null);
  const [excluindo, setExcluindo] = useState<Transacao | null>(null);

  const mapaCategorias = useMemo(() => {
    const m = new Map<string, Categoria>();
    for (const c of categorias) m.set(c.id, c);
    return m;
  }, [categorias]);

  const filtradas = useMemo(() => {
    const b = busca.trim().toLowerCase();
    if (!b) return transacoes;
    return transacoes.filter((t) => t.descricao.toLowerCase().includes(b));
  }, [transacoes, busca]);

  const totalReceitas = filtradas
    .filter((t) => t.tipo === "receita")
    .reduce((s, t) => s + t.valor, 0);
  const totalDespesas = filtradas
    .filter((t) => t.tipo === "despesa")
    .reduce((s, t) => s + t.valor, 0);

  const meses = useMemo(() => mesesAnteriores(12), []);

  const excluirMutation = useMutation({
    mutationFn: () => excluir({ data: { id: excluindo!.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
      queryClient.invalidateQueries({ queryKey: ["serie-mensal"] });
      queryClient.invalidateQueries({ queryKey: ["evolucao-saldo"] });
      toast.success("Transação excluída.");
      setExcluindo(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
          <p className="text-sm text-muted-foreground">
            {filtradas.length}{" "}
            {filtradas.length === 1 ? "registro" : "registros"}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditando(null);
            setDialogoAberto(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova transação
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" /> Filtros
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Mês</label>
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses
                    .slice()
                    .reverse()
                    .map((m) => (
                      <SelectItem key={m} value={m}>
                        {formatarMes(m).replace(/^./, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Tipo</label>
              <Tabs
                value={tipo}
                onValueChange={(v) => setTipo(v as FiltroTipo)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                  <TabsTrigger value="despesa">Despesas</TabsTrigger>
                  <TabsTrigger value="receita">Receitas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Categoria</label>
              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Buscar</label>
              <Input
                placeholder="Descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totais */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Receitas</p>
            <p className="text-xl font-bold text-success">
              {formatarMoeda(totalReceitas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Despesas</p>
            <p className="text-xl font-bold text-danger">
              {formatarMoeda(totalDespesas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className="text-xl font-bold">{formatarMoeda(totalReceitas - totalDespesas)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhuma transação encontrada com os filtros atuais.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {filtradas.map((t) => {
                const cat = t.categoria_id
                  ? mapaCategorias.get(t.categoria_id)
                  : null;
                const Icon = cat ? iconeCategoria(cat.icone) : Wallet;
                return (
                  <li
                    key={t.id}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:px-6"
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ring-1 ring-border/60"
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
                      className={`flex-shrink-0 text-sm font-semibold ${
                        t.tipo === "receita"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {t.tipo === "receita" ? "+" : "−"}
                      {formatarMoeda(t.valor)}
                    </span>
                    <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditando(t);
                          setDialogoAberto(true);
                        }}
                        aria-label="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setExcluindo(t)}
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <TransacaoDialog
        open={dialogoAberto}
        onOpenChange={setDialogoAberto}
        categorias={categorias}
        transacao={editando}
      />

      <AlertDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              “{excluindo?.descricao}” será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => excluirMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
