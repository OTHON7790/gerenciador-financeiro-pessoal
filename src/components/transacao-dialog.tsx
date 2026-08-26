import { useEffect, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeftRight } from "lucide-react";
import { criarTransacao, atualizarTransacao } from "@/lib/transacoes.functions";
import { type Categoria, type Transacao, type TipoTransacao } from "@/lib/schemas";
import { paraFloat, formatarMoeda } from "@/lib/format";
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

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categorias: Categoria[];
  transacao?: Transacao | null;
};

export function TransacaoDialog({
  open,
  onOpenChange,
  categorias,
  transacao,
}: Props) {
  const queryClient = useQueryClient();
  const criar = useServerFn(criarTransacao);
  const atualizar = useServerFn(atualizarTransacao);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>("despesa");
  const [categoriaId, setCategoriaId] = useState<string>("nenhuma");
  const [data, setData] = useState(hoje());

  useEffect(() => {
    if (open) {
      setDescricao(transacao?.descricao ?? "");
      setValor(transacao ? formatarMoeda(transacao.valor).replace(/\s/g, "") : "");
      setTipo(transacao?.tipo ?? "despesa");
      setCategoriaId(transacao?.categoria_id ?? "nenhuma");
      setData(transacao?.data ?? hoje());
    }
  }, [open, transacao]);

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        descricao: descricao.trim(),
        valor: paraFloat(valor),
        tipo,
        categoria_id: categoriaId === "nenhuma" ? null : categoriaId,
        data,
      };
      if (transacao) {
        return atualizar({ data: { ...payload, id: transacao.id } });
      }
      return criar({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
      queryClient.invalidateQueries({ queryKey: ["serie-mensal"] });
      queryClient.invalidateQueries({ queryKey: ["evolucao-saldo"] });
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success(transacao ? "Transação atualizada!" : "Transação adicionada!");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!descricao.trim() || paraFloat(valor) <= 0) {
      toast.error("Preencha a descrição e um valor válido.");
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
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            {transacao ? "Editar transação" : "Nova transação"}
          </DialogTitle>
          <DialogDescription>
            Registre uma receita ou despesa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Mercado, Salário..."
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={tipo}
              onValueChange={(v) => {
                setTipo(v as TipoTransacao);
                setCategoriaId("nenhuma");
              }}
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
            <Label>Categoria</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Sem categoria</SelectItem>
                {categoriasFiltradas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {transacao ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function hoje(): string {
  const d = new Date();
  const a = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${a}-${m}-${dia}`;
}
