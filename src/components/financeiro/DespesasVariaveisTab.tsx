import React, { useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Receipt,
  Calendar,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import type {
  DespesaVariavel,
  DespesaVariavelFormData,
  DespesaVariavelFormErrors,
} from "./types";

interface DespesasVariaveisTabProps {
  despesas: DespesaVariavel[];
  competenciaMes: number;
  competenciaAno: number;
  onAddDespesa: (
    despesa: Omit<DespesaVariavel, "idDespesaVariavel">
  ) => Promise<void>;
  onUpdateDespesa: (
    id: number,
    despesa: Omit<DespesaVariavel, "idDespesaVariavel">
  ) => Promise<void>;
  onDeleteRequest: (despesa: DespesaVariavel) => void;
}

const CATEGORIAS_SUGESTOES = [
  "Material Descartável",
  "Manutenção de Equipamentos",
  "Marketing e Anúncios",
  "Cursos e Aperfeiçoamento",
  "Transporte e Deslocamento",
  "Limpeza e Esterilização",
  "Embalagens e Brindes",
  "Taxas Bancárias",
  "Outros",
];

export const DespesasVariaveisTab: React.FC<DespesasVariaveisTabProps> = ({
  despesas,
  competenciaMes,
  competenciaAno,
  onAddDespesa,
  onUpdateDespesa,
  onDeleteRequest,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<DespesaVariavel | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<DespesaVariavelFormData>({
    data: new Date().toISOString().slice(0, 10),
    nome: "",
    valor: "",
    categoria: "Material Descartável",
  });

  const [errors, setErrors] = useState<DespesaVariavelFormErrors>({});

  const despesasFiltradas = useMemo(() => {
    return despesas.filter((d) => {
      if (!d.data) return false;
      const [year, month] = d.data.split("-").map(Number);
      return year === competenciaAno && month === competenciaMes;
    });
  }, [despesas, competenciaMes, competenciaAno]);

  const totalValorMes = useMemo(() => {
    return despesasFiltradas.reduce((acc, curr) => acc + curr.valor, 0);
  }, [despesasFiltradas]);

  const handleOpenCreate = () => {
    setEditingDespesa(null);
    setFormData({
      data: new Date().toISOString().slice(0, 10),
      nome: "",
      valor: "",
      categoria: "Material Descartável",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (despesa: DespesaVariavel) => {
    setEditingDespesa(despesa);
    setFormData({
      data: despesa.data,
      nome: despesa.nome,
      valor: despesa.valor.toFixed(2).replace(".", ","),
      categoria: despesa.categoria,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: DespesaVariavelFormErrors = {};

    if (!formData.data) {
      newErrors.data = "A data da despesa é obrigatória";
    }
    if (!formData.nome.trim()) {
      newErrors.nome = "O nome da despesa é obrigatório";
    }
    const valorParsed = parseFloat(formData.valor.replace(",", "."));
    if (!formData.valor.trim() || isNaN(valorParsed) || valorParsed <= 0) {
      newErrors.valor = "Informe um valor válido maior que zero";
    }
    if (!formData.categoria.trim()) {
      newErrors.categoria = "Selecione ou informe uma categoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const valorNumerico = parseFloat(formData.valor.replace(",", "."));
      const payload: Omit<DespesaVariavel, "idDespesaVariavel"> = {
        data: formData.data,
        nome: formData.nome.trim(),
        valor: valorNumerico,
        categoria: formData.categoria.trim(),
      };

      if (editingDespesa) {
        await onUpdateDespesa(editingDespesa.idDespesaVariavel, payload);
      } else {
        await onAddDespesa(payload);
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

  return (
    <div className="space-y-6">
      {/* Top action & Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-petal/30">
        <div>
          <h3 className="font-display font-bold text-lg text-wine">
            Despesas Variáveis e Pontuais
          </h3>
          <p className="text-xs text-wine/70 font-medium">
            Custos eventuais do mês como manutenções, marketing, descartáveis e imprevistos
          </p>
        </div>
        <button
          type="button"
          id="btn-nova-despesa-variavel"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-berry hover:bg-wine text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-berry/20 active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa Variável</span>
        </button>
      </div>

      {/* Lista */}
      {despesas.length === 0 ? (
        <div
          id="empty-state-despesas-variaveis"
          className="py-12 sm:py-16 px-4 text-center max-w-lg mx-auto transition-all"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-pale flex items-center justify-center mb-5 shadow-xs border border-petal/40">
            <Receipt className="w-9 h-9 text-berry" strokeWidth={1.75} />
          </div>
          <h4 className="font-display font-bold text-xl text-wine mb-2">
            Nenhuma despesa variável registrada
          </h4>
          <p className="text-xs sm:text-sm text-wine/80 max-w-md mx-auto mb-6 leading-relaxed font-sans">
            Registre despesas pontuais e flutuantes para acompanhar com precisão
            as saídas operacionais e apurar o lucro real do seu negócio.
          </p>
          <button
            type="button"
            id="btn-empty-despesa-variavel"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 bg-berry hover:bg-wine text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-md shadow-berry/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Primeira Despesa</span>
          </button>
        </div>
      ) : despesasFiltradas.length === 0 ? (
        <div className="bg-cream rounded-2xl border border-petal/40 p-8 text-center max-w-md mx-auto">
          <Calendar className="w-8 h-8 text-berry mx-auto mb-3" />
          <p className="text-sm font-bold text-wine mb-1">
            Nenhuma despesa registrada nesta competência
          </p>
          <p className="text-xs text-wine/70 mb-4">
            Você possui {despesas.length} despesa(s) variável(is) em outros meses,
            mas nenhuma no mês selecionado.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="text-xs font-bold text-berry hover:underline cursor-pointer"
          >
            + Registrar despesa para esta data
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-wine/80 font-medium">
            <span>
              Exibindo <strong>{despesasFiltradas.length}</strong> registro(s) no período
            </span>
            <span className="bg-pale text-wine px-3 py-1 rounded-full font-bold border border-petal/50">
              Total do mês:{" "}
              <strong className="text-berry">{formatCurrency(totalValorMes)}</strong>
            </span>
          </div>

          {/* Table desktop */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-petal/40 bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream border-b border-petal/40 text-wine font-display font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4">Nome</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4 text-right">Valor</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-petal/20">
                {despesasFiltradas.map((item) => (
                  <tr key={item.idDespesaVariavel} className="hover:bg-cream/60 transition-colors group">
                    <td className="py-3.5 px-4 text-wine font-medium">{formatDate(item.data)}</td>
                    <td className="py-3.5 px-4 font-bold text-ink">{item.nome}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pale text-wine border border-petal/40">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-berry">
                      {formatCurrency(item.valor)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-wine/70 hover:text-berry hover:bg-pale rounded-lg transition-colors cursor-pointer"
                          title="Editar despesa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRequest(item)}
                          className="p-1.5 text-wine/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir despesa"
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
            {despesasFiltradas.map((item) => (
              <div key={item.idDespesaVariavel} className="bg-white p-4 rounded-2xl border border-petal/40 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-wine/60 block mb-0.5">
                      {formatDate(item.data)}
                    </span>
                    <h5 className="font-bold text-sm text-ink leading-tight">{item.nome}</h5>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pale text-wine">
                      {item.categoria}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-berry">{formatCurrency(item.valor)}</span>
                </div>
                <div className="text-[11px] text-wine/80 pt-2 border-t border-petal/20 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-wine hover:text-berry cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(item)}
                    className="p-1.5 text-wine hover:text-red-600 cursor-pointer"
                    title="Excluir"
                  >
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
          id="modal-despesa-variavel-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget && !isSaving) setIsModalOpen(false); }}
        >
          <div
            id="modal-despesa-variavel-content"
            role="dialog"
            aria-modal="true"
            className="bg-white w-full max-w-lg rounded-[32px] border border-petal/40 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 sm:p-7 pb-4 border-b border-petal/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pale border border-petal/40 flex items-center justify-center text-berry shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-wine leading-tight">
                    {editingDespesa ? "Editar Despesa Variável" : "Nova Despesa Variável"}
                  </h4>
                  <p className="text-xs text-wine/70 font-medium">
                    Preencha as informações do custo pontual
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-modal-despesa-variavel"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="p-1 text-wine/60 hover:text-wine hover:bg-pale rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 sm:p-7 space-y-4">
              {/* Data */}
              <div>
                <label htmlFor="data-despesa-variavel" className="block text-xs font-bold text-wine mb-1.5">
                  Data da despesa *
                </label>
                <input
                  type="date"
                  id="data-despesa-variavel"
                  name="data"
                  value={formData.data}
                  onChange={(e) => {
                    setFormData({ ...formData, data: e.target.value });
                    if (errors.data) setErrors({ ...errors, data: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-ink transition-colors focus:outline-none focus:ring-1 ${
                    errors.data
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                  }`}
                />
                {errors.data && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />{errors.data}
                  </p>
                )}
              </div>

              {/* Nome */}
              <div>
                <label htmlFor="nome-despesa-variavel" className="block text-xs font-bold text-wine mb-1.5">
                  Nome / Descrição da despesa *
                </label>
                <input
                  type="text"
                  id="nome-despesa-variavel"
                  name="nome"
                  maxLength={150}
                  placeholder="Ex: Luvas descartáveis extras, Anúncio Instagram..."
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

              {/* Valor & Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="valor-despesa-variavel" className="block text-xs font-bold text-wine mb-1.5">
                    Valor (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-wine/60">R$</span>
                    <input
                      type="text"
                      id="valor-despesa-variavel"
                      name="valor"
                      placeholder="0,00"
                      value={formData.valor}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^\d,.]/g, "");
                        setFormData({ ...formData, valor: clean });
                        if (errors.valor) setErrors({ ...errors, valor: undefined });
                      }}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-white text-ink font-bold placeholder-wine/40 transition-colors focus:outline-none focus:ring-1 ${
                        errors.valor
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                      }`}
                    />
                  </div>
                  {errors.valor && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />{errors.valor}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="categoria-despesa-variavel" className="block text-xs font-bold text-wine mb-1.5">
                    Categoria *
                  </label>
                  <input
                    type="text"
                    id="categoria-despesa-variavel"
                    name="categoria"
                    list="categorias-despesas-variaveis"
                    placeholder="Selecione ou digite..."
                    value={formData.categoria}
                    onChange={(e) => {
                      setFormData({ ...formData, categoria: e.target.value });
                      if (errors.categoria) setErrors({ ...errors, categoria: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-ink transition-colors focus:outline-none focus:ring-1 ${
                      errors.categoria
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                        : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                    }`}
                  />
                  <datalist id="categorias-despesas-variaveis">
                    {CATEGORIAS_SUGESTOES.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  {errors.categoria && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />{errors.categoria}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-petal/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancelar-despesa-variavel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-full border border-petal/60 text-xs font-bold text-wine hover:bg-pale transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-salvar-despesa-variavel"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-berry hover:bg-wine text-white text-xs font-bold shadow-md shadow-berry/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingDespesa ? "Salvar Alterações" : "Cadastrar Despesa"}</span>
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
