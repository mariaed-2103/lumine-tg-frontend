import React from "react";
import { AlertTriangle, Edit2, Trash2 } from "lucide-react";
import {
  ClockIcon,
  ClipboardIcon,
  ChevronDownIcon,
} from "@/components/icons/lumine";
import { Procedimento, InsumoDisponivel } from "./types";

interface ProcedimentoTableProps {
  procedimentos: Procedimento[];
  insumosDisponiveis: InsumoDisponivel[];
  onEdit: (procedimento: Procedimento) => void;
  onDelete: (procedimento: Procedimento) => void;
}

export const ProcedimentoTable: React.FC<ProcedimentoTableProps> = ({
  procedimentos,
  insumosDisponiveis,
  onEdit,
  onDelete,
}) => {
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const getInsumoInfo = (idInsumo: number) => {
    return insumosDisponiveis.find((ins) => ins.idInsumo === idInsumo);
  };

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return null;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div
      id="procedimentos-table-container"
      className="hidden xl:block w-full bg-transparent"
    >
      <div className="w-full">
        {/* Cabeçalho das colunas */}
        <div
          role="row"
          className="proc-grid px-[calc(var(--proc-pad-x)+1px)] text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B1530]/55"
        >
          <div className="min-w-0 whitespace-nowrap">
            <span className="inline-block pl-10">Procedimento</span>
          </div>
          <div className="min-w-0 whitespace-nowrap">Duração</div>
          <div className="min-w-0 text-right pr-4 whitespace-nowrap">Preço Padrão</div>
          <div className="min-w-0 whitespace-nowrap">Ficha Técnica</div>
          <div className="min-w-0 text-right whitespace-nowrap">Ações</div>
        </div>

        {/* Lista de linhas */}
        <div className="mt-2 flex flex-col gap-3 text-sm text-ink">
          {procedimentos.map((proc) => {
            const numInsumos = proc.itensFichaTecnica.length;
            const hasNoInsumos = numInsumos === 0;
            const isExpanded = expandedRow === proc.idProcedimento;
            const formattedPrice = formatCurrency(proc.precoPadrao);

            return (
              <div
                key={proc.idProcedimento}
                className={`proc-row-card group relative rounded-[20px] border transition-all duration-200 ${
                  isExpanded
                    ? "bg-white/85 border-white/80 glass-border-iridescent shadow-[0_8px_24px_-6px_rgba(107,21,48,0.16)]"
                    : "bg-white/60 border-white/80 hover:bg-white/85 hover:border-[#F5A8BC]/55"
                }`}
              >
                {isExpanded && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-2 top-[18px] h-9 w-1 rounded-full bg-gradient-to-b from-[#C5325A] to-[#E8698A]"
                  />
                )}

                <div className="proc-grid min-h-[72px] px-[var(--proc-pad-x)] py-4">
                  {/* 1. Procedimento */}
                  <div className="flex items-center gap-3 min-w-0">
                    {numInsumos > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(proc.idProcedimento)}
                        aria-expanded={isExpanded}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/50 border border-[rgba(245,168,188,0.4)] text-[#E8698A] transition-colors duration-200 hover:bg-[#FCE1E8] hover:text-[#C5325A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                        title={isExpanded ? "Ocultar insumos" : "Ver insumos da ficha técnica"}
                        aria-label={isExpanded ? "Ocultar insumos" : "Ver insumos da ficha técnica"}
                      >
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform duration-250 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                    <span className="min-w-0 flex-1 text-[15px] font-bold leading-tight text-[#2E0F18] line-clamp-2">
                      {proc.nome}
                    </span>
                  </div>

                  {/* 2. Duração */}
                  <div className="min-w-0">
                    <div className="w-fit h-7 inline-flex items-center gap-1.5 px-3 rounded-full bg-white/60 border border-[rgba(245,168,188,0.45)] text-[12px] font-semibold tabular-nums text-[#6B1530] whitespace-nowrap">
                      <ClockIcon size={14} className="w-3.5 h-3.5 text-[#E8698A]" />
                      <span>{proc.duracaoMinutos} min</span>
                    </div>
                  </div>

                  {/* 3. Preço Padrão */}
                  <div className="min-w-0 text-right pr-4 whitespace-nowrap">
                    {formattedPrice ? (
                      <span className="text-[15px] font-extrabold tabular-nums text-[#6B1530] whitespace-nowrap">
                        {formattedPrice}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cream text-wine/70 border border-petal/40 whitespace-nowrap">
                        Preço não definido
                      </span>
                    )}
                  </div>

                  {/* 4. Ficha Técnica (Insumos vinculados) */}
                  <div className="min-w-0">
                    {hasNoInsumos ? (
                      <div
                        className="w-fit h-7 inline-flex items-center gap-1.5 px-3 rounded-full text-[12px] font-semibold bg-berry/10 text-berry border border-berry/30 whitespace-nowrap"
                        title="Vincule ao menos um insumo para habilitar a simulação de preço"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-berry" />
                        <span>0 insumos vinculados</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleExpand(proc.idProcedimento)}
                        aria-expanded={isExpanded}
                        className="w-fit h-7 inline-flex items-center gap-1.5 px-3 rounded-full bg-[#FCE1E8] border border-[rgba(245,168,188,0.5)] text-[12px] font-bold text-[#6B1530] whitespace-nowrap cursor-pointer relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5] after:pointer-events-none after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-1/2 after:bg-gradient-to-r after:from-[#F5A8BC]/20 after:via-[#FFD9C7]/20 after:to-[#E8698A]/15"
                      >
                        <ClipboardIcon
                          size={14}
                          className="w-3.5 h-3.5 text-[#C5325A] relative z-10"
                        />
                        <span className="relative z-10">
                          {numInsumos} {numInsumos === 1 ? "insumo" : "insumos"}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* 5. Ações */}
                  <div className="min-w-0 flex items-center justify-end gap-2 opacity-100 lg:opacity-70 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      id={`btn-edit-${proc.idProcedimento}`}
                      onClick={() => onEdit(proc)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/50 border border-white/80 ring-1 ring-[#F5A8BC]/35 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#6B1530]/75 transition-all hover:bg-[#FCE1E8] hover:text-[#C5325A] hover:ring-[#F5A8BC]/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                      title="Editar procedimento"
                      aria-label={`Editar ${proc.nome}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      id={`btn-delete-${proc.idProcedimento}`}
                      onClick={() => onDelete(proc)}
                      className="proc-delete-btn inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/50 border border-white/80 ring-1 ring-[#F5A8BC]/35 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#C5325A]/75 transition-all hover:bg-[rgba(197,50,90,0.12)] hover:text-[#C5325A] hover:ring-[#C5325A]/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                      title="Excluir procedimento"
                      aria-label={`Excluir ${proc.nome}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Painel expandido ("FICHA TÉCNICA DETALHADA:") dentro do cartão da linha */}
                {isExpanded && numInsumos > 0 && (
                  <>
                    <div
                      aria-hidden="true"
                      className="mx-[var(--proc-pad-x)] h-px bg-[linear-gradient(90deg,transparent,rgba(245,168,188,0.6),transparent)]"
                    />
                    <div className="procedure-expand-panel mx-4 mb-4 mt-3 rounded-2xl bg-[#FCE1E8]/40 border border-white/70 p-4">
                      <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B1530]/70">
                        Ficha Técnica detalhada:
                      </span>
                      <div className="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
                        {proc.itensFichaTecnica.map((item, idx) => {
                          const insInfo = getInsumoInfo(item.idInsumo);
                          return (
                            <div
                              key={item.idFichaTecnica || `${item.idInsumo}-${idx}`}
                              className="h-11 flex items-center gap-3 px-4 rounded-full bg-white/70 border border-[rgba(245,168,188,0.35)] min-w-0"
                            >
                              <span
                                aria-hidden="true"
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8698A]"
                              />
                              <span className="flex-1 truncate text-[13px] font-semibold text-[#2E0F18]">
                                {insInfo ? insInfo.nome : `Insumo #${item.idInsumo}`}
                              </span>
                              <span className="shrink-0 h-6 inline-flex items-center px-2.5 rounded-full bg-[#FCE1E8] text-[12px] font-bold tabular-nums text-[#6B1530]">
                                {item.quantidadeUtilizada} {insInfo ? insInfo.unidadeMedida : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
