import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { somarCentavos } from "./format";

export type PrevisaoMes = {
  mes: string; // YYYY-MM
  receitaReal: number;
  despesaReal: number;
  /** Despesas recorrentes do mês (pagas + pendentes). */
  despesaRecorrente: number;
  /** Despesas pagas do mês que NÃO são recorrentes (gastos variáveis). */
  despesaVariavelPaga: number;
  /** Receitas recorrentes do mês. */
  receitaRecorrente: number;
  orcado: number;
  temTransacoes: boolean;
  temOrcamento: boolean;
};

/** Agrega transações e orçamentos reais dos 12 meses do ano (somente leitura). */
export const previsaoAnual = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ ano: z.number().int().min(2000).max(2100) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const ano = data.ano;
    const inicio = `${ano}-01-01`;
    const fim = `${ano + 1}-01-01`;

    const meses = Array.from(
      { length: 12 },
      (_, i) => `${ano}-${String(i + 1).padStart(2, "0")}`,
    );

    const [transacoesRes, orcamentosRes] = await Promise.all([
      supabase
.from("transacoes")
        .select("valor, tipo, data, status_pagamento")
        .gte("data", inicio)
        .lt("data", fim),
      supabase.from("orcamentos").select("limite, mes").in("mes", meses),
    ]);

    if (transacoesRes.error) throw new Error(transacoesRes.error.message);
    if (orcamentosRes.error) throw new Error(orcamentosRes.error.message);

    const mapa = new Map<string, PrevisaoMes>();
    for (const m of meses)
      mapa.set(m, {
        mes: m,
        receitaReal: 0,
        despesaReal: 0,
        orcado: 0,
        temTransacoes: false,
        temOrcamento: false,
      });

    for (const t of transacoesRes.data ?? []) {
      if (t.tipo === "despesa" && t.status_pagamento !== "pago") continue;
      const chave = String(t.data).slice(0, 7);
      const linha = mapa.get(chave);
      if (!linha) continue;
      linha.temTransacoes = true;
      if (t.tipo === "receita")
        linha.receitaReal = somarCentavos(linha.receitaReal, Number(t.valor));
      else linha.despesaReal = somarCentavos(linha.despesaReal, Number(t.valor));
    }

    for (const o of orcamentosRes.data ?? []) {
      const linha = mapa.get(String(o.mes));
      if (!linha) continue;
      linha.temOrcamento = true;
      linha.orcado = somarCentavos(linha.orcado, Number(o.limite));
    }

    return meses.map((m) => mapa.get(m)!);
  });
