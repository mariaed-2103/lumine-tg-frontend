import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import {
  Procedimento,
  InsumoDisponivel,
  ProcedimentoFormData,
  ProcedimentoFormErrors,
  FichaTecnicaFormRow,
} from './types';

interface ProcedimentoFormModalProps {
  isOpen: boolean;
  editingProcedimento: Procedimento | null;
  insumosDisponiveis: InsumoDisponivel[];
  onSave: (procedimentoData: Omit<Procedimento, 'idProcedimento'>) => void;
  onClose: () => void;
  onNavigateToInsumos?: () => void;
}

export const ProcedimentoFormModal: React.FC<ProcedimentoFormModalProps> = ({
  isOpen,
  editingProcedimento,
  insumosDisponiveis,
  onSave,
  onClose,
  onNavigateToInsumos,
}) => {
  const [formData, setFormData] = useState<ProcedimentoFormData>({
    nome: '',
    duracaoMinutos: '',
    precoPadrao: '',
    itensFichaTecnica: [],
  });

  const [errors, setErrors] = useState<ProcedimentoFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingProcedimento) {
        setFormData({
          nome: editingProcedimento.nome,
          duracaoMinutos: editingProcedimento.duracaoMinutos.toString(),
          precoPadrao:
            editingProcedimento.precoPadrao !== null && editingProcedimento.precoPadrao !== undefined
              ? editingProcedimento.precoPadrao.toString()
              : '',
          itensFichaTecnica: editingProcedimento.itensFichaTecnica.map((item, idx) => ({
            idTemp: item.idFichaTecnica ? String(item.idFichaTecnica) : `temp-${idx}-${Date.now()}`,
            idInsumo: String(item.idInsumo),
            quantidadeUtilizada: item.quantidadeUtilizada.toString(),
          })),
        });
      } else {
        setFormData({
          nome: '',
          duracaoMinutos: '',
          precoPadrao: '',
          itensFichaTecnica: [],
        });
      }
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    }
  }, [isOpen, editingProcedimento]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof ProcedimentoFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Ficha técnica row operations
  const handleAddFichaRow = () => {
    const newRow: FichaTecnicaFormRow = {
      idTemp: `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      idInsumo: '',
      quantidadeUtilizada: '',
    };
    setFormData((prev) => ({
      ...prev,
      itensFichaTecnica: [...prev.itensFichaTecnica, newRow],
    }));
  };

  const handleRemoveFichaRow = (idTemp: string) => {
    setFormData((prev) => ({
      ...prev,
      itensFichaTecnica: prev.itensFichaTecnica.filter((row) => row.idTemp !== idTemp),
    }));

    if (errors.itensFichaTecnica && errors.itensFichaTecnica[idTemp]) {
      const updatedRowErrors = { ...errors.itensFichaTecnica };
      delete updatedRowErrors[idTemp];
      setErrors((prev) => ({ ...prev, itensFichaTecnica: updatedRowErrors }));
    }
  };

  const handleFichaRowChange = (
    idTemp: string,
    field: 'idInsumo' | 'quantidadeUtilizada',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      itensFichaTecnica: prev.itensFichaTecnica.map((row) =>
        row.idTemp === idTemp ? { ...row, [field]: value } : row
      ),
    }));

    if (errors.itensFichaTecnica && errors.itensFichaTecnica[idTemp]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        itensFichaTecnica: {
          ...prev.itensFichaTecnica,
          [idTemp]: {
            ...prev.itensFichaTecnica?.[idTemp],
            [field]: undefined,
          },
        },
      }));
    }
  };

  // Helper to find selected supply for a row to display unit suffix
  const getSelectedInsumo = (idInsumo: string): InsumoDisponivel | undefined => {
    return insumosDisponiveis.find((ins) => String(ins.idInsumo) === idInsumo);
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: ProcedimentoFormErrors = {};
    const rowErrors: Record<string, { idInsumo?: string; quantidadeUtilizada?: string }> = {};

    // 1. Nome validation
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length > 160) {
      newErrors.nome = 'O nome deve ter no máximo 160 caracteres';
    }

    // 2. Duração validation (RN005: > 0)
    const duracaoNum = Number(formData.duracaoMinutos);
    if (!formData.duracaoMinutos.trim()) {
      newErrors.duracaoMinutos = 'A duração é obrigatória';
    } else if (isNaN(duracaoNum) || duracaoNum <= 0) {
      newErrors.duracaoMinutos = 'A duração deve ser maior que zero minutos';
    } else if (!Number.isInteger(duracaoNum)) {
      newErrors.duracaoMinutos = 'A duração deve ser um número inteiro de minutos';
    }

    // 3. Preço padrão validation (opcional, but if filled must be >= 0)
    if (formData.precoPadrao.trim()) {
      const precoNum = Number(formData.precoPadrao.replace(',', '.'));
      if (isNaN(precoNum) || precoNum < 0) {
        newErrors.precoPadrao = 'Informe um preço válido maior ou igual a zero';
      }
    }

    // 4. Ficha técnica rows validation
    formData.itensFichaTecnica.forEach((row) => {
      const currentErrors: { idInsumo?: string; quantidadeUtilizada?: string } = {};

      if (!row.idInsumo) {
        currentErrors.idInsumo = 'Selecione um insumo';
      }

      const qtdNum = Number(row.quantidadeUtilizada.replace(',', '.'));
      if (!row.quantidadeUtilizada.trim() || isNaN(qtdNum) || qtdNum <= 0) {
        currentErrors.quantidadeUtilizada = 'Informe uma quantidade maior que zero';
      }

      if (Object.keys(currentErrors).length > 0) {
        rowErrors[row.idTemp] = currentErrors;
      }
    });

    if (Object.keys(rowErrors).length > 0) {
      newErrors.itensFichaTecnica = rowErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      nome: true,
      duracaoMinutos: true,
      precoPadrao: true,
    });

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const precoNum =
        formData.precoPadrao.trim() === ''
          ? null
          : Number(formData.precoPadrao.replace(',', '.'));

      const cleanItens = formData.itensFichaTecnica.map((row) => ({
        idInsumo: Number(row.idInsumo),
        quantidadeUtilizada: Number(row.quantidadeUtilizada.replace(',', '.')),
      }));

      onSave({
        nome: formData.nome.trim(),
        duracaoMinutos: parseInt(formData.duracaoMinutos, 10),
        precoPadrao: precoNum,
        itensFichaTecnica: cleanItens,
      });

      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div
      id="modal-procedimento-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        id="modal-procedimento-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-procedimento-title"
        className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-6 sm:p-8 border border-petal/40 my-auto relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-petal/20 shrink-0">
          <div>
            <h3
              id="modal-procedimento-title"
              className="font-display text-2xl font-bold text-wine tracking-tight"
            >
              {editingProcedimento ? 'Editar procedimento' : 'Novo procedimento'}
            </h3>
            <p className="text-xs sm:text-sm text-wine/70 mt-1 font-medium">
              Preencha os dados do procedimento e monte a ficha técnica de insumos utilizados.
            </p>
          </div>

          <button
            type="button"
            id="btn-close-modal-procedimento"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-wine/60 hover:text-wine hover:bg-pale rounded-full transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-5 pr-1 space-y-6 flex-1">
          
          {/* SEÇÃO 1: Dados do Procedimento */}
          <div className="space-y-4">
            <span className="font-display text-base font-bold text-wine block">
              1. Informações do Procedimento
            </span>

            {/* Campo Nome */}
            <div>
              <label
                htmlFor="nome"
                className="block text-xs font-bold text-wine mb-1.5 ml-1"
              >
                Nome do procedimento <span className="text-berry">*</span>
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                maxLength={160}
                placeholder="Ex: Limpeza de Pele Profunda"
                value={formData.nome}
                onChange={handleFieldChange}
                onBlur={() => handleBlur('nome')}
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 bg-white border rounded-full text-sm text-ink placeholder-petal transition-all outline-none ${
                  errors.nome && touched.nome
                    ? 'border-berry ring-2 ring-berry/20 bg-rose-50/20'
                    : 'border-petal focus:border-rose focus:ring-2 focus:ring-rose/20'
                }`}
              />
              {errors.nome && touched.nome && (
                <p className="flex items-center gap-1 text-xs text-berry font-semibold mt-1 ml-2 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.nome}</span>
                </p>
              )}
            </div>

            {/* Duração & Preço Padrão (2 Colunas) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Campo Duração (minutos) */}
              <div>
                <label
                  htmlFor="duracaoMinutos"
                  className="block text-xs font-bold text-wine mb-1.5 ml-1"
                >
                  Duração (minutos) <span className="text-berry">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    id="duracaoMinutos"
                    name="duracaoMinutos"
                    placeholder="Ex: 60"
                    value={formData.duracaoMinutos}
                    onChange={handleFieldChange}
                    onBlur={() => handleBlur('duracaoMinutos')}
                    disabled={isSubmitting}
                    className={`w-full pl-4 pr-12 py-2.5 bg-white border rounded-full text-sm text-ink placeholder-petal transition-all outline-none ${
                      errors.duracaoMinutos && touched.duracaoMinutos
                        ? 'border-berry ring-2 ring-berry/20 bg-rose-50/20'
                        : 'border-petal focus:border-rose focus:ring-2 focus:ring-rose/20'
                    }`}
                  />
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-wine/70 pointer-events-none">
                    min
                  </span>
                </div>
                {errors.duracaoMinutos && touched.duracaoMinutos && (
                  <p className="flex items-center gap-1 text-xs text-berry font-semibold mt-1 ml-2 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.duracaoMinutos}</span>
                  </p>
                )}
              </div>

              {/* Campo Preço padrão */}
              <div>
                <label
                  htmlFor="precoPadrao"
                  className="block text-xs font-bold text-wine mb-1.5 ml-1"
                >
                  Preço padrão <span className="text-xs font-normal text-wine/60">(opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-bold text-wine/70 pointer-events-none">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="precoPadrao"
                    name="precoPadrao"
                    placeholder="0,00"
                    value={formData.precoPadrao}
                    onChange={handleFieldChange}
                    onBlur={() => handleBlur('precoPadrao')}
                    disabled={isSubmitting}
                    className={`w-full pl-11 pr-4 py-2.5 bg-white border rounded-full text-sm text-ink placeholder-petal transition-all outline-none ${
                      errors.precoPadrao && touched.precoPadrao
                        ? 'border-berry ring-2 ring-berry/20 bg-rose-50/20'
                        : 'border-petal focus:border-rose focus:ring-2 focus:ring-rose/20'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-wine/70 mt-1 ml-2 leading-tight">
                  Você também poderá definir esse valor automaticamente pelo simulador de preços (em breve)
                </p>
                {errors.precoPadrao && touched.precoPadrao && (
                  <p className="flex items-center gap-1 text-xs text-berry font-semibold mt-1 ml-2 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.precoPadrao}</span>
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* SEÇÃO 2: Ficha Técnica (insumos utilizados) */}
          <div className="pt-5 border-t border-petal/30 space-y-4">
            <div>
              <h4 className="font-display font-bold text-base text-wine">
                Insumos utilizados
              </h4>
              <p className="text-xs text-wine/70 mt-0.5 font-medium">
                Selecione os insumos consumidos neste procedimento e a quantidade usada em cada atendimento.
              </p>
            </div>

            {/* Insumos vazios no sistema */}
            {insumosDisponiveis.length === 0 ? (
              <div className="p-4 rounded-2xl bg-cream border border-petal space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-wine font-medium leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-berry shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-wine mb-0.5">
                      Você ainda não tem insumos cadastrados.
                    </span>
                    <span>
                      Cadastre insumos na tela de Insumos antes de montar a ficha técnica. Você ainda pode salvar o procedimento e vincular os insumos mais tarde.
                    </span>
                  </div>
                </div>

                {onNavigateToInsumos && (
                  <div className="pt-2 border-t border-petal/30 flex justify-end">
                    <button
                      type="button"
                      id="btn-navigate-to-insumos-modal"
                      onClick={onNavigateToInsumos}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-berry hover:text-wine bg-white px-3.5 py-1.5 rounded-full border border-petal hover:bg-pale transition-colors cursor-pointer"
                    >
                      <span>Ir para cadastro de Insumos</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Dynamic list of supplies */
              <div className="space-y-3">
                {formData.itensFichaTecnica.length === 0 ? (
                  <div className="py-5 px-4 rounded-2xl bg-cream border border-dashed border-petal text-center">
                    <p className="text-xs text-wine/70 font-medium">
                      Nenhum insumo adicionado ainda
                    </p>
                    <p className="text-[11px] text-berry mt-1 font-semibold">
                      (Atenção: RN006 exige ao menos 1 insumo vinculado para simulação de preço)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {formData.itensFichaTecnica.map((row, index) => {
                      const selectedInsumo = getSelectedInsumo(row.idInsumo);
                      const rowError = errors.itensFichaTecnica?.[row.idTemp];

                      return (
                        <div
                          key={row.idTemp}
                          className="p-3 bg-cream rounded-2xl border border-petal/60 space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                            
                            {/* Select de Insumo */}
                            <div className="flex-1">
                              <label
                                htmlFor={`select-insumo-${row.idTemp}`}
                                className="block text-[11px] font-bold text-wine mb-1 ml-1 sm:hidden"
                              >
                                Insumo #{index + 1}
                              </label>
                              <select
                                id={`select-insumo-${row.idTemp}`}
                                value={row.idInsumo}
                                onChange={(e) =>
                                  handleFichaRowChange(row.idTemp, 'idInsumo', e.target.value)
                                }
                                disabled={isSubmitting}
                                className={`w-full px-3.5 py-2 bg-white border rounded-full text-xs text-ink font-medium outline-none transition-all cursor-pointer ${
                                  rowError?.idInsumo
                                    ? 'border-berry ring-1 ring-berry/30'
                                    : 'border-petal focus:border-rose'
                                }`}
                              >
                                <option value="">Selecione um insumo...</option>
                                {insumosDisponiveis.map((ins) => (
                                  <option key={ins.idInsumo} value={ins.idInsumo}>
                                    {ins.nome} ({ins.unidadeMedida})
                                  </option>
                                ))}
                              </select>
                              {rowError?.idInsumo && (
                                <span className="text-[11px] text-berry font-semibold ml-2 block mt-0.5">
                                  {rowError.idInsumo}
                                </span>
                              )}
                            </div>

                            {/* Campo Quantidade Utilizada */}
                            <div className="w-full sm:w-44 shrink-0">
                              <div className="relative">
                                <input
                                  type="number"
                                  step="any"
                                  min="0.001"
                                  id={`input-qtd-${row.idTemp}`}
                                  placeholder="Qtd usada"
                                  value={row.quantidadeUtilizada}
                                  onChange={(e) =>
                                    handleFichaRowChange(
                                      row.idTemp,
                                      'quantidadeUtilizada',
                                      e.target.value
                                    )
                                  }
                                  disabled={isSubmitting}
                                  className={`w-full pl-3.5 pr-14 py-2 bg-white border rounded-full text-xs text-ink placeholder-petal outline-none transition-all ${
                                    rowError?.quantidadeUtilizada
                                      ? 'border-berry ring-1 ring-berry/30'
                                      : 'border-petal focus:border-rose'
                                  }`}
                                />
                                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-wine/70 pointer-events-none">
                                  {selectedInsumo ? selectedInsumo.unidadeMedida : 'un'}
                                </span>
                              </div>
                              {rowError?.quantidadeUtilizada && (
                                <span className="text-[11px] text-berry font-semibold ml-2 block mt-0.5">
                                  {rowError.quantidadeUtilizada}
                                </span>
                              )}
                            </div>

                            {/* Botão Remover Linha */}
                            <div className="flex justify-end sm:justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveFichaRow(row.idTemp)}
                                disabled={isSubmitting}
                                className="p-2 text-wine/60 hover:text-berry hover:bg-white rounded-full transition-colors cursor-pointer"
                                title="Remover insumo"
                                aria-label={`Remover insumo linha ${index + 1}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Botão de texto + Adicionar insumo */}
                <div>
                  <button
                    type="button"
                    id="btn-add-insumo-row"
                    onClick={handleAddFichaRow}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-berry hover:text-wine hover:bg-pale px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar insumo</span>
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Rodapé do Formulário: Cancelar & Salvar Procedimento */}
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-petal/30 shrink-0">
            <button
              type="button"
              id="btn-cancel-procedimento-form"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-petal text-wine hover:bg-pale rounded-full font-bold text-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-save-procedimento"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-berry hover:bg-wine text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-berry/20 disabled:opacity-75 cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar procedimento</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
