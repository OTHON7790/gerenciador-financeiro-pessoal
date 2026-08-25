export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarMoedaCompacta(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(valor);
}

export function formatarData(data: string | Date): string {
  let d: Date;
  if (typeof data === "string") {
    // Datas no formato 'YYYY-MM-DD' devem ser interpretadas como data local,
    // caso contrário o JS assume UTC e o fuso horário desloca um dia.
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data.trim());
    d = m
      ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
      : new Date(data);
  } else {
    d = data;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatarMes(mes: string): string {
  // mes no formato 'YYYY-MM'
  const partes = mes.split("-").map(Number);
  const ano = partes[0] ?? new Date().getFullYear();
  const mesNum = partes[1] ?? new Date().getMonth() + 1;
  const data = new Date(ano, mesNum - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(data);
}

export function mesAtual(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

export function mesesAnteriores(quantidade: number): string[] {
  const meses: string[] = [];
  const agora = new Date();
  for (let i = quantidade - 1; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    meses.push(`${ano}-${mes}`);
  }
  return meses;
}

export function paraFloat(valor: string): number {
  // aceita "1.234,56" ou "1234.56"
  const normalizado = valor
    .replace(/\s/g, "")
    .replace(/R\$/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const n = parseFloat(normalizado);
  return Number.isFinite(n) ? n : 0;
}
