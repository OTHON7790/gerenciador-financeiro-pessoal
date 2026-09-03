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
  contasAPagar,
  comprometidoMes,
} from "./transacoes.functions";
import { listarOrcamentos } from "./orcamentos.functions";
import { listarMetas } from "./metas.functions";
import { previsaoAnual } from "./previsoes.functions";

export const previsaoAnualQuery = (ano: number) =>
  queryOptions({
    queryKey: ["previsoes", ano],
    queryFn: () => previsaoAnual({ data: { ano } }),
  });

export const metasQuery = queryOptions({
  queryKey: ["metas"],
  queryFn: () => listarMetas(),
});

export const categoriasQuery = queryOptions({
  queryKey: ["categorias"],
  queryFn: () => listarCategorias(),
  select: (categorias) =>
    [...categorias].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }),
    ),
});

export const transacoesQuery = (filtros: {
  mes?: string;
  tipo?: "receita" | "despesa";
  categoria_id?: string;
  status?: "todos" | "pago" | "pendente" | "vencido";
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

export const comprometidoMesQuery = (mes: string) =>
  queryOptions({
    queryKey: ["comprometido", mes],
    queryFn: () => comprometidoMes({ data: { mes } }),
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

export const contasAPagarQuery = (mes: string) =>
  queryOptions({
    queryKey: ["contas-a-pagar", mes],
    queryFn: () => contasAPagar({ data: { mes } }),
  });

export { garantirCategoriasPadrao };
