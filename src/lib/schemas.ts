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

// Recorrências (despesas recorrentes)
export const FREQUENCIAS = ["mensal", "anual"] as const;
export type FrequenciaRecorrencia = (typeof FREQUENCIAS)[number];

const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");

export const recorrenciaSchema = z.object({
  descricao: z.string().trim().min(1, "Informe a descrição").max(100),
  valor: z.number().positive("O valor deve ser maior que zero"),
  categoria_id: z.string().uuid().nullable().optional(),
  frequencia: z.enum(FREQUENCIAS),
  data_inicio: dataIso,
  data_fim: dataIso.nullable().optional(),
});
export type RecorrenciaInput = z.infer<typeof recorrenciaSchema>;

export const ESCOPOS_RECORRENCIA = ["apenas_esta", "esta_e_proximas"] as const;
export type EscopoRecorrencia = (typeof ESCOPOS_RECORRENCIA)[number];

export const atualizarOcorrenciaSchema = z.object({
  id: z.string().uuid(),
  descricao: z.string().trim().min(1).max(100),
  valor: z.number().positive("O valor deve ser maior que zero"),
  categoria_id: z.string().uuid().nullable().optional(),
  data: dataIso,
  data_fim: dataIso.nullable().optional(),
  escopo: z.enum(ESCOPOS_RECORRENCIA),
});

export const excluirOcorrenciaSchema = z.object({
  id: z.string().uuid(),
  escopo: z.enum(ESCOPOS_RECORRENCIA),
});

export type Recorrencia = {
  id: string;
  user_id: string;
  descricao: string;
  valor: number;
  categoria_id: string | null;
  frequencia: FrequenciaRecorrencia;
  dia_referencia: number;
  data_inicio: string;
  data_fim: string | null;
  ativa: boolean;
  criado_em: string;
  atualizado_em: string;
};

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
  data_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .nullable()
    .optional(),
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
  data_inicio: string | null;
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

export type SituacaoMeta =
  | "concluida"
  | "dentro"
  | "atencao"
  | "fora"
  | "sem_prazo";

function parseDataLocal(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor.trim());
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mesesEntre(inicio: Date, fim: Date): number {
  return (fim.getFullYear() - inicio.getFullYear()) * 12 +
    (fim.getMonth() - inicio.getMonth());
}

export function planejarMeta(meta: Meta): {
  metaMensal: number;
  esperadoHoje: number;
  acumulado: number;
  diferenca: number;
  restante: number;
  mesesRestantes: number;
  valorMensalNovo: number;
  situacao: SituacaoMeta;
  rotulo: string;
  atrasado: boolean;
} {
  const acumulado = meta.valor_acumulado;
  const restante = Math.max(meta.valor_alvo - acumulado, 0);
  const percentual =
    meta.valor_alvo > 0 ? (acumulado / meta.valor_alvo) * 100 : 0;

  if (percentual >= 100) {
    return {
      metaMensal: 0,
      esperadoHoje: meta.valor_alvo,
      acumulado,
      diferenca: acumulado - meta.valor_alvo,
      restante: 0,
      mesesRestantes: 0,
      valorMensalNovo: 0,
      situacao: "concluida",
      rotulo: "Meta alcançada",
      atrasado: false,
    };
  }

  if (!meta.prazo) {
    return {
      metaMensal: 0,
      esperadoHoje: 0,
      acumulado,
      diferenca: 0,
      restante,
      mesesRestantes: 0,
      valorMensalNovo: 0,
      situacao: "sem_prazo",
      rotulo: "Sem prazo",
      atrasado: false,
    };
  }

  const limite = parseDataLocal(meta.prazo);
  if (!limite) {
    return {
      metaMensal: 0,
      esperadoHoje: 0,
      acumulado,
      diferenca: 0,
      restante,
      mesesRestantes: 0,
      valorMensalNovo: 0,
      situacao: "sem_prazo",
      rotulo: "Sem prazo",
      atrasado: false,
    };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const prazoVencido = limite < hoje;
  const mesesRestantes = Math.max(mesesEntre(hoje, limite), 0);

  const inicio =
    parseDataLocal(meta.data_inicio) ?? parseDataLocal(meta.criado_em) ?? hoje;
  const totalMeses = Math.max(mesesEntre(inicio, limite), 1);
  const mesesPassados = Math.min(Math.max(mesesEntre(inicio, hoje), 0), totalMeses);

  const metaMensal = meta.valor_alvo / totalMeses;
  const esperadoHoje = Math.min(
    Math.max(metaMensal * mesesPassados, 0),
    meta.valor_alvo,
  );
  const diferenca = acumulado - esperadoHoje;
  const valorMensalNovo =
    mesesRestantes > 0 ? restante / mesesRestantes : restante;

  let situacao: SituacaoMeta;
  let rotulo: string;
  if (prazoVencido) {
    situacao = "fora";
    rotulo = "Fora da meta";
  } else if (acumulado >= esperadoHoje) {
    situacao = "dentro";
    rotulo = "Dentro da meta";
  } else if (esperadoHoje > 0 && acumulado >= esperadoHoje * 0.9) {
    situacao = "atencao";
    rotulo = "Atenção";
  } else {
    situacao = "fora";
    rotulo = "Fora da meta";
  }

  return {
    metaMensal,
    esperadoHoje,
    acumulado,
    diferenca,
    restante,
    mesesRestantes,
    valorMensalNovo,
    situacao,
    rotulo,
    atrasado: diferenca < 0,
  };
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
