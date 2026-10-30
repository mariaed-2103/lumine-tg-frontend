import React, { useEffect, useState } from "react";
import { AlertCircle, ChevronDown, Loader2, X } from "lucide-react";

import {
  hojeISO,
  type Atendimento,
  type AtendimentoFormData,
  type AtendimentoFormErrors,
  type AtendimentoInput,
  type FormaPagamentoOpcao,
  type ProcedimentoOpcao,
} from "./types";

interface AtendimentoFormModalProps {
  isOpen: boolean;
  editingAtendimento: Atendimento | null;
  procedimentos: ProcedimentoOpcao[];
  formasPagamento: FormaPagamentoOpcao[];
  onSave: (dados: AtendimentoInput) => Promise<void> | void;
  onClose: () => void;
}

const FORM_VAZIO = (): AtendimentoFormData => ({
  dataAtendimento: hojeISO(),
  nomeCliente: "",
  idProcedimento: "",
  valorCobrado: "",
  idFormaPagamento: "",
  tempoAdicional: "",
  desperdicioMateriais: "",
});

const inputBase =
  "w-full bg-white border rounded-full text-sm text-ink placeholder-petal transition-all outline-none disabled:opacity-60";
const inputOk = "border-petal focus:border-rose focus:ring-2 focus:ring-rose/20";
const inputErro = "border-berry ring-2 ring-berry/20 bg-rose-50/20";

const labelClass = "block text-xs font-bold text-wine mb-1.5 ml-1";

const FieldError: React.FC<{ message?: string | undefined }> = ({ message }) =>
  message ? (
    <p className="mt-1 ml-2 flex animate-in items-center gap-1 text-xs font-semibold text-berry fade-in">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  ) : null;

export const AtendimentoFormModal: React.FC<AtendimentoFormModalProps> = ({
  isOpen,
  editingAtendimento,
  procedimentos,
  formasPagamento,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<AtendimentoFormData>(FORM_VAZIO);
  const [errors, setErrors] = useState<AtendimentoFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preenche (edição) ou reinicia (novo) o formulário ao abrir
  useEffect(() => {
    if (!isOpen) return;

    if (editingAtendimento) {
      setFormData({
        dataAtendimento: editingAtendimento.dataAtendimento,
        nomeCliente: editingAtendimento.nomeCliente,
        idProcedimento: String(editingAtendimento.idProcedimento),
        valorCobrado: String(editingAtendimento.valorCobrado),
        idFormaPagamento: String(editingAtendimento.idFormaPagamento),
        tempoAdicional:
          editingAtendimento.tempoAdicional > 0 ? String(editingAtendimento.tempoAdicional) : "",
        desperdicioMateriais:
          editingAtendimento.desperdicioMateriais > 0
            ? String(editingAtendimento.desperdicioMateriais)
            : "",
      });
    } else {
      setFormData(FORM_VAZIO());
    }
    setErrors({});
    setIsSubmitting(false);
  }, [isOpen, editingAtendimento]);

  // Fecha com Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const clearError = (name: keyof AtendimentoFormData) => {
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name as keyof AtendimentoFormData);
  };

  // Ao escolher o procedimento, preenche o valor com o preço padrão (editável depois)
  const handleProcedimentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const procedimento = procedimentos.find((p) => String(p.idProcedimento) === value);

    setFormData((prev) => ({
      ...prev,
      idProcedimento: value,
      valorCobrado:
        procedimento && procedimento.precoPadrao !== null && procedimento.precoPadrao !== undefined
          ? String(procedimento.precoPadrao)
          : prev.valorCobrado,
    }));
    clearError("idProcedimento");
    if (procedimento?.precoPadrao != null) clearError("valorCobrado");
  };

  const validate = (): boolean => {
    const novos: AtendimentoFormErrors = {};

    if (!formData.dataAtendimento) {
      novos.dataAtendimento = "Informe a data do atendimento";
    }

    if (!formData.nomeCliente.trim()) {
      novos.nomeCliente = "Nome da cliente é obrigatório";
    }

    if (!formData.idProcedimento) {
      novos.idProcedimento = "Selecione um procedimento";
    }

    if (formData.valorCobrado.trim() === "") {
      novos.valorCobrado = "Informe o valor cobrado";
    } else {
      const valor = Number(formData.valorCobrado.replace(",", "."));
      if (isNaN(valor) || valor < 0) {
        novos.valorCobrado = "O valor cobrado deve ser maior ou igual a zero";
      }
    }

    if (!formData.idFormaPagamento) {
      novos.idFormaPagamento = "Selecione uma forma de pagamento";
    }

    if (formData.tempoAdicional.trim() !== "") {
      const tempo = Number(formData.tempoAdicional);
      if (isNaN(tempo) || tempo < 0 || !Number.isInteger(tempo)) {
        novos.tempoAdicional = "Informe um número inteiro de minutos maior ou igual a zero";
      }
    }

    if (formData.desperdicioMateriais.trim() !== "") {
      const desperdicio = Number(formData.desperdicioMateriais.replace(",", "."));
      if (isNaN(desperdicio) || desperdicio < 0) {
        novos.desperdicioMateriais = "Informe um valor maior ou igual a zero";
      }
    }

    setErrors(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);

    try {
      await onSave({
        dataAtendimento: formData.dataAtendimento,
        nomeCliente: formData.nomeCliente.trim(),
        idProcedimento: Number(formData.idProcedimento),
        valorCobrado: Number(formData.valorCobrado.replace(",", ".")),
        idFormaPagamento: Number(formData.idFormaPagamento),
        tempoAdicional:
          formData.tempoAdicional.trim() === "" ? 0 : parseInt(formData.tempoAdicional, 10),
        desperdicioMateriais:
          formData.desperdicioMateriais.trim() === ""
            ? 0
            : Number(formData.desperdicioMateriais.replace(",", ".")),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdicao = editingAtendimento !== null;

  // Se o procedimento/forma do atendimento em edição não estiver mais na lista,
  // mantém uma opção com o nome salvo para o select não ficar em branco.
  const procedimentoOrfao =
    isEdicao &&
    !procedimentos.some((p) => String(p.idProcedimento) === formData.idProcedimento) &&
    formData.idProcedimento === String(editingAtendimento.idProcedimento);
  const formaOrfa =
    isEdicao &&
    !formasPagamento.some((f) => String(f.idFormaPagamento) === formData.idFormaPagamento) &&
    formData.idFormaPagamento === String(editingAtendimento.idFormaPagamento);

  return (
    <div
      id="modal-atendimento-backdrop"
      className="fixed inset-0 z-50 flex animate-in items-center justify-center overflow-y-auto bg-ink/50 p-3 backdrop-blur-xs duration-200 fade-in sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        id="modal-atendimento-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-atendimento-title"
        className="relative my-auto flex max-h-[90vh] w-full max-w-2xl animate-in flex-col rounded-[32px] border border-petal/40 bg-white p-6 shadow-2xl duration-200 zoom-in-95 sm:p-8"
      >
        {/* Cabeçalho */}
        <div className="flex shrink-0 items-start justify-between border-b border-petal/20 pb-4">
          <div>
            <h3
              id="modal-atendimento-title"
              className="font-display text-2xl font-bold tracking-tight text-wine"
            >
              {isEdicao ? "Editar Atendimento" : "Novo Atendimento"}
            </h3>
            <p className="mt-1 text-xs font-medium text-wine/70 sm:text-sm">
              Informe os dados do atendimento realizado com a cliente.
            </p>
          </div>

          <button
            type="button"
            id="btn-close-modal-atendimento"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-full p-1.5 text-wine/60 transition-colors hover:bg-pale hover:text-wine disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 space-y-6 overflow-y-auto py-5 pr-1"
        >
          <div className="space-y-4">
            {/* Data + Cliente */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
              <div>
                <label htmlFor="dataAtendimento" className={labelClass}>
                  Data do Atendimento <span className="text-berry">*</span>
                </label>
                <input
                  type="date"
                  id="dataAtendimento"
                  name="dataAtendimento"
                  value={formData.dataAtendimento}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`${inputBase} px-4 py-2.5 ${errors.dataAtendimento ? inputErro : inputOk}`}
                />
                <FieldError message={errors.dataAtendimento} />
              </div>

              <div>
                <label htmlFor="nomeCliente" className={labelClass}>
                  Nome da Cliente <span className="text-berry">*</span>
                </label>
                <input
                  type="text"
                  id="nomeCliente"
                  name="nomeCliente"
                  maxLength={160}
                  placeholder="Nome completo da cliente"
                  value={formData.nomeCliente}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`${inputBase} px-4 py-2.5 ${errors.nomeCliente ? inputErro : inputOk}`}
                />
                <FieldError message={errors.nomeCliente} />
              </div>
            </div>

            {/* Procedimento */}
            <div>
              <label htmlFor="idProcedimento" className={labelClass}>
                Procedimento <span className="text-berry">*</span>
              </label>
              <div className="relative">
                <select
                  id="idProcedimento"
                  name="idProcedimento"
                  value={formData.idProcedimento}
                  onChange={handleProcedimentoChange}
                  disabled={isSubmitting}
                  className={`${inputBase} cursor-pointer appearance-none py-2.5 pl-4 pr-10 ${
                    errors.idProcedimento ? inputErro : inputOk
                  }`}
                >
                  <option value="">
                    {procedimentos.length === 0 && !procedimentoOrfao
                      ? "Nenhum procedimento disponível"
                      : "Selecione um procedimento..."}
                  </option>
                  {procedimentoOrfao && editingAtendimento && (
                    <option value={editingAtendimento.idProcedimento}>
                      {editingAtendimento.nomeProcedimento}
                    </option>
                  )}
                  {procedimentos.map((p) => (
                    <option key={p.idProcedimento} value={p.idProcedimento}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-berry" />
              </div>
              <FieldError message={errors.idProcedimento} />
            </div>

            {/* Valor + Forma de pagamento */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="valorCobrado" className={labelClass}>
                  Valor Cobrado <span className="text-berry">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-bold text-wine/70">
                    R$
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    id="valorCobrado"
                    name="valorCobrado"
                    placeholder="0,00"
                    value={formData.valorCobrado}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`${inputBase} py-2.5 pl-11 pr-4 ${errors.valorCobrado ? inputErro : inputOk}`}
                  />
                </div>
                <FieldError message={errors.valorCobrado} />
              </div>

              <div>
                <label htmlFor="idFormaPagamento" className={labelClass}>
                  Forma de Pagamento <span className="text-berry">*</span>
                </label>
                <div className="relative">
                  <select
                    id="idFormaPagamento"
                    name="idFormaPagamento"
                    value={formData.idFormaPagamento}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`${inputBase} cursor-pointer appearance-none py-2.5 pl-4 pr-10 ${
                      errors.idFormaPagamento ? inputErro : inputOk
                    }`}
                  >
                    <option value="">
                      {formasPagamento.length === 0 && !formaOrfa
                        ? "Nenhuma forma disponível"
                        : "Selecione..."}
                    </option>
                    {formaOrfa && editingAtendimento && (
                      <option value={editingAtendimento.idFormaPagamento}>
                        {editingAtendimento.nomeFormaPagamento}
                      </option>
                    )}
                    {formasPagamento.map((f) => (
                      <option key={f.idFormaPagamento} value={f.idFormaPagamento}>
                        {f.nome}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-berry" />
                </div>
                <FieldError message={errors.idFormaPagamento} />
              </div>
            </div>
          </div>

          {/* Imprevistos */}
          <div className="space-y-4 border-t border-petal/30 pt-5">
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-wine/70">
                Imprevistos{" "}
                <span className="text-xs font-normal normal-case tracking-normal text-wine/60">
                  (opcional)
                </span>
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tempoAdicional" className={labelClass}>
                  Tempo adicional
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="tempoAdicional"
                    name="tempoAdicional"
                    placeholder="0"
                    value={formData.tempoAdicional}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`${inputBase} py-2.5 pl-4 pr-12 ${errors.tempoAdicional ? inputErro : inputOk}`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-wine/70">
                    min
                  </span>
                </div>
                <FieldError message={errors.tempoAdicional} />
              </div>

              <div>
                <label htmlFor="desperdicioMateriais" className={labelClass}>
                  Desperdício de materiais
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-bold text-wine/70">
                    R$
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    id="desperdicioMateriais"
                    name="desperdicioMateriais"
                    placeholder="0,00"
                    value={formData.desperdicioMateriais}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`${inputBase} py-2.5 pl-11 pr-4 ${
                      errors.desperdicioMateriais ? inputErro : inputOk
                    }`}
                  />
                </div>
                <FieldError message={errors.desperdicioMateriais} />
              </div>
            </div>

            <p className="ml-2 text-[11px] leading-tight text-wine/70">
              Imprevistos são opcionais e afetam o cálculo do prejuízo financeiro.
            </p>
          </div>

          {/* Botões */}
          <div className="flex shrink-0 items-center justify-center gap-3 border-t border-petal/30 pt-6">
            <button
              type="button"
              id="btn-cancel-atendimento-form"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-full border border-petal px-6 py-2.5 text-sm font-bold text-wine transition-all hover:bg-pale disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-save-atendimento"
              disabled={isSubmitting}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-berry px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-berry/20 transition-all hover:bg-wine active:scale-[0.98] disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{isEdicao ? "Atualizar Atendimento" : "Salvar Atendimento"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
