import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { orcamentoSchema, type Orcamento } from "./schemas";

export const listarOrcamentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) =>
      z.object({ mes: z.string().regex(/^\d{4}-\d{2}$/) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: linhas, error } = await supabase
      .from("orcamentos")
      .select("*")
      .eq("mes", data.mes)
      .order("categoria_id");
    if (error) throw new Error(error.message);
    return (linhas ?? []) as Orcamento[];
  });

export const salvarOrcamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) =>
      orcamentoSchema
        .extend({ id: z.string().uuid().optional() })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.id) {
      const { data: linha, error } = await supabase
        .from("orcamentos")
        .update({ limite: data.limite })
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return linha as Orcamento;
    }
    const { data: linha, error } = await supabase
      .from("orcamentos")
      .insert({
        user_id: userId,
        categoria_id: data.categoria_id,
        mes: data.mes,
        limite: data.limite,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return linha as Orcamento;
  });

export const excluirOrcamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("orcamentos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

function mesAnteriorDe(mes: string): string {
  const ano = Number(mes.slice(0, 4));
  const m = Number(mes.slice(5, 7));
  const anoAnt = m === 1 ? ano - 1 : ano;
  const mesAnt = m === 1 ? 12 : m - 1;
  return `${anoAnt}-${String(mesAnt).padStart(2, "0")}`;
}

export const copiarOrcamentosMesAnterior = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) =>
      z.object({ mes: z.string().regex(/^\d{4}-\d{2}$/) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const origem = mesAnteriorDe(data.mes);

    const { data: linhas, error } = await supabase
      .from("orcamentos")
      .select("categoria_id, limite, mes")
      .in("mes", [origem, data.mes]);
    if (error) throw new Error(error.message);

    const doOrigem = (linhas ?? []).filter((l) => l.mes === origem);
    const destinoCategorias = new Set(
      (linhas ?? []).filter((l) => l.mes === data.mes).map((l) => l.categoria_id),
    );

    if (doOrigem.length === 0) {
      return { copiados: 0, origem, semOrigem: true };
    }

    const novos = doOrigem
      .filter((l) => !destinoCategorias.has(l.categoria_id))
      .map((l) => ({
        user_id: userId,
        categoria_id: l.categoria_id,
        mes: data.mes,
        limite: l.limite,
      }));

    if (novos.length === 0) {
      return { copiados: 0, origem, semOrigem: false };
    }

    const { error: erroInsert } = await supabase.from("orcamentos").insert(novos);
    if (erroInsert) throw new Error(erroInsert.message);

    return { copiados: novos.length, origem, semOrigem: false };
  });

