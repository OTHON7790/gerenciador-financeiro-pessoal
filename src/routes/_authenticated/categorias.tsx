import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { categoriasQuery } from "@/lib/queries";
import { excluirCategoria } from "@/lib/categorias.functions";
import { type Categoria, type TipoTransacao } from "@/lib/schemas";
import { formatarMoeda } from "@/lib/format";
import { iconeCategoria } from "@/lib/icones";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { CategoriaDialog } from "@/components/categoria-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias · Finanças Pessoal" },
      {
        name: "description",
        content: "Crie e organize suas categorias de receitas e despesas.",
      },
    ],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const { data: categorias, isPending } = useSuspenseQuery(categoriasQuery);
  const queryClient = useQueryClient();
  const excluir = useServerFn(excluirCategoria);

  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [excluindo, setExcluindo] = useState<Categoria | null>(null);

  const receitas = categorias.filter((c) => c.tipo === "receita");
  const despesas = categorias.filter((c) => c.tipo === "despesa");

  const excluirMutation = useMutation({
    mutationFn: () => excluir({ data: { id: excluindo!.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      toast.success("Categoria excluída.");
      setExcluindo(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function abrirNovo() {
    setEditando(null);
    setDialogoAberto(true);
  }
  function abrirEditar(cat: Categoria) {
    setEditando(cat);
    setDialogoAberto(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Organize receitas e despesas por categoria.
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <GrupoCategorias
            titulo="Receitas"
            tipo="receita"
            categorias={receitas}
            onEditar={abrirEditar}
            onExcluir={setExcluindo}
          />
          <GrupoCategorias
            titulo="Despesas"
            tipo="despesa"
            categorias={despesas}
            onEditar={abrirEditar}
            onExcluir={setExcluindo}
          />
        </div>
      )}

      <CategoriaDialog
        open={dialogoAberto}
        onOpenChange={setDialogoAberto}
        categoria={editando}
      />

      <AlertDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              {excluindo?.nome} será removida. As transações vinculadas ficarão
              sem categoria.
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

function GrupoCategorias({
  titulo,
  tipo,
  categorias,
  onEditar,
  onExcluir,
}: {
  titulo: string;
  tipo: TipoTransacao;
  categorias: Categoria[];
  onEditar: (c: Categoria) => void;
  onExcluir: (c: Categoria) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>{titulo}</span>
          <Badge variant={tipo === "receita" ? "default" : "secondary"}>
            {categorias.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {categorias.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma categoria de {titulo.toLowerCase()} ainda.
          </p>
        ) : (
          categorias.map((c) => {
            const Icon = iconeCategoria(c.icone);
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: c.cor + "22", color: c.cor }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium">{c.nome}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEditar(c)}
                    aria-label="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onExcluir(c)}
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
