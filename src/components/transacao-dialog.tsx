import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeftRight, Repeat } from "lucide-react";
import { criarTransacao, atualizarTransacao } from "@/lib/transacoes.functions";
import { criarRecorrencia, atualizarOcorrencia } from "@/lib/recorrencias.functions";
import {
  type Categoria,
  type Transacao,
  type TipoTransacao,
  type FrequenciaRecorrencia,
  type EscopoRecorrencia,
  type StatusPagamento,
} from "@/lib/schemas";
import { parseMoedaBR, formatarMoeda } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function TransacaoDialog({ open, onOpenChange, categorias, transacao }: Props) {
  const queryClient = useQueryClient();
  const criar = useServerFn(criarTransacao);
  const atualizar = useServerFn(atualizarTransacao);
  const criarRec = useServerFn(criarRecorrencia);
  const atualizarOcor = useServerFn(atualizarOcorrencia);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>("despesa");
  const [categoriaId, setCategoriaId] = useState<string>("nenhuma");
  const [data, setData] = useState(hoje());
  const [statusPagamento, setStatusPagamento] = useState<StatusPagamento | "">("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");

  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState<FrequenciaRecorrencia>("mensal");
  const [dataInicio, setDataInicio] = useState(hoje());
  const [dataFim, setDataFim] = useState("");
  const [escopoAberto, setEscopoAberto] = useState(false);

  const ehOcorrencia = !!transacao?.recorrencia_id;

  useEffect(() => {
    if (!open) return;
    const status = transacao ? (transacao.status_pagamento ?? "pago") : "";
    setDescricao(transacao?.descricao ?? "");
    setValor(transacao ? formatarMoeda(transacao.valor).replace(/\s/g, "") : "");
    setTipo(transacao?.tipo ?? "despesa");
    setCategoriaId(transacao?.categoria_id ?? "nenhuma");
    setData(transacao?.data ?? hoje());
    setStatusPagamento(status);
    setDataVencimento(transacao?.data_vencimento ?? "");
    setDataPagamento(transacao?.data_pagamento ?? (status === "pago" ? transacao?.data ?? hoje() : ""));
    setRecorrente(false);
    setFrequencia("mensal");
    setDataInicio(transacao?.data ?? hoje());
    setDataFim("");
    setEscopoAberto(false);
  }, [open, transacao]);

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  function invalidarTudo() {
    for (const chave of [
      "transacoes",
      "resumo",
      "serie-mensal",
      "evolucao-saldo",
      "orcamentos",
      "previsoes",
      "recorrencias",
      "contas-a-pagar",
    ]) queryClient.invalidateQueries({ queryKey: [chave] });
  }

  const mutation = useMutation({
    mutationFn: async (escopo?: EscopoRecorrencia) => {
      const status =
        tipo === "despesa" ? ((statusPagamento || "pago") as StatusPagamento) : "pago";
      const pagamento = status === "pago" ? dataPagamento || data : null;
      const payload = {
        descricao: descricao.trim(),
        valor: parseMoedaBR(valor),
        tipo,
        categoria_id: categoriaId === "nenhuma" ? null : categoriaId,
        data,
        status_pagamento: status,
        data_vencimento: tipo === "despesa" ? dataVencimento || null : null,
        data_pagamento: tipo === "despesa" ? pagamento : null,
      };

      if (transacao && ehOcorrencia) {
        return atualizarOcor({
          data: {
            id: transacao.id,
            descricao: payload.descricao,
            valor: payload.valor,
            categoria_id: payload.categoria_id,
            data: payload.data,
            status_pagamento: payload.status_pagamento,
            data_vencimento: payload.data_vencimento,
            data_pagamento: payload.data_pagamento,
            escopo: escopo ?? "apenas_esta",
          },
        });
      }
      if (transacao) return atualizar({ data: { ...payload, id: transacao.id } });
      if (tipo === "despesa" && recorrente) {
        return criarRec({
          data: {
            descricao: payload.descricao,
            valor: payload.valor,
            categoria_id: payload.categoria_id,
            frequencia,
            data_inicio: dataInicio,
            data_fim: dataFim || null,
            status_pagamento: payload.status_pagamento,
            data_vencimento: payload.data_vencimento,
          },
        });
      }
      return criar({ data: payload });
    },
    onSuccess: () => {
      invalidarTudo();
      toast.success(
        transacao
          ? "Transação atualizada!"
          : recorrente && tipo === "despesa"
            ? "Despesa recorrente criada!"
            : "Transação adicionada!",
      );
      setEscopoAberto(false);
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function valido(): boolean {
    if (!descricao.trim() || parseMoedaBR(valor) <= 0) {
      toast.error("Preencha a descrição e um valor válido.");
      return false;
    }
    if (tipo === "despesa" && !statusPagamento) {
      toast.error("Selecione o status do pagamento (Pago ou Pendente).");
      return false;
    }
    if (tipo === "despesa" && dataVencimento && dataVencimento < data) {
      toast.error("A data de vencimento não pode ser anterior à data da despesa.");
      return false;
    }
    if (!transacao && tipo === "despesa" && recorrente) {
      if (!dataInicio) {
        toast.error("Informe a data de início da recorrência.");
        return false;
      }
      if (dataFim && dataFim < dataInicio) {
        toast.error("A data de término deve ser posterior ao início.");
        return false;
      }
    }
    return true;
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!valido()) return;
    if (ehOcorrencia) {
      setEscopoAberto(true);
      return;
    }
    mutation.mutate(undefined);
  }

  return (
    <>
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
              {ehOcorrencia ? "Esta transação faz parte de uma despesa recorrente." : "Registre uma receita ou despesa."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={enviar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Mercado, Salário..." autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input id="valor" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => {
                const novoTipo = v as TipoTransacao;
                setTipo(novoTipo);
                setCategoriaId("nenhuma");
                if (novoTipo !== "despesa") setRecorrente(false);
              }} disabled={ehOcorrencia}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Sem categoria</SelectItem>
                  {categoriasFiltradas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {tipo === "despesa" && (
              <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-3">
                <div className="space-y-2">
                  <Label>Status do pagamento</Label>
                  <Select value={statusPagamento || undefined} onValueChange={(v) => {
                    const novoStatus = v as StatusPagamento;
                    setStatusPagamento(novoStatus);
                    if (novoStatus === "pendente") setDataPagamento("");
                    else if (!dataPagamento) setDataPagamento(data);
                  }}>
                    <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="data-vencimento">Vencimento</Label>
                    <Input id="data-vencimento" type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} />
                  </div>
                  {statusPagamento === "pago" && (
                    <div className="space-y-2">
                      <Label htmlFor="data-pagamento">Data de pagamento</Label>
                      <Input id="data-pagamento" type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {!transacao && tipo === "despesa" && (
              <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="recorrente" className="flex items-center gap-2 text-sm font-medium">
                    <Repeat className="h-4 w-4 text-muted-foreground" /> Despesa recorrente
                  </Label>
                  <Switch id="recorrente" checked={recorrente} onCheckedChange={setRecorrente} />
                </div>
                {recorrente && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Frequência</Label>
                      <Select value={frequencia} onValueChange={(v) => setFrequencia(v as FrequenciaRecorrencia)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="mensal">Mensal</SelectItem><SelectItem value="anual">Anual</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2"><Label htmlFor="data-inicio">Início</Label><Input id="data-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
                      <div className="space-y-2"><Label htmlFor="data-fim">Término (opcional)</Label><Input id="data-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></div>
                    </div>
                    <p className="text-xs text-muted-foreground">Sem término, as ocorrências são geradas até 12 meses à frente e continuam avançando automaticamente.</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={mutation.isPending}>{transacao ? "Salvar" : "Adicionar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={escopoAberto} onOpenChange={setEscopoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aplicar alteração em quais meses?</AlertDialogTitle>
            <AlertDialogDescription>“{descricao}” é uma despesa recorrente. Escolha se a mudança vale apenas para esta ocorrência ou também para as próximas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate("apenas_esta")}>Somente esta</Button>
            <AlertDialogAction disabled={mutation.isPending} onClick={(e) => { e.preventDefault(); mutation.mutate("esta_e_proximas"); }}>Esta e as próximas</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function hoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
