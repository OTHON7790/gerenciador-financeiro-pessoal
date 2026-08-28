export type PontoSerie = { mes: string; receitas: number; despesas: number };

// Valores determinísticos (sem aleatoriedade) derivados do próprio mês,
// usados apenas para ilustrar meses em que ainda não existem transações.
function pseudo(mes: string, sal: number): number {
  let h = 2166136261 ^ sal;
  for (let i = 0; i < mes.length; i++) {
    h ^= mes.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function arredondar(v: number): number {
  return Math.round(v / 10) * 10;
}

export function pontoDemo(mes: string): PontoSerie {
  const receitas = arredondar(3800 + pseudo(mes, 7) * 2400);
  const despesas = arredondar(2100 + pseudo(mes, 23) * 2800);
  return { mes, receitas, despesas };
}

/**
 * Preenche apenas os meses sem nenhuma movimentação real.
 * Quando o usuário já possui transações reais em 3 ou mais meses distintos,
 * a demonstração é desativada e a série real é devolvida intacta.
 */
export function aplicarDemo(serie: PontoSerie[]): {
  dados: PontoSerie[];
  demo: boolean;
} {
  const mesesComDados = serie.filter(
    (s) => s.receitas > 0 || s.despesas > 0,
  ).length;
  if (serie.length === 0 || mesesComDados >= 3) {
    return { dados: serie, demo: false };
  }
  let usouDemo = false;
  const dados = serie.map((s) => {
    if (s.receitas > 0 || s.despesas > 0) return s;
    usouDemo = true;
    return pontoDemo(s.mes);
  });
  return { dados, demo: usouDemo };
}
