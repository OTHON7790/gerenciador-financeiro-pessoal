import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { transacaoSchema, type Transacao, type TipoTransacao } from "./schemas";
import { emCentavos } from "./format";

const filtrosSchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  tipo: z.enum(["receita", "despesa"]).optional(),
  categoria_id: z.string().uuid().optional(),
  limite: z.number().int().positive().max(500).optional(),
});

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
    return (linhas ?? []) as Transacao[];
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
      })
      .eq("id", data.id)
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

// Resumo do mês: receitas, despesas, saldo e despesas por categoria
export const resumoMes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) => z.object({ mes: z.string().regex(/^\d{4}-\d{2}$/) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: linhas, error } = await supabase
      .from("transacoes")
      .select("valor, tipo, categoria_id")
      .gte("data", `${data.mes}-01`)
      .lt("data", proximoMes(data.mes));
    if (error) throw new Error(error.message);

    let receitas = 0;
    let despesas = 0;
    const porCategoria = new Map<string, number>();
    for (const t of linhas ?? []) {
      const centavos = emCentavos(Number(t.valor));
      if (t.tipo === "receita") receitas += centavos;
      else {
        despesas += centavos;
        // Despesas sem categoria entram no grupo "Sem categoria"
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
          categoria_id:
            categoria_id === "__sem_categoria__" ? null : categoria_id,
          valor: valor / 100,
        }),
      ),
    };
  });

// Série mensal de receitas e despesas para os últimos N meses
export const serieMensal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) =>
      z
        .object({ meses: z.array(z.string().regex(/^\d{4}-\d{2}$/)).min(1) })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const inicio = `${data.meses[0] ?? ""}-01`;
    const ultimoMes = data.meses[data.meses.length - 1] ?? "";
    const fim = proximoMes(ultimoMes);
    const { data: linhas, error } = await supabase
      .from("transacoes")
      .select("valor, tipo, data")
      .gte("data", inicio)
      .lt("data", fim);
    if (error) throw new Error(error.message);

    const mapa = new Map<
      string,
      { mes: string; receitas: number; despesas: number }
    >();
    for (const m of data.meses) mapa.set(m, { mes: m, receitas: 0, despesas: 0 });
    for (const t of linhas ?? []) {
      const mes = String(t.data).slice(0, 7);
      const entry = mapa.get(mes);
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

// Evolução do saldo acumulado por mês
export const evolucaoSaldo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) =>
      z
        .object({ meses: z.array(z.string().regex(/^\d{4}-\d{2}$/)).min(1) })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const ultimoMes = data.meses[data.meses.length - 1] ?? "";
    const { data: linhas, error } = await supabase
      .from("transacoes")
      .select("valor, tipo, data")
      .lte("data", proximoMes(ultimoMes))
      .order("data", { ascending: true });
    if (error) throw new Error(error.message);

    let acumulado = 0;
    const porMes = new Map<string, number>();
    for (const t of linhas ?? []) {
      acumulado +=
        t.tipo === "receita"
          ? emCentavos(Number(t.valor))
          : -emCentavos(Number(t.valor));
      porMes.set(String(t.data).slice(0, 7), acumulado);
    }
    let ultimo = acumulado;
    return data.meses.map((m) => {
      const valor = porMes.get(m);
      if (valor !== undefined) ultimo = valor;
      return { mes: m, saldo: ultimo / 100 };
    });
  });

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
