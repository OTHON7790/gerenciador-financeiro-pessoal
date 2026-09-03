import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Wallet, Filter, Repeat, Check } from "lucide-react";
import { categoriasQuery, transacoesQuery } from "@/lib/queries";
import { excluirTransacao, marcarTransacaoComoPaga } from "@/lib/transacoes.functions";
import { excluirOcorrencia } from "@/lib/recorrencias.functions";
import { statusTransacao, type Categoria, type Transacao, type TipoTransacao, type StatusExibido } from "@/lib/schemas";
import { formatarMoeda, formatarData, mesAtual } from "@/lib/format";
import { PeriodoSelector, mesInicialValido } from "@/components/periodo-selector";
import { iconeCategoria } from "@/lib/icones";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TransacaoDialog } from "@/components/transacao-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/transacoes")({
  head: () => ({
    meta: [
      { title: "Transações · Finanças Pessoal" },
      { name: "description", content: "Lista e filtre todas as suas receitas e despesas." },
    ],
  }),
  component: TransacoesPage,
});

type FiltroTipo = "todas" | TipoTransacao;
type FiltroStatus = "todos" | StatusExibido;
type Ordenacao = "recentes" | "antigas" | "az" | "za" | "maior" | "menor";

const ORDENACOES: { valor: Ordenacao; rotulo: string }[] = [
  { valor: "recentes", rotulo: "Mais recentes" },
  { valor: "antigas", rotulo: "Mais antigas" },
  { valor: "az", rotulo: "A–Z" },
  { valor: "za", rotulo: "Z–A" },
  { valor: "maior", rotulo: "Maior valor" },
  { valor: "menor", rotulo: "Menor valor" },
];

function TransacoesPage() {
  const [mes, setMes] = useState(() => mesInicialValido(mesAtual()));
  const [tipo, setTipo] = useState<FiltroTipo>("todas");
  const [status, setStatus] = useState<FiltroStatus>("todos");
  const [categoriaId, setCategoriaId] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("recentes");
  const { data: categorias } = useSuspenseQuery(categoriasQuery);
  const filtros = {
    mes,
    ...(tipo !== "todas" ? { tipo } : {}),
    ...(status !== "todos" ? { status } : {}),
    ...(categoriaId !== "todas" ? { categoria_id: categoriaId } : {}),
  };
  const { data: transacoes, isPending } = useSuspenseQuery(transacoesQuery(filtros));
  const queryClient = useQueryClient();
  const excluir = useServerFn(excluirTransacao);
  const excluirOcor = useServerFn(excluirOcorrencia);
  const marcarPago = useServerFn(marcarTransacaoComoPaga);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [editando, setEditando] = useState<Transacao | null>(null);
  const [excluindo, setExcluindo] = useState<Transacao | null>(null);

  const mapaCategorias = useMemo(() => new Map(categorias.map((c) => [c.id, c] as [string, Categoria])), [categorias]);
  const filtradas = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return b ? transacoes.filter((t) => t.descricao.toLowerCase().includes(b)) : transacoes;
  }, [transacoes, busca]);
  const totalReceitas = filtradas.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
  const totalDespesas = filtradas.filter((t) => t.tipo === "despesa" && statusTransacao(t) === "pago").reduce((s, t) => s + t.valor, 0);
  const totalPendentes = filtradas.filter((t) => t.tipo === "despesa" && statusTransacao(t) === "pendente").reduce((s, t) => s + t.valor, 0);

  function invalidarTudo() {
    for (const chave of ["transacoes", "resumo", "serie-mensal", "evolucao-saldo", "orcamentos", "previsoes", "recorrencias", "contas-a-pagar"]) {
      queryClient.invalidateQueries({ queryKey: [chave] });
    }
  }

  const pagarMutation = useMutation({
    mutationFn: (id: string) => marcarPago({ data: { id } }),
    onSuccess: () => { invalidarTudo(); toast.success("Despesa marcada como paga."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluirMutation = useMutation({
    mutationFn: (escopo?: "apenas_esta" | "esta_e_proximas") => {
      const alvo = excluindo;
      if (!alvo) throw new Error("Transação não encontrada.");
      return alvo.recorrencia_id
        ? excluirOcor({ data: { id: alvo.id, escopo: escopo ?? "apenas_esta" } })
        : excluir({ data: { id: alvo.id } });
    },
    onSuccess: () => { invalidarTudo(); toast.success("Transação excluída."); setExcluindo(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold tracking-tight">Transações</h1><p className="text-sm text-muted-foreground">{filtradas.length} {filtradas.length === 1 ? "registro" : "registros"}</p></div>
        <Button onClick={() => { setEditando(null); setDialogoAberto(true); }}><Plus className="mr-2 h-4 w-4" />Nova transação</Button>
      </div>

      <Card><CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Filter className="h-4 w-4" /> Filtros</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5 sm:col-span-2"><label className="text-xs text-muted-foreground">Período</label><PeriodoSelector mes={mes} onChange={setMes} /></div>
          <div className="space-y-1.5"><label className="text-xs text-muted-foreground">Tipo</label><Tabs value={tipo} onValueChange={(v) => setTipo(v as FiltroTipo)}><TabsList className="grid w-full grid-cols-3"><TabsTrigger value="todas">Todas</TabsTrigger><TabsTrigger value="despesa">Despesas</TabsTrigger><TabsTrigger value="receita">Receitas</TabsTrigger></TabsList></Tabs></div>
          <div className="space-y-1.5"><label className="text-xs text-muted-foreground">Status</label><Select value={status} onValueChange={(v) => setStatus(v as FiltroStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="pago">Pago</SelectItem><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="vencido">Vencido</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><label className="text-xs text-muted-foreground">Categoria</label><Select value={categoriaId} onValueChange={setCategoriaId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todas">Todas as categorias</SelectItem>{categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1"><label className="text-xs text-muted-foreground">Buscar</label><Input placeholder="Descrição..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        </div>
      </CardContent></Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Receitas</p><p className="text-xl font-bold text-success">{formatarMoeda(totalReceitas)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Despesas pagas</p><p className="text-xl font-bold text-danger">{formatarMoeda(totalDespesas)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Contas pendentes</p><p className="text-xl font-bold text-warning">{formatarMoeda(totalPendentes)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Saldo realizado</p><p className="text-xl font-bold">{formatarMoeda(totalReceitas - totalDespesas)}</p></CardContent></Card>
      </div>

      {isPending ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div> : filtradas.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-2 py-16 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Wallet className="h-6 w-6 text-muted-foreground" /></div><p className="text-sm text-muted-foreground">Nenhuma transação encontrada com os filtros atuais.</p></CardContent></Card> : <Card><CardContent className="p-0"><ul className="divide-y">
        {filtradas.map((t) => {
          const cat = t.categoria_id ? mapaCategorias.get(t.categoria_id) : null;
          const Icon = cat ? iconeCategoria(cat.icone) : Wallet;
          const statusEfetivo = statusTransacao(t);
          return <li key={t.id} className="group flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:flex-nowrap sm:px-6">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ring-1 ring-border/60" style={{ backgroundColor: (cat?.cor ?? "#64748b") + "22", color: cat?.cor ?? "#64748b" }}><Icon className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1"><p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">{t.descricao}{t.recorrencia_id && <span title="Despesa recorrente" className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"><Repeat className="h-3 w-3" />Recorrente</span>}</p><p className="text-xs text-muted-foreground">{cat?.nome ?? "Sem categoria"} · {formatarData(t.data)}{t.data_vencimento ? ` · Vence em ${formatarData(t.data_vencimento)}` : ""}</p></div>
            {t.tipo === "despesa" && <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusEfetivo === "pago" ? "bg-success/10 text-success" : statusEfetivo === "vencido" ? "bg-danger/10 text-danger" : "bg-warning/15 text-warning"}`}>{statusEfetivo}</span>}
            <span className={`flex-shrink-0 text-sm font-semibold ${t.tipo === "receita" ? "text-success" : statusEfetivo === "pago" ? "text-danger" : "text-muted-foreground"}`}>{t.tipo === "receita" ? "+" : "−"}{formatarMoeda(t.valor)}</span>
            <div className="ml-auto flex flex-shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              {t.tipo === "despesa" && statusEfetivo !== "pago" && <Button variant="outline" size="sm" className="h-8 px-2 text-xs" disabled={pagarMutation.isPending} onClick={() => pagarMutation.mutate(t.id)}><Check className="mr-1 h-3.5 w-3.5" />Marcar como pago</Button>}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditando(t); setDialogoAberto(true); }} aria-label="Editar"><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setExcluindo(t)} aria-label="Excluir"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </li>;
        })}
      </ul></CardContent></Card>}

      <TransacaoDialog open={dialogoAberto} onOpenChange={setDialogoAberto} categorias={categorias} transacao={editando} />
      <AlertDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir transação?</AlertDialogTitle><AlertDialogDescription>{excluindo?.recorrencia_id ? `“${excluindo.descricao}” é uma despesa recorrente. Escolha se quer remover somente este mês ou encerrar a recorrência daqui em diante.` : `“${excluindo?.descricao}” será removida permanentemente.`}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="flex-col gap-2 sm:flex-row"><AlertDialogCancel>Cancelar</AlertDialogCancel>{excluindo?.recorrencia_id ? <><Button variant="outline" disabled={excluirMutation.isPending} onClick={() => excluirMutation.mutate("apenas_esta")}>Somente esta</Button><AlertDialogAction disabled={excluirMutation.isPending} onClick={(e) => { e.preventDefault(); excluirMutation.mutate("esta_e_proximas"); }}>Esta e as próximas</AlertDialogAction></> : <AlertDialogAction onClick={() => excluirMutation.mutate(undefined)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>}</AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
