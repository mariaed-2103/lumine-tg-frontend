import React, { useState } from "react";
import {
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Check,
  Percent,
} from "lucide-react";
import {
  CardIcon,
  PaymentMiniIcon,
  PlusIcon,
} from "@/components/icons/lumine";
import type {
  FormaPagamento,
  FormaPagamentoFormData,
  FormaPagamentoFormErrors,
} from "./types";

interface FormasPagamentoTabProps {
  formasPagamento: FormaPagamento[];
  onAddForma: (forma: Omit<FormaPagamento, "idFormaPagamento">) => Promise<void>;
  onUpdateForma: (
    id: number,
    forma: Omit<FormaPagamento, "idFormaPagamento">
  ) => Promise<void>;
  onDeleteRequest: (forma: FormaPagamento) => void;
}

const SUGESTOES_FORMAS = [
  { nome: "Pix", taxa: "0,00" },
  { nome: "Dinheiro", taxa: "0,00" },
  { nome: "Cartão de Débito", taxa: "1,99" },
  { nome: "Cartão de Crédito (À vista)", taxa: "3,49" },
  { nome: "Cartão de Crédito (Parcelado 2x-6x)", taxa: "5,99" },
  { nome: "Link de Pagamento Online", taxa: "4,20" },
  { nome: "Transferência Bancária / TED", taxa: "0,00" },
];

export const FormasPagamentoTab: React.FC<FormasPagamentoTabProps> = ({
  formasPagamento,
  onAddForma,
  onUpdateForma,
  onDeleteRequest,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingForma, setEditingForma] = useState<FormaPagamento | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<FormaPagamentoFormData>({
    nome: "",
    taxaPercentual: "0,00",
  });

  const [errors, setErrors] = useState<FormaPagamentoFormErrors>({});

  const handleOpenCreate = () => {
    setEditingForma(null);
    setFormData({ nome: "", taxaPercentual: "0,00" });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (forma: FormaPagamento) => {
    setEditingForma(forma);
    setFormData({
      nome: forma.nome,
      taxaPercentual: forma.taxaPercentual.toFixed(2).replace(".", ","),
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: FormaPagamentoFormErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "O nome da forma de pagamento é obrigatório";
    }
    const taxa = parseFloat(formData.taxaPercentual.replace(",", "."));
    if (formData.taxaPercentual.trim() === "" || isNaN(taxa) || taxa < 0 || taxa > 100) {
      newErrors.taxaPercentual = "Informe uma taxa percentual válida entre 0% e 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const taxaNumerica = parseFloat(formData.taxaPercentual.replace(",", "."));
      const payload: Omit<FormaPagamento, "idFormaPagamento"> = {
        nome: formData.nome.trim(),
        taxaPercentual: taxaNumerica,
      };

      if (editingForma) {
        await onUpdateForma(editingForma.idFormaPagamento, payload);
      } else {
        await onAddForma(payload);
      }

      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho da aba */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-wine sm:text-lg">
              Formas de Pagamento
            </h3>
            <span className="rounded-full bg-pale px-2.5 py-0.5 text-xs font-bold tabular-nums text-wine">
              {formasPagamento.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-ink/60 sm:text-[13px]">
            Meios aceitos e taxas descontadas automaticamente nos atendimentos
          </p>
        </div>

        <button
          type="button"
          id="btn-nova-forma-pagamento"
          onClick={handleOpenCreate}
          className="group shine inline-flex h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/80 bg-gradient-to-br from-[#D13E66] to-berry px-5 text-sm font-bold text-white shadow-lg shadow-berry/30 transition-all hover:from-wine hover:to-wine active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5] sm:w-auto"
        >
          <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span>Nova Forma de Pagamento</span>
        </button>
      </div>

      {/* Lista */}
      {formasPagamento.length === 0 ? (
        <div
          id="empty-state-formas-pagamento"
          className="mx-auto max-w-lg px-4 py-12 text-center transition-all sm:py-16"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-petal/40 bg-pale shadow-xs">
            <CardIcon className="h-9 w-9 text-rose" size={36} />
          </div>
          <h4 className="mb-2 font-display text-xl font-bold tracking-tight text-wine sm:text-2xl">
            Nenhuma forma de pagamento cadastrada
          </h4>
          <p className="mx-auto mb-7 max-w-md font-sans text-xs leading-relaxed text-wine/80 sm:text-sm">
            Cadastre os meios de pagamento recebidos (como Pix, Cartão e Dinheiro) para calcular o valor líquido de cada atendimento.
          </p>
          <button
            type="button"
            id="btn-empty-forma-pagamento"
            onClick={handleOpenCreate}
            className="group shine inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-white/80 bg-gradient-to-br from-[#D13E66] to-berry px-6 text-sm font-bold text-white shadow-lg shadow-berry/30 transition-all hover:from-wine hover:to-wine active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>Cadastrar Primeira Forma</span>
          </button>
        </div>
      ) : (
        <div className="w-full">
          {/* Cabeçalho das colunas (desktop) */}
          <div
            role="row"
            className="mb-2 hidden grid-cols-[minmax(0,1.6fr)_160px_96px] items-center px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B1530]/55 md:grid"
          >
            <div>Forma de Pagamento</div>
            <div className="text-center">Taxa Operacional</div>
            <div className="text-right">Ações</div>
          </div>

          {/* Linhas no padrão Lumine */}
          <div className="flex flex-col gap-3">
            {formasPagamento.map((item) => (
              <div
                key={item.idFormaPagamento}
                className="lumine-row group px-5 py-3.5"
              >
                <div className="flex items-center justify-between gap-4 md:grid md:grid-cols-[minmax(0,1.6fr)_160px_96px]">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-petal/45 bg-pale/80 text-rose">
                      <PaymentMiniIcon label={item.nome} />
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate text-[15px] font-bold leading-tight text-ink">
                        {item.nome}
                      </span>
                      <span className="mt-1 inline-flex items-center rounded-full border border-petal/45 bg-pale/75 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-wine md:hidden">
                        Taxa: {item.taxaPercentual.toFixed(2).replace(".", ",")}%
                      </span>
                    </div>
                  </div>

                  <div className="hidden text-center md:block">
                    <span
                      className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-bold tabular-nums ${
                        item.taxaPercentual === 0
                          ? "border-petal/50 bg-white/75 text-wine/80"
                          : "border-[rgba(245,168,188,0.5)] bg-[#FCE1E8] text-[#6B1530]"
                      }`}
                    >
                      {item.taxaPercentual.toFixed(2).replace(".", ",")}%
                    </span>
                  </div>

                  <div className="row-actions flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-white/50 text-[#6B1530]/75 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-[#F5A8BC]/35 transition-all hover:bg-[#FCE1E8] hover:text-[#C5325A] hover:ring-[#F5A8BC]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                      title="Editar forma de pagamento"
                      aria-label={`Editar ${item.nome}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRequest(item)}
                      className="proc-delete-btn inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-white/50 text-[#C5325A]/75 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-[#F5A8BC]/35 transition-all hover:bg-[rgba(197,50,90,0.12)] hover:text-[#C5325A] hover:ring-[#C5325A]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                      title="Excluir forma de pagamento"
                      aria-label={`Excluir ${item.nome}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          id="modal-forma-pagamento-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSaving) setIsModalOpen(false);
          }}
        >
          <div
            id="modal-forma-pagamento-content"
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-petal/40 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 sm:p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-petal/25 pb-4">
              <div>
                <h4 className="font-display text-xl font-bold leading-tight text-wine">
                  {editingForma ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}
                </h4>
                <p className="mt-1 text-xs font-medium text-ink/60">
                  Informe o nome e a taxa percentual cobrada pela operadora
                </p>
              </div>
              <button
                type="button"
                id="btn-close-modal-forma"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="cursor-pointer rounded-full p-1 text-wine/60 transition-colors hover:bg-pale hover:text-wine"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {/* Sugestões rápidas */}
              {!editingForma && (
                <div>
                  <span className="mb-1.5 ml-1 block text-[11px] font-bold text-wine/70">
                    Preenchimento rápido:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGESTOES_FORMAS.map((sug) => (
                      <button
                        key={sug.nome}
                        type="button"
                        onClick={() => {
                          setFormData({ nome: sug.nome, taxaPercentual: sug.taxa });
                          setErrors({});
                        }}
                        className="cursor-pointer rounded-full border border-petal/50 bg-cream/70 px-3 py-1 text-[11px] font-semibold text-wine transition-colors hover:bg-pale"
                      >
                        {sug.nome} ({sug.taxa}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nome */}
              <div>
                <label
                  htmlFor="nome-forma"
                  className="mb-1.5 ml-1 block text-xs font-bold text-wine"
                >
                  Nome da forma de pagamento *
                </label>
                <input
                  type="text"
                  id="nome-forma"
                  name="nome"
                  maxLength={100}
                  placeholder="Ex: Pix, Cartão de Crédito 1x, Dinheiro..."
                  value={formData.nome}
                  onChange={(e) => {
                    setFormData({ ...formData, nome: e.target.value });
                    if (errors.nome) setErrors({ ...errors, nome: undefined });
                  }}
                  className={`h-11 w-full rounded-full border bg-white/80 px-4 text-sm text-ink placeholder-ink/40 outline-none transition-all ${
                    errors.nome
                      ? "border-berry focus:border-berry focus:ring-4 focus:ring-berry/15"
                      : "border-petal/70 hover:border-rose focus:border-berry focus:ring-4 focus:ring-berry/15"
                  }`}
                />
                {errors.nome && (
                  <p className="mt-1.5 ml-1 flex items-center gap-1 text-xs font-semibold text-berry">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.nome}
                  </p>
                )}
              </div>

              {/* Taxa percentual */}
              <div>
                <label
                  htmlFor="taxaPercentual-forma"
                  className="mb-1.5 ml-1 block text-xs font-bold text-wine"
                >
                  Taxa percentual aplicada (%) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="taxaPercentual-forma"
                    name="taxaPercentual"
                    placeholder="0,00"
                    value={formData.taxaPercentual}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^\d,.]/g, "");
                      setFormData({ ...formData, taxaPercentual: clean });
                      if (errors.taxaPercentual)
                        setErrors({ ...errors, taxaPercentual: undefined });
                    }}
                    className={`h-11 w-full rounded-full border bg-white/80 pl-4 pr-9 text-sm font-bold tabular-nums text-ink placeholder-ink/40 outline-none transition-all ${
                      errors.taxaPercentual
                        ? "border-berry focus:border-berry focus:ring-4 focus:ring-berry/15"
                        : "border-petal/70 hover:border-rose focus:border-berry focus:ring-4 focus:ring-berry/15"
                    }`}
                  />
                  <Percent className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-wine/55" />
                </div>
                <span className="mt-1 ml-1 block text-[11px] font-medium text-ink/55">
                  Informe 0 para recebimentos sem taxa (ex.: dinheiro ou Pix).
                </span>
                {errors.taxaPercentual && (
                  <p className="mt-1.5 ml-1 flex items-center gap-1 text-xs font-semibold text-berry">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.taxaPercentual}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-petal/25 pt-5">
                <button
                  type="button"
                  id="btn-cancelar-forma"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-petal/60 bg-white/70 px-5 text-sm font-bold text-wine transition-colors hover:bg-pale"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-salvar-forma"
                  disabled={isSaving}
                  className="shine inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/80 bg-gradient-to-br from-[#D13E66] to-berry px-6 text-sm font-bold text-white shadow-lg shadow-berry/30 transition-all hover:from-wine hover:to-wine active:scale-[0.98] disabled:opacity-70"
                >
                  {isSaving ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>
                        {editingForma ? "Salvar Alterações" : "Cadastrar Forma"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
