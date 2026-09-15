import React, { useState } from "react";
import {
  Edit2,
  Check,
  X,
  Info,
  AlertCircle,
  Percent,
  ShieldAlert,
  Sparkles,
  Palmtree,
} from "lucide-react";
import type {
  ConfiguracaoFinanceira,
  ConfiguracaoFinanceiraFormData,
  ConfiguracaoFinanceiraFormErrors,
} from "./types";

interface ConfiguracaoFinanceiraTabProps {
  configuracao: ConfiguracaoFinanceira;
  onSaveConfiguracao: (config: Omit<ConfiguracaoFinanceira, "idConfiguracao" | "dataAtualizacao">) => Promise<void>;
}

export const ConfiguracaoFinanceiraTab: React.FC<ConfiguracaoFinanceiraTabProps> = ({
  configuracao,
  onSaveConfiguracao,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ConfiguracaoFinanceiraFormData>({
    margemSeguranca: configuracao.margemSeguranca.toFixed(2).replace(".", ","),
    lucroDesejado: configuracao.lucroDesejado.toFixed(2).replace(".", ","),
    provisaoFeriasAtiva: configuracao.provisaoFeriasAtiva,
    percentualProvisaoFerias:
      configuracao.percentualProvisaoFerias !== null
        ? configuracao.percentualProvisaoFerias.toFixed(2).replace(".", ",")
        : "8,33",
  });

  const [errors, setErrors] = useState<ConfiguracaoFinanceiraFormErrors>({});

  const handleStartEdit = () => {
    setFormData({
      margemSeguranca: configuracao.margemSeguranca.toFixed(2).replace(".", ","),
      lucroDesejado: configuracao.lucroDesejado.toFixed(2).replace(".", ","),
      provisaoFeriasAtiva: configuracao.provisaoFeriasAtiva,
      percentualProvisaoFerias:
        configuracao.percentualProvisaoFerias !== null
          ? configuracao.percentualProvisaoFerias.toFixed(2).replace(".", ",")
          : "8,33",
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: ConfiguracaoFinanceiraFormErrors = {};

    const margem = parseFloat(formData.margemSeguranca.replace(",", "."));
    if (formData.margemSeguranca.trim() === "" || isNaN(margem) || margem < 0) {
      newErrors.margemSeguranca =
        "Informe uma margem de segurança válida (maior ou igual a 0%)";
    }

    const lucro = parseFloat(formData.lucroDesejado.replace(",", "."));
    if (formData.lucroDesejado.trim() === "" || isNaN(lucro) || lucro < 0) {
      newErrors.lucroDesejado =
        "Informe um percentual de lucro desejado válido (maior ou igual a 0%)";
    }

    // RN009: margemSeguranca + lucroDesejado < 100%
    if (!isNaN(margem) && !isNaN(lucro) && margem >= 0 && lucro >= 0) {
      if (margem + lucro >= 100) {
        newErrors.geral =
          "A soma da margem de segurança com o lucro desejado deve ser menor que 100%";
      }
    }

    // RN008: se provisaoFeriasAtiva, percentualProvisaoFerias > 0
    if (formData.provisaoFeriasAtiva) {
      const ferias = parseFloat(formData.percentualProvisaoFerias.replace(",", "."));
      if (
        formData.percentualProvisaoFerias.trim() === "" ||
        isNaN(ferias) ||
        ferias <= 0
      ) {
        newErrors.percentualProvisaoFerias = "Informe um percentual maior que zero";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const margem = parseFloat(formData.margemSeguranca.replace(",", "."));
      const lucro = parseFloat(formData.lucroDesejado.replace(",", "."));
      const ferias = formData.provisaoFeriasAtiva
        ? parseFloat(formData.percentualProvisaoFerias.replace(",", "."))
        : null;

      await onSaveConfiguracao({
        margemSeguranca: margem,
        lucroDesejado: lucro,
        provisaoFeriasAtiva: formData.provisaoFeriasAtiva,
        percentualProvisaoFerias: ferias,
      });

      setIsEditing(false);
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
            Configuração Financeira e Parâmetros de Precificação
          </h3>
          <p className="text-xs text-wine/70 font-medium">
            Defina as taxas multiplicadoras e margens aplicadas no simulador de preços
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            id="btn-editar-configuracao"
            onClick={handleStartEdit}
            className="inline-flex items-center justify-center gap-2 bg-berry hover:bg-wine text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-berry/20 active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editar configuração</span>
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-pale p-4 sm:p-5 rounded-2xl border border-petal/60 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white/70 text-berry flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-wine font-medium leading-relaxed">
          <span className="font-bold block mb-0.5 font-display text-sm text-wine">
            Como estes parâmetros afetam seu negócio:
          </span>
          Esses parâmetros são usados no simulador de preços para calcular o valor sugerido de cada procedimento.
        </div>
      </div>

      {/* VIEW MODE */}
      {!isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Margem de Segurança */}
            <div className="bg-cream p-5 rounded-2xl border border-petal/40 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-berry">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-wine/80">
                  Margem de Segurança
                </span>
              </div>
              <div className="font-display font-bold text-3xl text-wine">
                {configuracao.margemSeguranca.toFixed(2).replace(".", ",")}%
              </div>
              <p className="text-[11px] text-wine/70 font-medium">
                Proteção percentual contra perdas pontuais, variações de insumos e desperdícios.
              </p>
            </div>

            {/* Lucro Desejado */}
            <div className="bg-cream p-5 rounded-2xl border border-petal/40 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-berry">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-wine/80">
                  Lucro Desejado
                </span>
              </div>
              <div className="font-display font-bold text-3xl text-wine">
                {configuracao.lucroDesejado.toFixed(2).replace(".", ",")}%
              </div>
              <p className="text-[11px] text-wine/70 font-medium">
                Percentual líquido de ganho pretendido sobre o custo base de cada procedimento.
              </p>
            </div>

            {/* Provisão de Férias */}
            <div className="bg-cream p-5 rounded-2xl border border-petal/40 shadow-xs space-y-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 text-berry">
                <Palmtree className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-wine/80">
                  Provisão de Férias
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-3xl text-wine">
                  {configuracao.provisaoFeriasAtiva
                    ? `${(configuracao.percentualProvisaoFerias ?? 0).toFixed(2).replace(".", ",")}%`
                    : "Desativada"}
                </span>
                {configuracao.provisaoFeriasAtiva && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Ativa
                  </span>
                )}
              </div>
              <p className="text-[11px] text-wine/70 font-medium">
                {configuracao.provisaoFeriasAtiva
                  ? "Percentual aplicado sobre o pró-labore fixo para reserva anual de descanso."
                  : "Nenhuma reserva percentual automática está sendo adicionada ao custo/hora."}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-petal/30 text-xs text-wine/70 flex items-center justify-between">
            <span>
              Status dos parâmetros: <strong>Ativo e em conformidade com o Simulador</strong>
            </span>
            <span className="text-[11px]">
              Soma Margem + Lucro:{" "}
              <strong className="text-berry">
                {(configuracao.margemSeguranca + configuracao.lucroDesejado).toFixed(2).replace(".", ",")}%
              </strong>{" "}
              (&lt; 100%)
            </span>
          </div>
        </div>
      ) : (
        /* EDIT MODE */
        <form
          onSubmit={handleSave}
          className="bg-cream p-6 sm:p-8 rounded-3xl border border-petal/50 shadow-xs space-y-6"
        >
          {errors.geral && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.geral}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Margem de Segurança */}
            <div>
              <label htmlFor="margemSeguranca" className="block text-xs font-bold text-wine mb-1.5">
                Margem de segurança (%) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="margemSeguranca"
                  name="margemSeguranca"
                  placeholder="Ex: 10,00"
                  value={formData.margemSeguranca}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^\d,.]/g, "");
                    setFormData({ ...formData, margemSeguranca: clean });
                    if (errors.margemSeguranca || errors.geral) {
                      setErrors({ ...errors, margemSeguranca: undefined, geral: undefined });
                    }
                  }}
                  className={`w-full pl-3.5 pr-8 py-2.5 text-xs rounded-xl border bg-white text-ink font-bold transition-colors focus:outline-none focus:ring-1 ${
                    errors.margemSeguranca || errors.geral
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                  }`}
                />
                <Percent className="w-3.5 h-3.5 text-wine/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-[10px] text-wine/60 mt-1 block">
                Valor percentual mínimo maior ou igual a 0%.
              </span>
              {errors.margemSeguranca && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />{errors.margemSeguranca}
                </p>
              )}
            </div>

            {/* Lucro Desejado */}
            <div>
              <label htmlFor="lucroDesejado" className="block text-xs font-bold text-wine mb-1.5">
                Lucro desejado (%) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="lucroDesejado"
                  name="lucroDesejado"
                  placeholder="Ex: 20,00"
                  value={formData.lucroDesejado}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^\d,.]/g, "");
                    setFormData({ ...formData, lucroDesejado: clean });
                    if (errors.lucroDesejado || errors.geral) {
                      setErrors({ ...errors, lucroDesejado: undefined, geral: undefined });
                    }
                  }}
                  className={`w-full pl-3.5 pr-8 py-2.5 text-xs rounded-xl border bg-white text-ink font-bold transition-colors focus:outline-none focus:ring-1 ${
                    errors.lucroDesejado || errors.geral
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                  }`}
                />
                <Percent className="w-3.5 h-3.5 text-wine/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-[10px] text-wine/60 mt-1 block">
                Valor percentual mínimo maior ou igual a 0%.
              </span>
              {errors.lucroDesejado && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />{errors.lucroDesejado}
                </p>
              )}
            </div>
          </div>

          {/* Provisão de Férias */}
          <div className="pt-4 border-t border-petal/30 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-wine block">Ativar Provisão de Férias</span>
                <span className="text-[11px] text-wine/70 font-medium block">
                  Aplica um percentual adicional de reserva de férias sobre a base de cálculo.
                </span>
              </div>
              {/* Toggle Switch */}
              <button
                type="button"
                id="toggle-provisao-ferias"
                role="switch"
                aria-checked={formData.provisaoFeriasAtiva}
                onClick={() => {
                  const nextState = !formData.provisaoFeriasAtiva;
                  setFormData({ ...formData, provisaoFeriasAtiva: nextState });
                  if (!nextState) {
                    setErrors({ ...errors, percentualProvisaoFerias: undefined });
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-berry focus:ring-offset-2 ${
                  formData.provisaoFeriasAtiva ? "bg-berry" : "bg-petal/60"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    formData.provisaoFeriasAtiva ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Campo percentualProvisaoFerias (condicional) */}
            {formData.provisaoFeriasAtiva && (
              <div className="bg-white p-4 rounded-2xl border border-petal/50 animate-in fade-in duration-200 max-w-sm">
                <label htmlFor="percentualProvisaoFerias" className="block text-xs font-bold text-wine mb-1.5">
                  Percentual de provisão de férias (%) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="percentualProvisaoFerias"
                    name="percentualProvisaoFerias"
                    placeholder="Ex: 8,33"
                    value={formData.percentualProvisaoFerias}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^\d,.]/g, "");
                      setFormData({ ...formData, percentualProvisaoFerias: clean });
                      if (errors.percentualProvisaoFerias) {
                        setErrors({ ...errors, percentualProvisaoFerias: undefined });
                      }
                    }}
                    className={`w-full pl-3.5 pr-8 py-2 text-xs rounded-xl border bg-white text-ink font-bold transition-colors focus:outline-none focus:ring-1 ${
                      errors.percentualProvisaoFerias
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                        : "border-petal/50 hover:border-rose focus:border-berry focus:ring-berry"
                    }`}
                  />
                  <Percent className="w-3.5 h-3.5 text-wine/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[10px] text-wine/60 mt-1 block">
                  Regra RN008: Deve ser maior que 0%. Ex: 8,33% equivale a 1 mês de férias por ano.
                </span>
                {errors.percentualProvisaoFerias && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />{errors.percentualProvisaoFerias}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-petal/30 flex items-center justify-end gap-3">
            <button
              type="button"
              id="btn-cancelar-configuracao"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-full border border-petal/60 text-xs font-bold text-wine hover:bg-pale transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-salvar-configuracao"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-berry hover:bg-wine text-white text-xs font-bold shadow-md shadow-berry/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
            >
              {isSaving ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Configuração</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
