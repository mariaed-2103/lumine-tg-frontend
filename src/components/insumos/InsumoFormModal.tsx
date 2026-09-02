import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Insumo, InsumoFormData, InsumoFormErrors, UnidadeMedida } from './types';

interface InsumoFormModalProps {
  isOpen: boolean;
  editingInsumo: Insumo | null;
  onSave: (insumoData: Omit<Insumo, 'idInsumo'>) => void;
  onClose: () => void;
}

const UNIDADE_OPTIONS: { value: UnidadeMedida; label: string }[] = [
  { value: 'mL', label: 'mL' },
  { value: 'g', label: 'g' },
  { value: 'unidade', label: 'unidade' },
];

export const InsumoFormModal: React.FC<InsumoFormModalProps> = ({
  isOpen,
  editingInsumo,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<InsumoFormData>({
    nome: '',
    unidadeMedida: 'mL',
    quantidadePorEmbalagem: '',
    estoqueAtual: '',
    estoqueMinimo: '',
  });

  const [errors, setErrors] = useState<InsumoFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset or populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingInsumo) {
        setFormData({
          nome: editingInsumo.nome,
          unidadeMedida: editingInsumo.unidadeMedida,
          quantidadePorEmbalagem: editingInsumo.quantidadePorEmbalagem,
          estoqueAtual: editingInsumo.estoqueAtual,
          estoqueMinimo: editingInsumo.estoqueMinimo,
        });
      } else {
        setFormData({
          nome: '',
          unidadeMedida: 'mL',
          quantidadePorEmbalagem: '',
          estoqueAtual: '',
          estoqueMinimo: '',
        });
      }
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setIsUnitDropdownOpen(false);
    }
  }, [isOpen, editingInsumo]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUnitDropdownOpen(false);
      }
    };
    if (isUnitDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUnitDropdownOpen]);

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

  const validate = (): boolean => {
    const newErrors: InsumoFormErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome do insumo é obrigatório.';
    } else if (formData.nome.length > 160) {
      newErrors.nome = 'O nome deve ter no máximo 160 caracteres.';
    }

    if (!formData.unidadeMedida) {
      newErrors.unidadeMedida = 'Selecione uma unidade de medida.';
    }

    const qtdEmbalagemNum = Number(formData.quantidadePorEmbalagem);
    if (formData.quantidadePorEmbalagem === '' || isNaN(qtdEmbalagemNum)) {
      newErrors.quantidadePorEmbalagem = 'Informe a quantidade por embalagem.';
    } else if (qtdEmbalagemNum <= 0) {
      newErrors.quantidadePorEmbalagem = 'Informe um valor maior que zero.';
    }

    const estoqueAtualNum = Number(formData.estoqueAtual);
    if (formData.estoqueAtual === '' || isNaN(estoqueAtualNum)) {
      newErrors.estoqueAtual = 'Informe o estoque atual.';
    } else if (estoqueAtualNum < 0) {
      newErrors.estoqueAtual = 'O estoque atual não pode ser negativo.';
    }

    const estoqueMinimoNum = Number(formData.estoqueMinimo);
    if (formData.estoqueMinimo === '' || isNaN(estoqueMinimoNum)) {
      newErrors.estoqueMinimo = 'Informe o estoque mínimo.';
    } else if (estoqueMinimoNum < 0) {
      newErrors.estoqueMinimo = 'O estoque mínimo não pode ser negativo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof InsumoFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleUnitSelect = (unit: UnidadeMedida) => {
    setFormData((prev) => ({ ...prev, unidadeMedida: unit }));
    setIsUnitDropdownOpen(false);
    if (errors.unidadeMedida) {
      setErrors((prev) => ({ ...prev, unidadeMedida: undefined }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      nome: true,
      unidadeMedida: true,
      quantidadePorEmbalagem: true,
      estoqueAtual: true,
      estoqueMinimo: true,
    });

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onSave({
        nome: formData.nome.trim(),
        unidadeMedida: formData.unidadeMedida as UnidadeMedida,
        quantidadePorEmbalagem: Number(formData.quantidadePorEmbalagem),
        estoqueAtual: Number(formData.estoqueAtual),
        estoqueMinimo: Number(formData.estoqueMinimo),
      });
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div
      id="modal-insumo-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        id="modal-insumo-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-insumo-title"
        className="w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl p-6 sm:p-8 border border-petal/40 overflow-visible my-auto relative animate-in zoom-in-95 duration-200"
      >
        {/* Header matching Image 3 & 4 */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3
              id="modal-insumo-title"
              className="font-display text-2xl font-bold text-wine tracking-tight"
            >
              {editingInsumo ? 'Editar insumo' : 'Novo insumo'}
            </h3>
            <p className="text-xs sm:text-sm text-wine/70 mt-1 font-medium">
              Preencha as informações do produto usado nos seus procedimentos.
            </p>
          </div>

          <button
            type="button"
            id="btn-close-modal"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-wine/60 hover:text-wine hover:bg-pale rounded-full transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Nome */}
          <div>
            <label
              htmlFor="nome"
              className="block text-xs font-bold text-wine mb-1.5 ml-1"
            >
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              maxLength={160}
              placeholder="Ex: Esmalte base fortalecedora"
              value={formData.nome}
              onChange={handleChange}
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
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.nome}</span>
              </p>
            )}
          </div>

          {/* 2. Unidade de medida (Custom dropdown matching Image 4) */}
          <div className="relative" ref={dropdownRef}>
            <label
              htmlFor="unidade-select-button"
              className="block text-xs font-bold text-wine mb-1.5 ml-1"
            >
              Unidade de medida
            </label>
            
            <button
              type="button"
              id="unidade-select-button"
              onClick={() => setIsUnitDropdownOpen((prev) => !prev)}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-white border border-petal rounded-full flex items-center justify-between text-sm text-ink font-medium outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 cursor-pointer transition-all"
            >
              <span>{formData.unidadeMedida}</span>
              <ChevronDown
                className={`w-4 h-4 text-wine transition-transform duration-200 ${
                  isUnitDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Options Popup matching Image 4 */}
            {isUnitDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-petal rounded-2xl shadow-xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {UNIDADE_OPTIONS.map((opt) => {
                  const isSelected = formData.unidadeMedida === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleUnitSelect(opt.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-left text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-petal/60 text-wine font-bold'
                          : 'text-ink hover:bg-pale'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-wine" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Quantidade por embalagem */}
          <div>
            <label
              htmlFor="quantidadePorEmbalagem"
              className="block text-xs font-bold text-wine mb-1.5 ml-1"
            >
              Quantidade por embalagem
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.001"
                id="quantidadePorEmbalagem"
                name="quantidadePorEmbalagem"
                placeholder="0,000"
                value={formData.quantidadePorEmbalagem}
                onChange={handleChange}
                onBlur={() => handleBlur('quantidadePorEmbalagem')}
                disabled={isSubmitting}
                className={`w-full pl-4 pr-12 py-2.5 bg-white border rounded-full text-sm text-ink placeholder-petal transition-all outline-none ${
                  errors.quantidadePorEmbalagem && touched.quantidadePorEmbalagem
                    ? 'border-berry ring-2 ring-berry/20 bg-rose-50/20'
                    : 'border-petal focus:border-rose focus:ring-2 focus:ring-rose/20'
                }`}
              />
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-medium text-wine/70 pointer-events-none">
                {formData.unidadeMedida}
              </span>
            </div>
            {errors.quantidadePorEmbalagem && touched.quantidadePorEmbalagem && (
              <p className="flex items-center gap-1 text-xs text-berry font-semibold mt-1 ml-2 animate-in fade-in">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.quantidadePorEmbalagem}</span>
              </p>
            )}
          </div>

          {/* 4. Estoque atual & Estoque mínimo (2 Columns) */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Estoque atual */}
            <div>
              <label
                htmlFor="estoqueAtual"
                className="block text-xs font-bold text-wine mb-1.5 ml-1"
              >
                Estoque atual
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  id="estoqueAtual"
                  name="estoqueAtual"
                  placeholder="0,000"
                  value={formData.estoqueAtual}
                  onChange={handleChange}
                  onBlur={() => handleBlur('estoqueAtual')}
                  disabled={isSubmitting}
                  className={`w-full pl-4 pr-12 py-2.5 bg-white border rounded-full text-sm text-ink placeholder-petal transition-all outline-none ${
                    errors.estoqueAtual && touched.estoqueAtual
                      ? 'border-berry ring-2 ring-berry/20 bg-rose-50/20'
                      : 'border-petal focus:border-rose focus:ring-2 focus:ring-rose/20'
                  }`}
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-medium text-wine/70 pointer-events-none">
                  {formData.unidadeMedida}
                </span>
              </div>
              {errors.estoqueAtual && touched.estoqueAtual && (
                <p className="flex items-center gap-1 text-xs text-berry font-semibold mt-1 ml-2 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.estoqueAtual}</span>
                </p>
              )}
            </div>

            {/* Estoque mínimo */}
            <div>
              <label
                htmlFor="estoqueMinimo"
                className="block text-xs font-bold text-wine mb-1.5 ml-1"
              >
                Estoque mínimo
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  id="estoqueMinimo"
                  name="estoqueMinimo"
                  placeholder="0,000"
                  value={formData.estoqueMinimo}
                  onChange={handleChange}
                  onBlur={() => handleBlur('estoqueMinimo')}
                  disabled={isSubmitting}
                  className={`w-full pl-4 pr-12 py-2.5 bg-white border rounded-full text-sm text-ink placeholder-petal transition-all outline-none ${
                    errors.estoqueMinimo && touched.estoqueMinimo
                      ? 'border-berry ring-2 ring-berry/20 bg-rose-50/20'
                      : 'border-petal focus:border-rose focus:ring-2 focus:ring-rose/20'
                  }`}
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-medium text-wine/70 pointer-events-none">
                  {formData.unidadeMedida}
                </span>
              </div>
              {errors.estoqueMinimo && touched.estoqueMinimo && (
                <p className="flex items-center gap-1 text-xs text-berry font-semibold mt-1 ml-2 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.estoqueMinimo}</span>
                </p>
              )}
            </div>

          </div>

          {/* Modal Actions (Cancelar & Salvar insumo) */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              type="button"
              id="btn-cancel-insumo-form"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-petal text-wine hover:bg-pale rounded-full font-bold text-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-save-insumo"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-berry hover:bg-wine text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-berry/20 disabled:opacity-75 cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar insumo</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
