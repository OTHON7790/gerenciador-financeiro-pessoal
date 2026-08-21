import { z } from "zod";

export const TIPO_TRANSACAO = ["receita", "despesa"] as const;
export type TipoTransacao = (typeof TIPO_TRANSACAO)[number];

// Categorias
export const categoriaSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(40),
  tipo: z.enum(TIPO_TRANSACAO),
  cor: z.string().trim().min(1).default("#3b82f6"),
  icone: z.string().trim().min(1).default("wallet"),
});
export type CategoriaInput = z.infer<typeof categoriaSchema>;

// Transações
export const transacaoSchema = z.object({
  descricao: z.string().trim().min(1, "Informe a descrição").max(100),
  valor: z.number().positive("O valor deve ser maior que zero"),
  tipo: z.enum(TIPO_TRANSACAO),
  categoria_id: z.string().uuid().nullable().optional(),
  data: z.string().min(1, "Informe a data"),
});
export type TransacaoInput = z.infer<typeof transacaoSchema>;

// Orçamentos
export const orcamentoSchema = z.object({
  categoria_id: z.string().uuid(),
  mes: z.string().regex(/^\d{4}-\d{2}$/, "Mês inválido"),
  limite: z.number().min(0, "O limite não pode ser negativo"),
});
export type OrcamentoInput = z.infer<typeof orcamentoSchema>;

// Tipos de domínio (espelham as linhas do banco)
export type Categoria = {
  id: string;
  user_id: string;
  nome: string;
  tipo: TipoTransacao;
  cor: string;
  icone: string;
  criado_em: string;
};

export type Transacao = {
  id: string;
  user_id: string;
  categoria_id: string | null;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  data: string;
  criado_em: string;
};

export type Orcamento = {
  id: string;
  user_id: string;
  categoria_id: string;
  mes: string;
  limite: number;
  criado_em: string;
};
