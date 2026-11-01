import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MESES_BR = [
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

const DIAS_SEMANA_BR = ["D", "S", "T", "Q", "Q", "S", "S"];

export interface LumineDatePickerProps {
  id?: string;
  name?: string;
  value?: string; // Formato YYYY-MM-DD
  onChange?: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
  className?: string;
  clearable?: boolean;
  variant?: "pill" | "rounded";
}

function parseISODate(isoStr?: string): { year: number; month: number; day: number } | null {
  if (!isoStr || typeof isoStr !== "string") return null;
  const parts = isoStr.trim().split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

function toISODate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function formatDisplayBR(isoStr?: string): string {
  const parsed = parseISODate(isoStr);
  if (!parsed) return "";
  const d = String(parsed.day).padStart(2, "0");
  const m = String(parsed.month + 1).padStart(2, "0");
  return `${d}/${m}/${parsed.year}`;
}

function getTodayParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };
}

export function LumineDatePicker({
  id,
  name,
  value = "",
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "DD/MM/AAAA",
  className,
  clearable = true,
  variant = "pill",
}: LumineDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Inicializa o mês e ano visualizados com base no valor atual ou na data de hoje
  const initialParts = useMemo(() => {
    return parseISODate(value) || getTodayParts();
  }, [value]);

  const [viewYear, setViewYear] = useState(initialParts.year);
  const [viewMonth, setViewMonth] = useState(initialParts.month);

  // Sincroniza view quando o modal abre ou o valor muda externamente
  useEffect(() => {
    if (isOpen) {
      const parts = parseISODate(value) || getTodayParts();
      setViewYear(parts.year);
      setViewMonth(parts.month);
    }
  }, [isOpen, value]);

  const selectedParts = useMemo(() => parseISODate(value), [value]);
  const todayParts = useMemo(() => getTodayParts(), []);

  // Cálculos do grid do mês
  const { prevDays, currentDays, nextDays } = useMemo(() => {
    const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const prev: number[] = [];
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      prev.push(daysInPrevMonth - i);
    }

    const current: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      current.push(d);
    }

    const totalCells = prev.length + current.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const next: number[] = [];
    for (let d = 1; d <= remaining; d++) {
      next.push(d);
    }

    return { prevDays: prev, currentDays: current, nextDays: next };
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const newISO = toISODate(viewYear, viewMonth, day);
    onChange?.(newISO);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = getTodayParts();
    setViewYear(today.year);
    setViewMonth(today.month);
    const todayISO = toISODate(today.year, today.month, today.day);
    onChange?.(todayISO);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange?.("");
    setIsOpen(false);
  };

  const baseInputClass =
    variant === "pill"
      ? "h-11 rounded-full px-4 text-sm"
      : "h-10 rounded-xl px-3.5 text-xs";

  const triggerClasses = cn(
    "w-full flex items-center justify-between border bg-white text-ink transition-all cursor-pointer select-none text-left outline-none",
    baseInputClass,
    hasError
      ? "border-berry ring-2 ring-berry/20 bg-rose-50/20"
      : "border-petal hover:border-rose focus:border-rose focus:ring-2 focus:ring-rose/20",
    disabled && "opacity-60 cursor-not-allowed pointer-events-none",
    className,
  );

  return (
    <div className="relative w-full">
      {/* Campo oculto com name e id para compatibilidade nativa de formulários */}
      <input
        type="hidden"
        id={id}
        name={name || id}
        value={value}
        readOnly
      />

      <Popover open={isOpen} onOpenChange={disabled ? undefined : setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id ? `${id}-trigger` : undefined}
            disabled={disabled}
            className={triggerClasses}
            aria-label="Selecionar data"
            aria-expanded={isOpen}
          >
            <span
              className={cn(
                "truncate font-medium",
                value ? "text-ink" : "text-petal",
              )}
            >
              {value ? formatDisplayBR(value) : placeholder}
            </span>
            <CalendarIcon className="h-4 w-4 shrink-0 text-rose" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="z-[70] w-[290px] sm:w-[310px] rounded-[24px] border border-petal/40 bg-white p-4 shadow-[0_12px_36px_-6px_rgba(107,21,48,0.18)] outline-none"
        >
          {/* Cabeçalho do Calendário */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Mês anterior"
              className="flex h-8 w-8 items-center justify-center rounded-full text-wine/70 transition-colors hover:bg-pale/70 hover:text-wine cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-center">
              <span className="font-display text-sm font-bold tracking-tight text-wine sm:text-base">
                {MESES_BR[viewMonth]} {viewYear}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Próximo mês"
              className="flex h-8 w-8 items-center justify-center rounded-full text-wine/70 transition-colors hover:bg-pale/70 hover:text-wine cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
            {DIAS_SEMANA_BR.map((d, index) => (
              <span
                key={index}
                className="text-[11px] font-bold uppercase tracking-wider text-wine/50"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Grade de Dias */}
          <div className="grid grid-cols-7 gap-1">
            {/* Dias do mês anterior */}
            {prevDays.map((d, i) => (
              <div
                key={`prev-${i}`}
                className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center text-xs font-normal text-ink/20 select-none"
              >
                {d}
              </div>
            ))}

            {/* Dias do mês corrente */}
            {currentDays.map((d) => {
              const isSelected =
                selectedParts?.year === viewYear &&
                selectedParts?.month === viewMonth &&
                selectedParts?.day === d;

              const isToday =
                todayParts.year === viewYear &&
                todayParts.month === viewMonth &&
                todayParts.day === d;

              return (
                <button
                  key={`cur-${d}`}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  className={cn(
                    "flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer select-none",
                    isSelected
                      ? "bg-berry font-bold text-white shadow-[0_2px_8px_-2px_rgba(197,50,90,0.5)]"
                      : isToday
                        ? "border border-rose text-berry font-bold bg-pale/40 hover:bg-pale"
                        : "text-ink hover:bg-pale/70 hover:text-wine",
                  )}
                  aria-label={`${d} de ${MESES_BR[viewMonth]} de ${viewYear}`}
                  aria-selected={isSelected}
                >
                  {d}
                </button>
              );
            })}

            {/* Dias do próximo mês */}
            {nextDays.map((d, i) => (
              <div
                key={`next-${i}`}
                className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center text-xs font-normal text-ink/20 select-none"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Rodapé: Ações rápidas */}
          <div className="mt-3 flex items-center justify-between border-t border-petal/30 pt-2.5">
            {clearable && value ? (
              <button
                type="button"
                onClick={handleClear}
                className="cursor-pointer text-xs font-medium text-ink/60 transition-colors hover:text-wine hover:underline"
              >
                Limpar
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={handleSelectToday}
              className="cursor-pointer rounded-full bg-pale/60 px-3 py-1 text-xs font-bold text-berry transition-colors hover:bg-pale hover:text-wine"
            >
              Hoje
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
