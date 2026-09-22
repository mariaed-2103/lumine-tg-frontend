import React from "react";
import { Calendar, ChevronDown } from "lucide-react";

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
        <div className="relative">
          <select
            id="select-competencia-mes"
            aria-label="Selecionar mês de competência"
            value={mes}
            onChange={(e) => onMesChange(Number(e.target.value))}
            className="appearance-none bg-white text-xs font-bold text-wine pl-3 pr-7 py-1.5 rounded-xl border border-petal/40 hover:border-berry focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry cursor-pointer transition-all shadow-2xs"
          >
            {MESES.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.nome}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-berry absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Dropdown Ano */}
        <div className="relative">
          <select
            id="select-competencia-ano"
            aria-label="Selecionar ano de competência"
            value={ano}
            onChange={(e) => onAnoChange(Number(e.target.value))}
            className="appearance-none bg-white text-xs font-bold text-wine pl-3 pr-7 py-1.5 rounded-xl border border-petal/40 hover:border-berry focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry cursor-pointer transition-all shadow-2xs"
          >
            {ANOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-berry absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
