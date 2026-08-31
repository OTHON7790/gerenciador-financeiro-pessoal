import type { TipoTransacao } from "./schemas";

export type CategoriaPadrao = {
  nome: string;
  tipo: TipoTransacao;
  cor: string;
  icone: string;
};

export const CATEGORIAS_PADRAO: CategoriaPadrao[] = [
  { nome: "Salário", tipo: "receita", cor: "#16a34a", icone: "banknote" },
  { nome: "Freelance", tipo: "receita", cor: "#22c55e", icone: "laptop" },
  { nome: "Investimentos", tipo: "receita", cor: "#10b981", icone: "trending-up" },
  { nome: "Outros ganhos", tipo: "receita", cor: "#84cc16", icone: "plus-circle" },
  { nome: "Alimentação", tipo: "despesa", cor: "#ef4444", icone: "utensils" },
  { nome: "Moradia", tipo: "despesa", cor: "#f97316", icone: "home" },
  { nome: "Transporte", tipo: "despesa", cor: "#f59e0b", icone: "car" },
  { nome: "Saúde", tipo: "despesa", cor: "#ec4899", icone: "heart-pulse" },
  { nome: "Educação", tipo: "despesa", cor: "#8b5cf6", icone: "graduation-cap" },
  { nome: "Lazer", tipo: "despesa", cor: "#06b6d4", icone: "gamepad-2" },
  { nome: "Compras", tipo: "despesa", cor: "#6366f1", icone: "shopping-bag" },
  { nome: "Assinaturas", tipo: "despesa", cor: "#a855f7", icone: "repeat" },
  { nome: "Energia Elétrica", tipo: "despesa", cor: "#eab308", icone: "zap" },
  { nome: "Água", tipo: "despesa", cor: "#0ea5e9", icone: "droplets" },
  { nome: "Gás", tipo: "despesa", cor: "#fb923c", icone: "flame" },
  { nome: "Internet/Telefone", tipo: "despesa", cor: "#4f46e5", icone: "wifi" },
  {
    nome: "Dívidas/Parcelamentos",
    tipo: "despesa",
    cor: "#b91c1c",
    icone: "credit-card",
  },
  { nome: "Cuidados Pessoais", tipo: "despesa", cor: "#f472b6", icone: "scissors" },
  { nome: "Outras despesas", tipo: "despesa", cor: "#64748b", icone: "wallet" },
];
