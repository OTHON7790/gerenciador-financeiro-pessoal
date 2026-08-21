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
