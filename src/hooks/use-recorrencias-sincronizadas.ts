import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { sincronizarRecorrencias } from "@/lib/recorrencias.functions";

/**
 * Gera, uma vez por sessão do app, as ocorrências ainda não materializadas das
 * despesas recorrentes ativas (até 12 meses à frente). A geração é idempotente:
 * cada regra tem no máximo uma ocorrência por mês, garantido no banco.
 */
export function useRecorrenciasSincronizadas() {
  const queryClient = useQueryClient();
  const sincronizar = useServerFn(sincronizarRecorrencias);

  useEffect(() => {
    let cancelado = false;
    sincronizar()
      .then((res) => {
        if (!cancelado && res.criadas > 0) {
          for (const chave of [
            "transacoes",
            "resumo",
            "serie-mensal",
            "evolucao-saldo",
            "orcamentos",
            "previsoes",
          ]) {
            queryClient.invalidateQueries({ queryKey: [chave] });
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [sincronizar, queryClient]);
}
