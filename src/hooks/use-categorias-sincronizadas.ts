import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { garantirCategoriasPadrao } from "@/lib/queries";

/**
 * Garante, uma única vez por sessão do app, que todas as categorias padrão
 * existam para o usuário — independentemente da tela em que ele entrou.
 * Ao criar categorias faltantes, invalida o cache compartilhado de categorias
 * para que todos os seletores do app passem a listá-las imediatamente.
 */
export function useCategoriasSincronizadas() {
  const queryClient = useQueryClient();
  const garantir = useServerFn(garantirCategoriasPadrao);

  useEffect(() => {
    let cancelado = false;
    garantir()
      .then((res) => {
        if (!cancelado && res.criadas > 0) {
          queryClient.invalidateQueries({ queryKey: ["categorias"] });
        }
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [garantir, queryClient]);
}
