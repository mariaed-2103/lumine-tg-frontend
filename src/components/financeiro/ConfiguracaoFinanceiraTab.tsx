import React, { useState } from "react";
import { AlertCircle, Check, Percent } from "lucide-react";
import { EditIcon } from "@/components/icons/lumine";
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
    <div className="space-y-5">
      {/* Cabeçalho da aba */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-display text-base font-bold text-wine sm:text-lg">
              Parâmetros de Precificação
            </h3>
            <span className="rounded-full border border-petal/50 bg-pale px-2.5 py-0.5 text-xs font-bold tabular-nums text-wine">
              Soma:{" "}
              {(configuracao.margemSeguranca + configuracao.lucroDesejado)
                .toFixed(2)
                .replace(".", ",")}
              %
            </span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-ink/60 sm:text-[13px]">
            Margens aplicadas no cálculo do preço sugerido dos procedimentos
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            id="btn-editar-configuracao"
            onClick={handleStartEdit}
            className="group shine inline-flex h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/80 bg-gradient-to-br from-[#D13E66] to-berry px-5 text-sm font-bold text-white shadow-lg shadow-berry/30 transition-all hover:from-wine hover:to-wine active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5] sm:w-auto"
          >
            <EditIcon className="h-4 w-4" />
            <span>Editar configuração</span>
          </button>
        )}
      </div>

      {/* MODO DE VISUALIZAÇÃO */}
      {!isEditing ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Margem de Segurança */}
          <div className="lumine-row flex flex-col justify-between p-5 sm:p-6">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B1530]/55">
                Margem de Segurança
              </span>
              <div className="mt-2 font-display text-3xl font-bold tabular-nums text-wine sm:text-[34px]">
                {configuracao.margemSeguranca.toFixed(2).replace(".", ",")}%
              </div>
            </div>
            <p className="mt-3 text-[13px] font-medium leading-relaxed text-ink/65">
              Reserva para cobrir variações de custo, perdas pontuais e pequenos imprevistos.
            </p>
          </div>

          {/* Lucro Desejado */}
          <div className="lumine-row flex flex-col justify-between p-5 sm:p-6">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B1530]/55">
                Lucro Desejado
              </span>
              <div className="mt-2 font-display text-3xl font-bold tabular-nums text-wine sm:text-[34px]">
                {configuracao.lucroDesejado.toFixed(2).replace(".", ",")}%
              </div>
            </div>
            <p className="mt-3 text-[13px] font-medium leading-relaxed text-ink/65">
              Retorno líquido esperado sobre o valor de cada procedimento realizado.
            </p>
          </div>

          {/* Provisão de Férias */}
          <div className="lumine-row flex flex-col justify-between p-5 sm:col-span-2 sm:p-6 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B1530]/55">
                  Provisão de Férias
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                    configuracao.provisaoFeriasAtiva
                      ? "border-[rgba(245,168,188,0.5)] bg-[#FCE1E8] text-[#6B1530]"
                      : "border-petal/50 bg-white/75 text-ink/55"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${
                      configuracao.provisaoFeriasAtiva ? "bg-[#C5325A]" : "bg-petal"
                    }`}
                  />
                  {configuracao.provisaoFeriasAtiva ? "Ativa" : "Inativa"}
                </span>
              </div>
              <div className="mt-2 font-display text-3xl font-bold tabular-nums text-wine sm:text-[34px]">
                {configuracao.provisaoFeriasAtiva
                  ? `${(configuracao.percentualProvisaoFerias ?? 0).toFixed(2).replace(".", ",")}%`
                  : "Desativada"}
              </div>
            </div>
            <p className="mt-3 text-[13px] font-medium leading-relaxed text-ink/65">
              {configuracao.provisaoFeriasAtiva
                ? "Percentual sobre o pró-labore reservado para o período de férias."
                : "Adicional opcional sobre o pró-labore para reserva anual de férias."}
            </p>
          </div>
        </div>
      ) : (
        /* MODO DE EDIÇÃO */
        <form
          onSubmit={handleSave}
          className="rounded-[24px] border border-white/80 bg-white/65 p-5 shadow-[0_2px_12px_-4px_rgba(107,21,48,0.10)] space-y-6 sm:p-7"
        >
          {errors.geral && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-berry/30 bg-pale/80 p-3.5 text-xs font-semibold text-wine">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-berry" />
              <span>{errors.geral}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Margem de Segurança */}
            <div>
              <label
                htmlFor="margemSeguranca"
                className="mb-1.5 ml-1 block text-xs font-bold text-wine"
              >
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
                      setErrors({
                        ...errors,
                        margemSeguranca: undefined,
                        geral: undefined,
                      });
                    }
                  }}
                  className={`h-11 w-full rounded-full border bg-white/80 pl-4 pr-9 text-sm font-bold tabular-nums text-ink outline-none transition-all ${
                    errors.margemSeguranca || errors.geral
                      ? "border-berry focus:border-berry focus:ring-4 focus:ring-berry/15"
                      : "border-petal/70 hover:border-rose focus:border-berry focus:ring-4 focus:ring-berry/15"
                  }`}
                />
                <Percent className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-wine/55" />
              </div>
              {errors.margemSeguranca && (
                <p className="mt-1.5 ml-1 flex items-center gap-1 text-xs font-semibold text-berry">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.margemSeguranca}
                </p>
              )}
            </div>

            {/* Lucro Desejado */}
            <div>
              <label
                htmlFor="lucroDesejado"
                className="mb-1.5 ml-1 block text-xs font-bold text-wine"
              >
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
                      setErrors({
                        ...errors,
                        lucroDesejado: undefined,
                        geral: undefined,
                      });
                    }
                  }}
                  className={`h-11 w-full rounded-full border bg-white/80 pl-4 pr-9 text-sm font-bold tabular-nums text-ink outline-none transition-all ${
                    errors.lucroDesejado || errors.geral
                      ? "border-berry focus:border-berry focus:ring-4 focus:ring-berry/15"
                      : "border-petal/70 hover:border-rose focus:border-berry focus:ring-4 focus:ring-berry/15"
                  }`}
                />
                <Percent className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-wine/55" />
              </div>
              {errors.lucroDesejado && (
                <p className="mt-1.5 ml-1 flex items-center gap-1 text-xs font-semibold text-berry">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.lucroDesejado}
                </p>
              )}
            </div>
          </div>

          {/* Provisão de Férias */}
          <div className="space-y-4 border-t border-petal/35 pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block text-sm font-bold text-wine">
                  Provisão de férias
                </span>
                <span className="block text-xs font-medium text-ink/60">
                  Inclui uma reserva percentual sobre o pró-labore no custo fixo por minuto
                </span>
              </div>
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

            {formData.provisaoFeriasAtiva && (
              <div className="max-w-sm pt-1">
                <label
                  htmlFor="percentualProvisaoFerias"
                  className="mb-1.5 ml-1 block text-xs font-bold text-wine"
                >
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
                      setFormData({
                        ...formData,
                        percentualProvisaoFerias: clean,
                      });
                      if (errors.percentualProvisaoFerias) {
                        setErrors({
                          ...errors,
                          percentualProvisaoFerias: undefined,
                        });
                      }
                    }}
                    className={`h-11 w-full rounded-full border bg-white/80 pl-4 pr-9 text-sm font-bold tabular-nums text-ink outline-none transition-all ${
                      errors.percentualProvisaoFerias
                        ? "border-berry focus:border-berry focus:ring-4 focus:ring-berry/15"
                        : "border-petal/70 hover:border-rose focus:border-berry focus:ring-4 focus:ring-berry/15"
                    }`}
                  />
                  <Percent className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-wine/55" />
                </div>
                <span className="mt-1 ml-1 block text-[11px] font-medium text-ink/55">
                  Ex.: 8,33% equivale a 1 mês de férias ao ano.
                </span>
                {errors.percentualProvisaoFerias && (
                  <p className="mt-1.5 ml-1 flex items-center gap-1 text-xs font-semibold text-berry">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.percentualProvisaoFerias}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 border-t border-petal/35 pt-5">
            <button
              type="button"
              id="btn-cancelar-configuracao"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-petal/60 bg-white/70 px-5 text-sm font-bold text-wine transition-colors hover:bg-pale"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-salvar-configuracao"
              disabled={isSaving}
              className="shine inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/80 bg-gradient-to-br from-[#D13E66] to-berry px-6 text-sm font-bold text-white shadow-lg shadow-berry/30 transition-all hover:from-wine hover:to-wine active:scale-[0.98] disabled:opacity-70"
            >
              {isSaving ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
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
