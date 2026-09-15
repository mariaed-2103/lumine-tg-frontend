import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  AlertCircle,
  X,
  Check,
  Percent,
} from "lucide-react";
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
    <div className="space-y-6">
      {/* Top action & Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-petal/30">
        <div>
          <h3 className="font-display font-bold text-lg text-wine">
            Formas de Pagamento e Taxas
          </h3>
          <p className="text-xs text-wine/70 font-medium">
            Cadastre os métodos aceitos e suas taxas operacionais para cálculo do lucro real líquido
          </p>
        </div>
        <button
          type="button"
          id="btn-nova-forma-pagamento"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-berry hover:bg-wine text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-berry/20 active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Forma de Pagamento</span>
        </button>
      </div>

      {/* Lista */}
      {formasPagamento.length === 0 ? (
        <div id="empty-state-formas-pagamento" className="py-12 sm:py-16 px-4 text-center max-w-lg mx-auto transition-all">
          <div className="mx-auto w-20 h-20 rounded-full bg-pale flex items-center justify-center mb-5 shadow-xs border border-petal/40">
            <CreditCard className="w-9 h-9 text-berry" strokeWidth={1.75} />
          </div>
          <h4 className="font-display font-bold text-xl text-wine mb-2">
            Nenhuma forma de pagamento cadastrada
          </h4>
          <p className="text-xs sm:text-sm text-wine/80 max-w-md mx-auto mb-6 leading-relaxed font-sans">
            Cadastre os meios de pagamento recebidos pela clínica (como Pix, Cartão de Crédito,
            Débito e Dinheiro) para que as taxas sejam descontadas automaticamente nos atendimentos.
          </p>
          <button
            type="button"
            id="btn-empty-forma-pagamento"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 bg-berry hover:bg-wine text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-md shadow-berry/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeira Forma</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="px-1 text-xs text-wine/80 font-medium">
            Total de <strong>{formasPagamento.length}</strong> forma(s) de pagamento configurada(s)
          </div>

          {/* Table desktop */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-petal/40 bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream border-b border-petal/40 text-wine font-display font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nome da Forma de Pagamento</th>
                  <th className="py-3.5 px-4 text-center">Taxa Aplicada</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-petal/20">
                {formasPagamento.map((item) => (
                  <tr key={item.idFormaPagamento} className="hover:bg-cream/60 transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-ink">{item.nome}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        item.taxaPercentual === 0
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-pale text-berry border-petal/40"
                      }`}>
                        {item.taxaPercentual.toFixed(2).replace(".", ",")}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-wine/70 hover:text-berry hover:bg-pale rounded-lg transition-colors cursor-pointer"
                          title="Editar forma de pagamento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRequest(item)}
                          className="p-1.5 text-wine/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir forma de pagamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
            {formasPagamento.map((item) => (
              <div key={item.idFormaPagamento} className="bg-white p-4 rounded-2xl border border-petal/40 shadow-xs flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-ink leading-tight">{item.nome}</h5>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    item.taxaPercentual === 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-pale text-berry border-petal/40"
                  }`}>
                    Taxa: {item.taxaPercentual.toFixed(2).replace(".", ",")}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => handleOpenEdit(item)} className="p-1.5 text-wine hover:text-berry cursor-pointer">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onDeleteRequest(item)} className="p-1.5 text-wine hover:text-red-600 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget && !isSaving) setIsModalOpen(false); }}
        >
          <div
            id="modal-forma-pagamento-content"
            role="dialog"
            aria-modal="true"
            className="bg-white w-full max-w-md rounded-[32px] border border-petal/40 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 sm:p-7 pb-4 border-b border-petal/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pale border border-petal/40 flex items-center justify-center text-berry shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-wine leading-tight">
                    {editingForma ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}
                  </h4>
                  <p className="text-xs text-wine/70 font-medium">Configure a forma e sua taxa percentual</p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-modal-forma"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="p-1 text-wine/60 hover:text-wine hover:bg-pale rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 sm:p-7 space-y-4">
              {/* Sugestões rápidas */}
              {!editingForma && (
                <div>
                  <span className="text-[11px] font-bold text-wine/70 block mb-1.5">Sugestões rápidas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGESTOES_FORMAS.map((sug) => (
                      <button
                        key={sug.nome}
                        type="button"
                        onClick={() => {
                          setFormData({ nome: sug.nome, taxaPercentual: sug.taxa });
                          setErrors({});
                        }}
                        className="text-[10px] font-semibold bg-cream hover:bg-pale text-wine px-2.5 py-1 rounded-lg border border-petal/40 transition-colors cursor-pointer"
                      >
                        {sug.nome} ({sug.taxa}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nome */}
              <div>
                <label htmlFor="nome-forma" className="block text-xs font-bold text-wine mb-1.5">
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
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-ink placeholder-wine/40 transition-colors focus:outline-none focus:ring-1 ${
                    errors.nome
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                  }`}
                />
                {errors.nome && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />{errors.nome}
                  </p>
                )}
              </div>

              {/* Taxa percentual */}
              <div>
                <label htmlFor="taxaPercentual-forma" className="block text-xs font-bold text-wine mb-1.5">
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
                      if (errors.taxaPercentual) setErrors({ ...errors, taxaPercentual: undefined });
                    }}
                    className={`w-full pl-3.5 pr-8 py-2.5 text-xs rounded-xl border bg-white text-ink font-bold placeholder-wine/40 transition-colors focus:outline-none focus:ring-1 ${
                      errors.taxaPercentual
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                        : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                    }`}
                  />
                  <Percent className="w-3.5 h-3.5 text-wine/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[10px] text-wine/60 mt-1 block">
                  Informe 0 para formas sem incidência de taxa (ex: dinheiro ou Pix).
                </span>
                {errors.taxaPercentual && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />{errors.taxaPercentual}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-petal/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancelar-forma"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-full border border-petal/60 text-xs font-bold text-wine hover:bg-pale transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-salvar-forma"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-berry hover:bg-wine text-white text-xs font-bold shadow-md shadow-berry/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingForma ? "Salvar Alterações" : "Cadastrar Forma"}</span>
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
