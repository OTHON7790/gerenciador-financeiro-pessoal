import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { categoriaSchema, type Categoria } from "./schemas";
import { CATEGORIAS_PADRAO } from "./default-categorias";

// Garante categorias padrão para o usuário (idempotente)
export const garantirCategoriasPadrao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { count } = await supabase
      .from("categorias")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if ((count ?? 0) > 0) return { criadas: 0 };

    const linhas = CATEGORIAS_PADRAO.map((c) => ({ ...c, user_id: userId }));
    const { error } = await supabase.from("categorias").insert(linhas);
    if (error) throw new Error(error.message);
    return { criadas: linhas.length };
  });

export const listarCategorias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("tipo")
      .order("nome");
    if (error) throw new Error(error.message);
    return (data ?? []) as Categoria[];
  });

export const criarCategoria = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => categoriaSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: linha, error } = await supabase
      .from("categorias")
      .insert({ ...data, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return linha as Categoria;
  });

export const atualizarCategoria = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input) =>
      categoriaSchema.extend({ id: input.id }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...resto } = data;
    const { data: linha, error } = await supabase
      .from("categorias")
      .update(resto)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return linha as Categoria;
  });

export const excluirCategoria = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("categorias").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
