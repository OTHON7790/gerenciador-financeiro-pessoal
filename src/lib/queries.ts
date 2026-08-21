import { queryOptions } from "@tanstack/react-query";
import {
  listarCategorias,
  garantirCategoriasPadrao,
} from "./categorias.functions";
import {
  listarTransacoes,
  resumoMes,
  serieMensal,
  evolucaoSaldo,
} from "./transacoes.functions";
import { listarOrcamentos } from "./orcamentos.functions";

export const categoriasQuery = queryOptions({
  queryKey: ["categorias"],
  queryFn: () => listarCategorias(),
});

export const transacoesQuery = (filtros: {
  mes?: string;
  tipo?: "receita" | "despesa";
  categoria_id?: string;
  limite?: number;
}) =>
  queryOptions({
    queryKey: ["transacoes", filtros],
    queryFn: () => listarTransacoes({ data: filtros }),
  });

export const resumoMesQuery = (mes: string) =>
  queryOptions({
    queryKey: ["resumo", mes],
    queryFn: () => resumoMes({ data: { mes } }),
  });

export const serieMensalQuery = (meses: string[]) =>
  queryOptions({
    queryKey: ["serie-mensal", meses],
    queryFn: () => serieMensal({ data: { meses } }),
  });

export const evolucaoSaldoQuery = (meses: string[]) =>
  queryOptions({
    queryKey: ["evolucao-saldo", meses],
    queryFn: () => evolucaoSaldo({ data: { meses } }),
  });

export const orcamentosQuery = (mes: string) =>
  queryOptions({
    queryKey: ["orcamentos", mes],
    queryFn: () => listarOrcamentos({ data: { mes } }),
  });

export { garantirCategoriasPadrao };
