import React, { useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ShoppingCart,
  Calendar,
  AlertCircle,
  Package,
  ArrowRight,
  X,
  Check,
} from "lucide-react";
import type {
  CompraInsumo,
  CompraInsumoFormData,
  CompraInsumoFormErrors,
} from "./types";
import type { Insumo } from "@/components/insumos/types";

interface ComprasTabProps {
  compras: CompraInsumo[];
  insumos: Insumo[];
  competenciaMes: number;
  competenciaAno: number;
  onAddCompra: (compra: Omit<CompraInsumo, "idCompra">) => Promise<void>;
  onUpdateCompra: (
    id: number,
    compra: Omit<CompraInsumo, "idCompra">
  ) => Promise<void>;
  onDeleteRequest: (compra: CompraInsumo, nomeInsumo: string) => void;
  onNavigateToInsumos?: () => void;
}

export const ComprasTab: React.FC<ComprasTabProps> = ({
  compras,
  insumos,
  competenciaMes,
  competenciaAno,
  onAddCompra,
  onUpdateCompra,
  onDeleteRequest,
  onNavigateToInsumos,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompra, setEditingCompra] = useState<CompraInsumo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Map insumos for fast lookup — chave é number (idInsumo do backend)
  const insumosMap = useMemo(() => {
    const map = new Map<number, Insumo>();
    insumos.forEach((item) => map.set(item.idInsumo, item));
    return map;
  }, [insumos]);

  // Form State — idInsumo é string porque vem de <select>
  const [formData, setFormData] = useState<CompraInsumoFormData>({
    idInsumo: insumos.length > 0 ? String(insumos[0].idInsumo) : "",
    dataCompra: new Date().toISOString().slice(0, 10),
    quantidadeComprada: "1",
    valorTotalCompra: "",
    descricao: "",
  });

  const [errors, setErrors] = useState<CompraInsumoFormErrors>({});

  const comprasFiltradas = useMemo(() => {
    return compras.filter((c) => {
      if (!c.dataCompra) return false;
      const [year, month] = c.dataCompra.split("-").map(Number);
      return year === competenciaAno && month === competenciaMes;
    });
  }, [compras, competenciaMes, competenciaAno]);

  const totalValorMes = useMemo(() => {
    return comprasFiltradas.reduce((acc, curr) => acc + curr.valorTotalCompra, 0);
  }, [comprasFiltradas]);

  const handleOpenCreate = () => {
    setEditingCompra(null);
    setFormData({
      idInsumo: insumos.length > 0 ? String(insumos[0].idInsumo) : "",
      dataCompra: new Date().toISOString().slice(0, 10),
      quantidadeComprada: "1",
      valorTotalCompra: "",
      descricao: "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (compra: CompraInsumo) => {
    setEditingCompra(compra);
    setFormData({
      idInsumo: String(compra.idInsumo), // number → string para o <select>
      dataCompra: compra.dataCompra,
      quantidadeComprada: String(compra.quantidadeComprada),
      valorTotalCompra: compra.valorTotalCompra.toFixed(2).replace(".", ","),
      descricao: compra.descricao || "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: CompraInsumoFormErrors = {};

    if (!formData.idInsumo) {
      newErrors.idInsumo = "Selecione o insumo comprado";
    }
    if (!formData.dataCompra) {
      newErrors.dataCompra = "A data da compra é obrigatória";
    }
    const qtd = parseFloat(formData.quantidadeComprada.replace(",", "."));
    if (!formData.quantidadeComprada.trim() || isNaN(qtd) || qtd <= 0) {
      newErrors.quantidadeComprada = "Informe uma quantidade válida de embalagens";
    }
    const valor = parseFloat(formData.valorTotalCompra.replace(",", "."));
    if (!formData.valorTotalCompra.trim() || isNaN(valor) || valor <= 0) {
      newErrors.valorTotalCompra = "Informe o valor total da compra";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const qtdNumerica = parseFloat(formData.quantidadeComprada.replace(",", "."));
      const valorNumerico = parseFloat(formData.valorTotalCompra.replace(",", "."));

      const payload: Omit<CompraInsumo, "idCompra"> = {
        idInsumo: Number(formData.idInsumo), // string → number para o backend
        dataCompra: formData.dataCompra,
        quantidadeComprada: qtdNumerica,
        valorTotalCompra: valorNumerico,
        descricao: formData.descricao.trim() || undefined,
      };

      if (editingCompra) {
        await onUpdateCompra(editingCompra.idCompra, payload);
      } else {
        await onAddCompra(payload);
      }

      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // idInsumo aqui é number (do tipo CompraInsumo)
  const getInsumoNome = (idInsumo: number) => {
    const insumo = insumosMap.get(idInsumo);
    if (!insumo) return "Insumo não identificado";
    return `${insumo.nome} (${insumo.unidadeMedida})`;
  };

  return (
    <div className="space-y-6">
      {/* Top action & Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-petal/30">
        <div>
          <h3 className="font-display font-bold text-lg text-wine">
            Compras de Insumos (Reposição)
          </h3>
          <p className="text-xs text-wine/70 font-medium">
            Registro de aquisições de embalagens para controle de custo unitário e estoque
          </p>
        </div>
        <button
          type="button"
          id="btn-nova-compra"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-berry hover:bg-wine text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-berry/20 active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Compra</span>
        </button>
      </div>

      {/* Lista */}
      {compras.length === 0 ? (
        <div id="empty-state-compras" className="py-12 sm:py-16 px-4 text-center max-w-lg mx-auto transition-all">
          <div className="mx-auto w-20 h-20 rounded-full bg-pale flex items-center justify-center mb-5 shadow-xs border border-petal/40">
            <ShoppingCart className="w-9 h-9 text-berry" strokeWidth={1.75} />
          </div>
          <h4 className="font-display font-bold text-xl text-wine mb-2">Nenhuma compra registrada</h4>
          <p className="text-xs sm:text-sm text-wine/80 max-w-md mx-auto mb-6 leading-relaxed font-sans">
            Registre as aquisições de produtos e embalagens para manter o histórico de custos atualizado
            e calcular com exatidão o custo por ml/grama nos procedimentos.
          </p>
          <button
            type="button"
            id="btn-empty-compra"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 bg-berry hover:bg-wine text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-md shadow-berry/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Primeira Compra</span>
          </button>
        </div>
      ) : comprasFiltradas.length === 0 ? (
        <div className="bg-cream rounded-2xl border border-petal/40 p-8 text-center max-w-md mx-auto">
          <Calendar className="w-8 h-8 text-berry mx-auto mb-3" />
          <p className="text-sm font-bold text-wine mb-1">Nenhuma compra registrada nesta competência</p>
          <p className="text-xs text-wine/70 mb-4">
            Você possui {compras.length} compra(s) registrada(s) no total, mas nenhuma no mês selecionado.
          </p>
          <button type="button" onClick={handleOpenCreate} className="text-xs font-bold text-berry hover:underline cursor-pointer">
            + Registrar compra para esta data
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-wine/80 font-medium">
            <span>Exibindo <strong>{comprasFiltradas.length}</strong> compra(s) no período</span>
            <span className="bg-pale text-wine px-3 py-1 rounded-full font-bold border border-petal/50">
              Total de compras: <strong className="text-berry">{formatCurrency(totalValorMes)}</strong>
            </span>
          </div>

          {/* Table desktop */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-petal/40 bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream border-b border-petal/40 text-wine font-display font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4">Insumo Comprado</th>
                  <th className="py-3.5 px-4 text-center">Quantidade</th>
                  <th className="py-3.5 px-4 text-right">Valor Total</th>
                  <th className="py-3.5 px-4">Descrição</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-petal/20">
                {comprasFiltradas.map((item) => (
                  <tr key={item.idCompra} className="hover:bg-cream/60 transition-colors group">
                    <td className="py-3.5 px-4 text-wine font-medium">{formatDate(item.dataCompra)}</td>
                    <td className="py-3.5 px-4 font-bold text-ink">{getInsumoNome(item.idInsumo)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pale text-wine">
                        {item.quantidadeComprada} emb.
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-berry">
                      {formatCurrency(item.valorTotalCompra)}
                    </td>
                    <td className="py-3.5 px-4 text-wine/70 max-w-xs truncate">{item.descricao || "—"}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-wine/70 hover:text-berry hover:bg-pale rounded-lg transition-colors cursor-pointer"
                          title="Editar compra"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRequest(item, getInsumoNome(item.idInsumo))}
                          className="p-1.5 text-wine/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir compra"
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
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {comprasFiltradas.map((item) => (
              <div key={item.idCompra} className="bg-white p-4 rounded-2xl border border-petal/40 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-wine/60 block mb-0.5">{formatDate(item.dataCompra)}</span>
                    <h5 className="font-bold text-sm text-ink leading-tight">{getInsumoNome(item.idInsumo)}</h5>
                    <span className="inline-block mt-1 text-[11px] text-wine/80">
                      Qtd: <strong>{item.quantidadeComprada} embalagens</strong>
                    </span>
                  </div>
                  <span className="font-bold text-sm text-berry">{formatCurrency(item.valorTotalCompra)}</span>
                </div>
                {item.descricao && (
                  <p className="text-xs text-wine/70 italic bg-cream p-2 rounded-xl border border-petal/20">
                    "{item.descricao}"
                  </p>
                )}
                <div className="text-[11px] text-wine/80 pt-2 border-t border-petal/20 flex items-center justify-end gap-1">
                  <button type="button" onClick={() => handleOpenEdit(item)} className="p-1.5 text-wine hover:text-berry cursor-pointer" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onDeleteRequest(item, getInsumoNome(item.idInsumo))} className="p-1.5 text-wine hover:text-red-600 cursor-pointer" title="Excluir">
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
          id="modal-compra-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget && !isSaving) setIsModalOpen(false); }}
        >
          <div
            id="modal-compra-content"
            role="dialog"
            aria-modal="true"
            className="bg-white w-full max-w-lg rounded-[32px] border border-petal/40 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 sm:p-7 pb-4 border-b border-petal/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pale border border-petal/40 flex items-center justify-center text-berry shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-wine leading-tight">
                    {editingCompra ? "Editar Compra de Insumo" : "Registrar Compra de Insumo"}
                  </h4>
                  <p className="text-xs text-wine/70 font-medium">Informe os detalhes da aquisição de estoque</p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-modal-compra"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="p-1 text-wine/60 hover:text-wine hover:bg-pale rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sem insumos cadastrados */}
            {insumos.length === 0 ? (
              <div className="p-6 sm:p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-display font-bold text-base text-wine">
                    Cadastre um insumo antes de registrar uma compra
                  </h5>
                  <p className="text-xs text-wine/70 mt-1 max-w-sm mx-auto">
                    Para registrar uma compra, você precisa ter ao menos um insumo cadastrado na base para vinculação.
                  </p>
                </div>
                {onNavigateToInsumos && (
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); onNavigateToInsumos(); }}
                    className="inline-flex items-center gap-2 bg-berry hover:bg-wine text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md shadow-berry/20 transition-all cursor-pointer"
                  >
                    <span>Ir para Cadastro de Insumos</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-6 sm:p-7 space-y-4">
                {/* Insumo Select */}
                <div>
                  <label htmlFor="idInsumo-compra" className="block text-xs font-bold text-wine mb-1.5">
                    Insumo adquirido *
                  </label>
                  <select
                    id="idInsumo-compra"
                    name="idInsumo"
                    value={formData.idInsumo}
                    onChange={(e) => {
                      setFormData({ ...formData, idInsumo: e.target.value });
                      if (errors.idInsumo) setErrors({ ...errors, idInsumo: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-ink font-medium transition-colors focus:outline-none focus:ring-1 ${
                      errors.idInsumo
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                        : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                    }`}
                  >
                    {insumos.map((ins) => (
                      <option key={ins.idInsumo} value={String(ins.idInsumo)}>
                        {ins.nome} ({ins.quantidadePorEmbalagem} {ins.unidadeMedida}/embalagem)
                      </option>
                    ))}
                  </select>
                  {errors.idInsumo && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />{errors.idInsumo}
                    </p>
                  )}
                </div>

                {/* Data & Quantidade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dataCompra-compra" className="block text-xs font-bold text-wine mb-1.5">
                      Data da compra *
                    </label>
                    <input
                      type="date"
                      id="dataCompra-compra"
                      name="dataCompra"
                      value={formData.dataCompra}
                      onChange={(e) => {
                        setFormData({ ...formData, dataCompra: e.target.value });
                        if (errors.dataCompra) setErrors({ ...errors, dataCompra: undefined });
                      }}
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white text-ink transition-colors focus:outline-none focus:ring-1 ${
                        errors.dataCompra
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                      }`}
                    />
                    {errors.dataCompra && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />{errors.dataCompra}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="quantidadeComprada-compra" className="block text-xs font-bold text-wine mb-1.5">
                      Qtd. de embalagens *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="quantidadeComprada-compra"
                        name="quantidadeComprada"
                        placeholder="Ex: 1 ou 2,5"
                        value={formData.quantidadeComprada}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^\d,.]/g, "");
                          setFormData({ ...formData, quantidadeComprada: clean });
                          if (errors.quantidadeComprada) setErrors({ ...errors, quantidadeComprada: undefined });
                        }}
                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white text-ink pr-22 transition-colors focus:outline-none focus:ring-1 ${
                          errors.quantidadeComprada
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                            : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-wine/60 pointer-events-none">
                        embalagens
                      </span>
                    </div>
                    {errors.quantidadeComprada && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />{errors.quantidadeComprada}
                      </p>
                    )}
                  </div>
                </div>

                {/* Valor Total */}
                <div>
                  <label htmlFor="valorTotalCompra-compra" className="block text-xs font-bold text-wine mb-1.5">
                    Valor total da compra (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-wine/60">R$</span>
                    <input
                      type="text"
                      id="valorTotalCompra-compra"
                      name="valorTotalCompra"
                      placeholder="0,00"
                      value={formData.valorTotalCompra}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^\d,.]/g, "");
                        setFormData({ ...formData, valorTotalCompra: clean });
                        if (errors.valorTotalCompra) setErrors({ ...errors, valorTotalCompra: undefined });
                      }}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-white text-ink font-bold placeholder-wine/40 transition-colors focus:outline-none focus:ring-1 ${
                        errors.valorTotalCompra
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                      }`}
                    />
                  </div>
                  {errors.valorTotalCompra && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />{errors.valorTotalCompra}
                    </p>
                  )}
                </div>

                {/* Descrição */}
                <div>
                  <label htmlFor="descricao-compra" className="block text-xs font-bold text-wine mb-1.5">
                    Descrição / Fornecedor <span className="text-wine/60 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    id="descricao-compra"
                    name="descricao"
                    maxLength={255}
                    placeholder="Ex: Compra na Dental Cremer com frete incluso, Lote 2026B..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-petal/50 hover:border-rose focus:border-berry focus:ring-1 focus:ring-berry bg-white text-ink transition-colors focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-petal/30 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    id="btn-cancelar-compra"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-full border border-petal/60 text-xs font-bold text-wine hover:bg-pale transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="btn-salvar-compra"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-berry hover:bg-wine text-white text-xs font-bold shadow-md shadow-berry/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
                  >
                    {isSaving ? (
                      <span>Salvando...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingCompra ? "Salvar Alterações" : "Registrar Compra"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
