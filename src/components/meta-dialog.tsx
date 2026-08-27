import { useEffect, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Target } from "lucide-react";
import { salvarMeta } from "@/lib/metas.functions";
import { type Meta } from "@/lib/schemas";
import { paraFloat } from "@/lib/format";
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

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta?: Meta | null;
};

export function MetaDialog({ open, onOpenChange, meta }: Props) {
  const queryClient = useQueryClient();
  const salvar = useServerFn(salvarMeta);

  const [nome, setNome] = useState("");
  const [valorAlvo, setValorAlvo] = useState("");
  const [valorAcumulado, setValorAcumulado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [prazo, setPrazo] = useState("");

  useEffect(() => {
    if (open) {
      setNome(meta?.nome ?? "");
      setValorAlvo(meta ? String(meta.valor_alvo).replace(".", ",") : "");
      setValorAcumulado(
        meta ? String(meta.valor_acumulado).replace(".", ",") : "",
      );
      setDataInicio(meta?.data_inicio ?? "");
      setPrazo(meta?.prazo ?? "");
    }
  }, [open, meta]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        nome: nome.trim(),
        valor_alvo: paraFloat(valorAlvo),
        valor_acumulado: valorAcumulado ? paraFloat(valorAcumulado) : 0,
        data_inicio: dataInicio ? dataInicio : null,
        prazo: prazo ? prazo : null,
        ...(meta ? { id: meta.id } : {}),
      };
      return salvar({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      toast.success(meta ? "Meta atualizada!" : "Meta criada!");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || paraFloat(valorAlvo) <= 0) {
      toast.error("Informe o nome e um valor-alvo válido.");
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
              <Target className="h-4 w-4" />
            </span>
            {meta ? "Editar meta" : "Nova meta"}
          </DialogTitle>
          <DialogDescription>
            Defina um objetivo e acompanhe o progresso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome-meta">Nome da meta</Label>
            <Input
              id="nome-meta"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Notebook, Viagem, Reserva..."
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="valor-alvo">Valor-alvo (R$)</Label>
              <Input
                id="valor-alvo"
                inputMode="decimal"
                value={valorAlvo}
                onChange={(e) => setValorAlvo(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor-acumulado">Já guardado (R$)</Label>
              <Input
                id="valor-acumulado"
                inputMode="decimal"
                value={valorAcumulado}
                onChange={(e) => setValorAcumulado(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prazo">Prazo (opcional)</Label>
            <Input
              id="prazo"
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
            />
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
              {meta ? "Salvar" : "Criar meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
