import React from "react";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompetenciaSelectorProps {
  mes: number; // 1 to 12
  ano: number;
  onMesChange: (mes: number) => void;
  onAnoChange: (ano: number) => void;
}

const MESES = [
  { valor: 1, nome: "Janeiro" },
  { valor: 2, nome: "Fevereiro" },
  { valor: 3, nome: "Março" },
  { valor: 4, nome: "Abril" },
  { valor: 5, nome: "Maio" },
  { valor: 6, nome: "Junho" },
  { valor: 7, nome: "Julho" },
  { valor: 8, nome: "Agosto" },
  { valor: 9, nome: "Setembro" },
  { valor: 10, nome: "Outubro" },
  { valor: 11, nome: "Novembro" },
  { valor: 12, nome: "Dezembro" },
];

const ANOS = [2024, 2025, 2026, 2027, 2028];

export const CompetenciaSelector: React.FC<CompetenciaSelectorProps> = ({
  mes,
  ano,
  onMesChange,
  onAnoChange,
}) => {
  return (
    <div
      id="filtro-competencia"
      className="inline-flex items-center gap-2 bg-cream px-3.5 py-2 rounded-2xl border border-petal/50 shadow-xs"
    >
      <div className="flex items-center gap-1.5 text-berry shrink-0">
        <Calendar className="w-4 h-4" />
        <span className="text-xs font-bold text-wine hidden sm:inline font-display">
          Competência:
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Dropdown Mês */}
        <Select value={String(mes)} onValueChange={(value) => onMesChange(Number(value))}>
          <SelectTrigger
            id="select-competencia-mes"
            aria-label="Selecionar mês de competência"
            className="h-9 w-auto rounded-xl border-petal/40 bg-white px-3 text-xs font-bold"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MESES.map((m) => (
              <SelectItem key={m.valor} value={String(m.valor)}>
                {m.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dropdown Ano */}
        <Select value={String(ano)} onValueChange={(value) => onAnoChange(Number(value))}>
          <SelectTrigger
            id="select-competencia-ano"
            aria-label="Selecionar ano de competência"
            className="h-9 w-auto rounded-xl border-petal/40 bg-white px-3 text-xs font-bold"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANOS.map((a) => (
              <SelectItem key={a} value={String(a)}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
