import { useEffect, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Tags } from "lucide-react";
import { criarCategoria, atualizarCategoria } from "@/lib/categorias.functions";
import { type Categoria, type TipoTransacao } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CORES = [
  "#16a34a",
  "#22c55e",
  "#10b981",
  "#84cc16",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
  "#64748b",
];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categoria?: Categoria | null;
};

export function CategoriaDialog({ open, onOpenChange, categoria }: Props) {
  const queryClient = useQueryClient();
  const criar = useServerFn(criarCategoria);
  const atualizar = useServerFn(atualizarCategoria);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>("despesa");
  const [cor, setCor] = useState(CORES[4]);
  const [icone, setIcone] = useState("wallet");

  useEffect(() => {
    if (open) {
      setNome(categoria?.nome ?? "");
      setTipo(categoria?.tipo ?? "despesa");
      setCor(categoria?.cor ?? CORES[4]);
      setIcone(categoria?.icone ?? "wallet");
    }
  }, [open, categoria]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { nome: nome.trim(), tipo, cor, icone };
      if (categoria) return atualizar({ data: { ...payload, id: categoria.id } });
      return criar({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast.success(categoria ? "Categoria atualizada!" : "Categoria criada!");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    mutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Tags className="h-4 w-4" />
            </span>
            {categoria ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>Organize suas transações.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Mercado"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={tipo}
              onValueChange={(v) => setTipo(v as TipoTransacao)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    cor === c
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icone">Ícone</Label>
            <Input
              id="icone"
              value={icone}
              onChange={(e) => setIcone(e.target.value)}
              placeholder="wallet"
            />
            <p className="text-xs text-muted-foreground">
              Nome de ícone do pacote Lucide (ex: wallet, utensils, car).
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {categoria ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
