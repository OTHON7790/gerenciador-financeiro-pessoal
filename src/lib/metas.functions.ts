import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { metaSchema, type Meta } from "./schemas";

export const listarMetas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("metas")
      .select("*")
      .order("criado_em", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Meta[];
  });

export const salvarMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    metaSchema.extend({ id: z.string().uuid().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const campos = {
      nome: data.nome,
      valor_alvo: data.valor_alvo,
      valor_acumulado: data.valor_acumulado,
      data_inicio: data.data_inicio ?? null,
      prazo: data.prazo ?? null,
    };
    if (data.id) {
      const { data: linha, error } = await supabase
        .from("metas")
        .update(campos)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return linha as Meta;
    }
    const { data: linha, error } = await supabase
      .from("metas")
      .insert({ ...campos, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return linha as Meta;
  });

export const adicionarValorMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        valor: z.number().positive("O valor deve ser maior que zero"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: atual, error: erroLeitura } = await supabase
      .from("metas")
      .select("valor_acumulado")
      .eq("id", data.id)
      .single();
    if (erroLeitura) throw new Error(erroLeitura.message);

    // Soma em centavos inteiros para não perder/deslocar centavos.
    const centavos =
      Math.round(Number(atual.valor_acumulado) * 100) +
      Math.round(data.valor * 100);
    const novo = Math.max(centavos, 0) / 100;
    const { data: linha, error } = await supabase
      .from("metas")
      .update({ valor_acumulado: novo })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return linha as Meta;
  });

export const excluirMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("metas")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
