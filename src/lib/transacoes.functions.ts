import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  transacaoSchema,
  statusTransacao,
  type Transacao,
  type TipoTransacao,
  type StatusExibido,
} from "./schemas";
import { emCentavos } from "./format";

const filtrosSchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  tipo: z.enum(["receita", "despesa"]).optional(),
  categoria_id: z.string().uuid().optional(),
  status: z.enum(["todos", "pago", "pendente", "vencido"]).optional(),
  limite: z.number().int().positive().max(500).optional(),
});

function camposPagamento(data: {
  tipo: TipoTransacao;
  status_pagamento?: "pago" | "pendente" | undefined;
  data_vencimento?: string | null | undefined;
  data_pagamento?: string | null | undefined;
  data: string;
}) {
  if (data.tipo !== "despesa") {
    return {
      status_pagamento: "pago" as const,
      data_vencimento: null,
      data_pagamento: null,
    };
  }
  const status = data.status_pagamento ?? "pago";
  return {
    status_pagamento: status,
    data_vencimento: data.data_vencimento ?? null,
    data_pagamento:
      status === "pago" ? (data.data_pagamento ?? data.data) : null,
  };
}

export const listarTransacoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => filtrosSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("transacoes")
      .select("*")
      .order("data", { ascending: false })
      .order("criado_em", { ascending: false });

    if (data.mes) {
      q = q.gte("data", `${data.mes}-01`).lt("data", proximoMes(data.mes));
    }
    if (data.tipo) q = q.eq("tipo", data.tipo);
    if (data.categoria_id) q = q.eq("categoria_id", data.categoria_id);
    if (data.limite) q = q.limit(data.limite);

    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);
    const transacoes = (linhas ?? []) as Transacao[];
    if (!data.status || data.status === "todos") return transacoes;
    return transacoes.filter((t) => statusTransacao(t) === data.status);
  });

export const criarTransacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => transacaoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: linha, error } = await supabase
      .from("transacoes")
      .insert({
        descricao: data.descricao,
        valor: data.valor,
        tipo: data.tipo,
        categoria_id: data.categoria_id ?? null,
        data: data.data,
        user_id: userId,
        ...camposPagamento(data),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return linha as Transacao;
  });

export const atualizarTransacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) => transacaoSchema.extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: linha, error } = await supabase
      .from("transacoes")
      .update({
        descricao: data.descricao,
        valor: data.valor,
        tipo: data.tipo,
        categoria_id: data.categoria_id ?? null,
        data: data.data,
        ...camposPagamento(data),
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return linha as Transacao;
  });

export const marcarTransacaoComoPaga = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), data_pagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const hoje = hojeIso();
    const { data: linha, error } = await supabase
      .from("transacoes")
      .update({ status_pagamento: "pago", data_pagamento: data.data_pagamento ?? hoje })
      .eq("id", data.id)
      .eq("tipo", "despesa")
      .select()
      .single();
    if (error) throw new Error(error.message);
    return linha as Transacao;
  });

export const excluirTransacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("transacoes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Resumo do mês: receitas e somente despesas efetivamente pagas.
export const resumoMes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) => z.object({ mes: z.string().regex(/^\d{4}-\d{2}$/) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: linhas, error } = await supabase
      .from("transacoes")
      .select("valor, tipo, categoria_id, status_pagamento")
      .gte("data", `${data.mes}-01`)
      .lt("data", proximoMes(data.mes));
    if (error) throw new Error(error.message);

    let receitas = 0;
    let despesas = 0;
    const porCategoria = new Map<string, number>();
    for (const t of linhas ?? []) {
      const centavos = emCentavos(Number(t.valor));
      if (t.tipo === "receita") receitas += centavos;
      else if (t.status_pagamento === "pago") {
        despesas += centavos;
        const chave = t.categoria_id ?? "__sem_categoria__";
        porCategoria.set(chave, (porCategoria.get(chave) ?? 0) + centavos);
      }
    }
    return {
      receitas: receitas / 100,
      despesas: despesas / 100,
      saldo: (receitas - despesas) / 100,
      porCategoria: Array.from(porCategoria.entries()).map(
        ([categoria_id, valor]) => ({
          categoria_id: categoria_id === "__sem_categoria__" ? null : categoria_id,
          valor: valor / 100,
        }),
      ),
    };
  });

// Série mensal de receitas e despesas realizadas (pagas).
export const serieMensal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) =>
      z.object({ meses: z.array(z.string().regex(/^\d{4}-\d{2}$/)).min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const inicio = `${data.meses[0] ?? ""}-01`;
    const ultimoMes = data.meses[data.meses.length - 1] ?? "";
    const { data: linhas, error } = await supabase
      .from("transacoes")
      .select("valor, tipo, data, status_pagamento")
      .gte("data", inicio)
      .lt("data", proximoMes(ultimoMes));
    if (error) throw new Error(error.message);

    const mapa = new Map<string, { mes: string; receitas: number; despesas: number }>();
    for (const m of data.meses) mapa.set(m, { mes: m, receitas: 0, despesas: 0 });
    for (const t of linhas ?? []) {
      if (t.tipo === "despesa" && t.status_pagamento !== "pago") continue;
      const entry = mapa.get(String(t.data).slice(0, 7));
      if (!entry) continue;
      const centavos = emCentavos(Number(t.valor));
      if (t.tipo === "receita") entry.receitas += centavos;
      else entry.despesas += centavos;
    }
    return Array.from(mapa.values()).map((e) => ({
      mes: e.mes,
      receitas: e.receitas / 100,
      despesas: e.despesas / 100,
    }));
  });

// Evolução do saldo acumulado usando somente despesas pagas.
export const evolucaoSaldo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) =>
      z.object({ meses: z.array(z.string().regex(/^\d{4}-\d{2}$/)).min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const ultimoMes = data.meses[data.meses.length - 1] ?? "";
    const { data: linhas, error } = await supabase
      .from("transacoes")
      .select("valor, tipo, data, status_pagamento")
      .lt("data", proximoMes(ultimoMes))
      .order("data", { ascending: true });
    if (error) throw new Error(error.message);

    let acumulado = 0;
    const porMes = new Map<string, number>();
    for (const t of linhas ?? []) {
      if (t.tipo === "despesa" && t.status_pagamento !== "pago") continue;
      acumulado += t.tipo === "receita" ? emCentavos(Number(t.valor)) : -emCentavos(Number(t.valor));
      porMes.set(String(t.data).slice(0, 7), acumulado);
    }
    let ultimo: number | null = null;
    return data.meses.map((m) => {
      const valor = porMes.get(m);
      if (valor !== undefined) ultimo = valor;
      return { mes: m, saldo: ultimo === null ? null : ultimo / 100 };
    });
  });

export type ContaAPagar = {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string | null;
  status: StatusExibido;
};

export const contasAPagar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ mes: z.string().regex(/^\d{4}-\d{2}$/).default(mesAtualIso()) })
      .default({ mes: mesAtualIso() })
      .parse(input ?? {}),
  )
  .handler(async ({ data: filtro, context }) => {
    const { data, error } = await context.supabase
      .from("transacoes")
      .select("id, descricao, valor, data_vencimento, tipo, status_pagamento")
      .eq("tipo", "despesa")
      .eq("status_pagamento", "pendente")
      .gte("data", `${filtro.mes}-01`)
      .lt("data", proximoMes(filtro.mes))
      .order("data_vencimento", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    const contas = (data ?? []).map((t) => ({
      id: t.id,
      descricao: t.descricao,
      valor: Number(t.valor),
      data_vencimento: t.data_vencimento,
      status: statusTransacao(t),
    }));
    return {
      pendente: contas.filter((c) => c.status === "pendente").reduce((s, c) => s + c.valor, 0),
      vencido: contas.filter((c) => c.status === "vencido").reduce((s, c) => s + c.valor, 0),
      proximos: contas.filter((c) => c.status === "pendente").slice(0, 5),
    };
  });

function hojeIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function proximoMes(mes: string): string {
  const partes = mes.split("-").map(Number);
  const ano = partes[0] ?? new Date().getFullYear();
  const mesNum = partes[1] ?? 1;
  const d = new Date(ano, mesNum, 1);
  const a = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${a}-${m}-01`;
}

export type { TipoTransacao };

function mesAtualIso(): string {
  return hojeIso().slice(0, 7);
}
