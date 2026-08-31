import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatarMes } from "@/lib/format";
import { cn } from "@/lib/utils";

export const ANOS_PERIODO = [2026, 2027, 2028, 2029, 2030];

export const NOMES_MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/** Desloca um mês "AAAA-MM" em `delta` meses, com virada automática de ano. */
export function deslocarMes(mes: string, delta: number): string {
  const ano = Number(mes.slice(0, 4));
  const m = Number(mes.slice(5, 7)) - 1 + delta;
  const d = new Date(ano, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Janela de `quantidade` meses terminando (inclusive) em `mes`. */
export function mesesAte(mes: string, quantidade: number): string[] {
  const lista: string[] = [];
  for (let i = quantidade - 1; i >= 0; i--) lista.push(deslocarMes(mes, -i));
  return lista;
}

/** Garante que o mês inicial caia dentro dos anos disponíveis. */
export function mesInicialValido(mes: string): string {
  const ano = Number(mes.slice(0, 4));
  if (ANOS_PERIODO.includes(ano)) return mes;
  const primeiro = ANOS_PERIODO[0]!;
  const ultimo = ANOS_PERIODO[ANOS_PERIODO.length - 1]!;
  const alvo = ano < primeiro ? primeiro : ultimo;
  return `${alvo}-${mes.slice(5, 7)}`;
}

export function PeriodoSelector({
  mes,
  onChange,
  className,
}: {
  mes: string;
  onChange: (mes: string) => void;
  className?: string;
}) {
  const ano = Number(mes.slice(0, 4));
  const mesNum = mes.slice(5, 7);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Ano:</label>
        <Select
          value={String(ano)}
          onValueChange={(v) => onChange(`${v}-${mesNum}`)}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANOS_PERIODO.map((a) => (
              <SelectItem key={a} value={String(a)}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Mês:</label>
        <Select value={mesNum} onValueChange={(v) => onChange(`${ano}-${v}`)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOMES_MESES.map((nome, i) => (
              <SelectItem key={nome} value={String(i + 1).padStart(2, "0")}>
                {nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={() => onChange(deslocarMes(mes, -1))}
          aria-label={`Mês anterior (${formatarMes(deslocarMes(mes, -1))})`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={() => onChange(deslocarMes(mes, 1))}
          aria-label={`Próximo mês (${formatarMes(deslocarMes(mes, 1))})`}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
