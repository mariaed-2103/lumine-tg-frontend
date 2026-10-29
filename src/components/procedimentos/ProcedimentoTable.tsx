import React from 'react';
import { Pencil, Trash2, Clock, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Procedimento, InsumoDisponivel } from './types';

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
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div
      id="procedimentos-table-container"
      className="hidden md:block overflow-hidden rounded-2xl border border-petal/40 bg-white"
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-cream border-b border-petal/40 text-xs font-bold text-wine uppercase tracking-wider">
            <th className="py-3.5 px-4 font-display">Procedimento</th>
            <th className="py-3.5 px-4 font-display">Duração</th>
            <th className="py-3.5 px-4 font-display">Preço Padrão</th>
            <th className="py-3.5 px-4 font-display">Ficha Técnica</th>
            <th className="py-3.5 px-4 text-right font-display">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-petal/20 text-sm text-ink">
          {procedimentos.map((proc) => {
            const numInsumos = proc.itensFichaTecnica.length;
            const hasNoInsumos = numInsumos === 0;
            const isExpanded = expandedRow === proc.idProcedimento;
            const formattedPrice = formatCurrency(proc.precoPadrao);

            return (
              <React.Fragment key={proc.idProcedimento}>
                <tr className="hover:bg-cream/60 transition-colors group">
                  {/* Nome do Procedimento */}
                  <td className="py-3.5 px-4 font-bold text-wine">
                    <div className="flex items-center gap-2">
                      <span>{proc.nome}</span>
                      {numInsumos > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(proc.idProcedimento)}
                          className="text-wine/50 hover:text-wine p-1 rounded-full transition-colors cursor-pointer"
                          title={isExpanded ? "Ocultar insumos" : "Ver insumos da ficha técnica"}
                          aria-label={isExpanded ? "Ocultar insumos" : "Ver insumos da ficha técnica"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Duração */}
                  <td className="py-3.5 px-4 font-medium text-ink">
                    <div className="inline-flex items-center gap-1.5 text-xs bg-cream px-2.5 py-1 rounded-full border border-petal/50 text-wine">
                      <Clock className="w-3.5 h-3.5 text-rose" />
                      <span>{proc.duracaoMinutos} min</span>
                    </div>
                  </td>

                  {/* Preço Padrão */}
                  <td className="py-3.5 px-4">
                    {formattedPrice ? (
                      <span className="font-bold text-wine text-sm">
                        {formattedPrice}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cream text-wine/70 border border-petal/40">
                        Preço não definido
                      </span>
                    )}
                  </td>

                  {/* Ficha Técnica (Insumos vinculados) */}
                  <td className="py-3.5 px-4">
                    {hasNoInsumos ? (
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-berry/10 text-berry border border-berry/30"
                        title="Vincule ao menos um insumo para habilitar a simulação de preço"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-berry" />
                        <span>0 insumos vinculados</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleExpand(proc.idProcedimento)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pale text-wine border border-petal hover:bg-petal/40 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-berry" />
                        <span>{numInsumos} {numInsumos === 1 ? 'insumo' : 'insumos'}</span>
                      </button>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        id={`btn-edit-${proc.idProcedimento}`}
                        onClick={() => onEdit(proc)}
                        className="p-1.5 text-wine/70 hover:text-wine hover:bg-pale rounded-full transition-colors cursor-pointer"
                        title="Editar procedimento"
                        aria-label={`Editar ${proc.nome}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        id={`btn-delete-${proc.idProcedimento}`}
                        onClick={() => onDelete(proc)}
                        className="p-1.5 text-berry/70 hover:text-berry hover:bg-pale rounded-full transition-colors cursor-pointer"
                        title="Excluir procedimento"
                        aria-label={`Excluir ${proc.nome}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Sub-row when expanded to view supplies */}
                {isExpanded && numInsumos > 0 && (
                  <tr className="bg-cream/80 border-b border-petal/20">
                    <td colSpan={5} className="py-3 px-6">
                      <div className="text-xs space-y-1.5">
                        <span className="font-bold text-wine uppercase tracking-wider text-[11px] block">
                          Ficha Técnica detalhada:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {proc.itensFichaTecnica.map((item, idx) => {
                            const insInfo = getInsumoInfo(item.idInsumo);
                            return (
                              <div
                                key={item.idFichaTecnica || `${item.idInsumo}-${idx}`}
                                className="bg-white p-2 rounded-xl border border-petal/40 flex items-center justify-between"
                              >
                                <span className="font-medium text-ink truncate pr-2">
                                  {insInfo ? insInfo.nome : `Insumo #${item.idInsumo}`}
                                </span>
                                <span className="font-bold text-wine shrink-0 bg-pale px-2 py-0.5 rounded-full text-[11px]">
                                  {item.quantidadeUtilizada} {insInfo ? insInfo.unidadeMedida : ''}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
