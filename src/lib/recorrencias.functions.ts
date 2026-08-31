import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import {
  recorrenciaSchema,
  atualizarOcorrenciaSchema,
  excluirOcorrenciaSchema,
  type Recorrencia,
} from "./schemas";

// ---------- utilidades de data (puras, sem fuso) ----------

const MESES_HORIZONTE = 12;

function refMes(d: { ano: number; mes: number }): string {
  return `${d.ano}-${String(d.mes).padStart(2, "0")}`;
}

function ultimoDiaDoMes(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate();
}

function dataDoDia(ano: number, mes: number, dia: number): string {
  const d = Math.min(dia, ultimoDiaDoMes(ano, mes));
  return `${ano}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function partesData(iso: string): { ano: number; mes: number; dia: number } {
  const [a, m, d] = iso.split("-").map(Number);
  return { ano: a ?? 1970, mes: m ?? 1, dia: d ?? 1 };
}

function horizonte(): { ano: number; mes: number } {
  const hoje = new Date();
  const d = new Date(hoje.getFullYear(), hoje.getMonth() + MESES_HORIZONTE, 1);
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 };
}

/** Lista de ocorrências (ref do mês + data) de uma regra, limitada ao horizonte. */
function ocorrenciasPrevistas(rec: {
  frequencia: "mensal" | "anual";
  dia_referencia: number;
  data_inicio: string;
  data_fim: string | null;
}): { ref: string; data: string }[] {
  const inicio = partesData(rec.data_inicio);
  const limiteHorizonte = horizonte();
  const fim = rec.data_fim ? partesData(rec.data_fim) : null;

  const dentro = (ano: number, mes: number) => {
    if (ano * 12 + mes > limiteHorizonte.ano * 12 + limiteHorizonte.mes)
      return false;
    if (fim && ano * 12 + mes > fim.ano * 12 + fim.mes) return false;
    return true;
  };

  const saida: { ref: string; data: string }[] = [];
  let ano = inicio.ano;
  let mes = inicio.mes;
  const passo = rec.frequencia === "anual" ? 12 : 1;

  while (dentro(ano, mes) && saida.length < 240) {
    const data = dataDoDia(ano, mes, rec.dia_referencia);
    if (!fim || data <= rec.data_fim!) {
      saida.push({ ref: refMes({ ano, mes }), data });
    }
    const total = (ano * 12 + (mes - 1)) + passo;
    ano = Math.floor(total / 12);
    mes = (total % 12) + 1;
  }
  return saida;
}

// ---------- geração idempotente ----------

type ClienteSupabase = SupabaseClient<Database>;

async function gerarOcorrencias(
  supabase: ClienteSupabase,
  userId: string,
  rec: Recorrencia,
): Promise<number> {
  const previstas = ocorrenciasPrevistas(rec);
  if (previstas.length === 0) return 0;

  const { data: existentes, error } = await supabase
    .from("transacoes")
    .select("ocorrencia_ref")
    .eq("recorrencia_id", rec.id);
  if (error) throw new Error(error.message);

  const jaExistem = new Set(
    (existentes ?? []).map((t) => t.ocorrencia_ref).filter(Boolean),
  );
  const faltantes = previstas.filter((o) => !jaExistem.has(o.ref));
  if (faltantes.length === 0) return 0;

  const linhas = faltantes.map((o) => ({
    user_id: userId,
    descricao: rec.descricao,
    valor: rec.valor,
    tipo: "despesa" as const,
    categoria_id: rec.categoria_id,
    data: o.data,
    recorrencia_id: rec.id,
    ocorrencia_ref: o.ref,
    editada_manualmente: false,
  }));

  const { error: erroInsert } = await supabase.from("transacoes").insert(linhas);
  // conflito com o índice único = outra chamada já gerou; não é erro real
  if (erroInsert && !erroInsert.message.includes("duplicate key")) {
    throw new Error(erroInsert.message);
  }
  return linhas.length;
}

// ---------- server functions ----------

export const listarRecorrencias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("recorrencias")
      .select("*")
      .order("criado_em", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Recorrencia[];
  });

export const criarRecorrencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => recorrenciaSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { dia } = { dia: partesData(data.data_inicio).dia };

    const { data: rec, error } = await supabase
      .from("recorrencias")
      .insert({
        user_id: userId,
        descricao: data.descricao,
        valor: data.valor,
        categoria_id: data.categoria_id ?? null,
        frequencia: data.frequencia,
        dia_referencia: dia,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const criadas = await gerarOcorrencias(
      supabase,
      userId,
      rec as Recorrencia,
    );
    return { recorrencia: rec as Recorrencia, criadas };
  });

/** Sincroniza as ocorrências de todas as recorrências ativas do usuário. */
export const sincronizarRecorrencias = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: regras, error } = await supabase
      .from("recorrencias")
      .select("*")
      .eq("ativa", true);
    if (error) throw new Error(error.message);

    let criadas = 0;
    for (const rec of (regras ?? []) as Recorrencia[]) {
      criadas += await gerarOcorrencias(supabase, userId, rec);
    }
    return { criadas };
  });

/**
 * Atualiza uma ocorrência recorrente.
 * escopo = "apenas_esta": muda somente aquele mês (marcado como editado à mão).
 * escopo = "esta_e_proximas": atualiza a regra e as ocorrências futuras que
 * ainda não foram editadas individualmente. Meses anteriores ficam intactos.
 */
export const atualizarOcorrencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => atualizarOcorrenciaSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: atual, error: erroAtual } = await supabase
      .from("transacoes")
      .select("*")
      .eq("id", data.id)
      .single();
    if (erroAtual) throw new Error(erroAtual.message);

    const campos = {
      descricao: data.descricao,
      valor: data.valor,
      categoria_id: data.categoria_id ?? null,
    };

    if (data.escopo === "apenas_esta" || !atual.recorrencia_id) {
      const { error } = await supabase
        .from("transacoes")
        .update({ ...campos, data: data.data, editada_manualmente: true })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, atualizadas: 1 };
    }

    const ref = atual.ocorrencia_ref ?? String(atual.data).slice(0, 7);

    const { error: erroRegra } = await supabase
      .from("recorrencias")
      .update({
        ...campos,
        dia_referencia: partesData(data.data).dia,
        ...(data.data_fim !== undefined ? { data_fim: data.data_fim } : {}),
      })
      .eq("id", atual.recorrencia_id);
    if (erroRegra) throw new Error(erroRegra.message);

    // Ocorrência atual sempre recebe a alteração
    const { error: erroEsta } = await supabase
      .from("transacoes")
      .update({ ...campos, data: data.data })
      .eq("id", data.id);
    if (erroEsta) throw new Error(erroEsta.message);

    // Próximas ocorrências ainda não personalizadas
    const { data: futuras, error: erroFuturas } = await supabase
      .from("transacoes")
      .update(campos)
      .eq("recorrencia_id", atual.recorrencia_id)
      .eq("editada_manualmente", false)
      .gt("ocorrencia_ref", ref)
      .select("id");
    if (erroFuturas) throw new Error(erroFuturas.message);

    // Se o término mudou, remove ocorrências futuras fora do novo período
    if (data.data_fim) {
      const { error: erroCorte } = await supabase
        .from("transacoes")
        .delete()
        .eq("recorrencia_id", atual.recorrencia_id)
        .eq("editada_manualmente", false)
        .gt("data", data.data_fim);
      if (erroCorte) throw new Error(erroCorte.message);
    }

    const { data: rec } = await supabase
      .from("recorrencias")
      .select("*")
      .eq("id", atual.recorrencia_id)
      .single();
    if (rec) await gerarOcorrencias(supabase, userId, rec as Recorrencia);

    return { ok: true, atualizadas: 1 + (futuras?.length ?? 0) };
  });

/**
 * Exclui uma ocorrência recorrente: apenas aquele mês, ou encerra a
 * recorrência a partir dali (mantendo o histórico anterior).
 */
export const excluirOcorrencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => excluirOcorrenciaSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: atual, error: erroAtual } = await supabase
      .from("transacoes")
      .select("id, data, recorrencia_id, ocorrencia_ref")
      .eq("id", data.id)
      .single();
    if (erroAtual) throw new Error(erroAtual.message);

    if (data.escopo === "apenas_esta" || !atual.recorrencia_id) {
      const { error } = await supabase
        .from("transacoes")
        .delete()
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { error: erroFuturas } = await supabase
      .from("transacoes")
      .delete()
      .eq("recorrencia_id", atual.recorrencia_id)
      .gte("data", atual.data);
    if (erroFuturas) throw new Error(erroFuturas.message);

    const partes = partesData(String(atual.data));
    const anterior = new Date(partes.ano, partes.mes - 1, partes.dia - 1);
    const fim = `${anterior.getFullYear()}-${String(anterior.getMonth() + 1).padStart(2, "0")}-${String(anterior.getDate()).padStart(2, "0")}`;

    const { error: erroRegra } = await supabase
      .from("recorrencias")
      .update({ ativa: false, data_fim: fim })
      .eq("id", atual.recorrencia_id);
    if (erroRegra) throw new Error(erroRegra.message);

    return { ok: true };
  });
