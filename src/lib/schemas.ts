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

// Metas financeiras
export const metaSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da meta").max(60),
  valor_alvo: z.number().positive("O valor-alvo deve ser maior que zero"),
  valor_acumulado: z.number().min(0, "O valor não pode ser negativo").default(0),
  prazo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .nullable()
    .optional(),
});
export type MetaInput = z.infer<typeof metaSchema>;

export const aporteSchema = z.object({
  id: z.string().uuid(),
  valor: z.number().positive("O valor deve ser maior que zero"),
});
export type AporteInput = z.infer<typeof aporteSchema>;

export type Meta = {
  id: string;
  user_id: string;
  nome: string;
  valor_alvo: number;
  valor_acumulado: number;
  prazo: string | null;
  cor: string;
  icone: string;
  criado_em: string;
  atualizado_em: string;
};

export type StatusMeta = "concluida" | "atrasada" | "andamento";

export function progressoMeta(meta: Meta): {
  percentual: number;
  restante: number;
  status: StatusMeta;
  rotulo: string;
} {
  const percentual =
    meta.valor_alvo > 0 ? (meta.valor_acumulado / meta.valor_alvo) * 100 : 0;
  const restante = Math.max(meta.valor_alvo - meta.valor_acumulado, 0);

  let status: StatusMeta = "andamento";
  if (percentual >= 100) {
    status = "concluida";
  } else if (meta.prazo) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(meta.prazo);
    if (m) {
      const limite = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (limite < hoje) status = "atrasada";
    }
  }

  const rotulo =
    status === "concluida"
      ? "Concluída"
      : status === "atrasada"
        ? "Atrasada"
        : "Em andamento";

  return { percentual, restante, status, rotulo };
}

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
