import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, type FormEvent } from "react";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Check,
  Calculator,
  Upload,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldError } from "@/components/lumine/FieldError";
import {
  validarObrigatorio,
  validarTelefone,
  validarCnpj,
  validarDiasMes,
  validarHorasDia,
} from "@/lib/validation";


export const Route = createFileRoute("/perfil-empresa")({
  head: () => ({
    meta: [
      { title: "Perfil da Empresa | Lumine" },
      {
        name: "description",
        content:
          "Cadastre e edite os dados do seu negócio e sua capacidade operacional no Lumine.",
      },
      { property: "og:title", content: "Perfil da Empresa | Lumine" },
      {
        property: "og:description",
        content:
          "Dados do negócio e capacidade de atendimento usados para calcular seus custos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerfilEmpresaPage,
});

const inputBase =
  "w-full rounded-2xl border bg-white px-4 py-3 font-sans text-ink placeholder:text-muted-foreground/70 transition outline-none focus:border-berry focus:ring-4 focus:ring-rose/25";

const DADOS_EXISTENTES = {
  nomeProfissional: "Marina Alves",
  nomeClinica: "Lumine Estética Avançada",
  telefone: "(11) 98765-4321",
  cnpj: "12.345.678/0001-90",
  diasTrabalhadosMes: "22",
  horasDisponiveisDia: "6.5",
};

function maskTelefone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskCnpj(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 14);
  let out = d.slice(0, 2);
  if (d.length > 2) out += `.${d.slice(2, 5)}`;
  if (d.length > 5) out += `.${d.slice(5, 8)}`;
  if (d.length > 8) out += `/${d.slice(8, 12)}`;
  if (d.length > 12) out += `-${d.slice(12, 14)}`;
  return out;
}

type FormData = typeof DADOS_EXISTENTES;
type Errors = Partial<Record<keyof FormData, string | undefined>>;

function PerfilEmpresaPage() {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [form, setForm] = useState<FormData>({ ...DADOS_EXISTENTES });
  const [logotipo, setLogotipo] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const horasMes = useMemo(() => {
    const dias = parseInt(form.diasTrabalhadosMes || "0", 10);
    const horas = parseFloat((form.horasDisponiveisDia || "0").replace(",", "."));
    if (!dias || !horas || Number.isNaN(dias) || Number.isNaN(horas)) return null;
    const total = dias * horas;
    return Number.isInteger(total) ? String(total) : total.toFixed(1);
  }, [form.diasTrabalhadosMes, form.horasDisponiveisDia]);

  function validarCampo(field: keyof FormData, value: string) {
    switch (field) {
      case "nomeProfissional":
        return validarObrigatorio(value, "Nome da profissional é obrigatório");
      case "nomeClinica":
        return validarObrigatorio(value, "Nome da clínica é obrigatório");
      case "telefone":
        return validarTelefone(value);
      case "cnpj":
        return validarCnpj(value);
      case "diasTrabalhadosMes":
        return validarDiasMes(value);
      case "horasDisponiveisDia":
        return validarHorasDia(value);
      default:
        return undefined;
    }
  }

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // O erro some assim que o valor volta a ser válido, sem esperar o blur.
    if (errors[field] && !validarCampo(field, value))
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (success) setSuccess(false);
  }

  function handleBlur(field: keyof FormData) {
    setErrors((prev) => ({ ...prev, [field]: validarCampo(field, form[field]) }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogotipo(URL.createObjectURL(file));
  }

  function enterEditMode() {
    setSuccess(false);
    setErrors({});
    setMode("edit");
  }

  function cancelEdit() {
    setForm({ ...DADOS_EXISTENTES });
    setLogotipo("");
    setErrors({});
    setSuccess(false);
    setMode("view");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess(false);

    const next: Errors = {};
    (Object.keys(form) as (keyof FormData)[]).forEach((field) => {
      const message = validarCampo(field, form[field]);
      if (message) next[field] = message;
    });

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setMode("view");
    }, 1400);
  }


  const fieldClass = (err?: string) =>
    cn(inputBase, err ? "border-berry ring-4 ring-berry/15" : "border-petal");

  const avatar = (
    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-pale bg-pale">
      {logotipo ? (
        <img
          src={logotipo}
          alt="Logotipo da clínica"
          className="h-full w-full object-cover"
        />
      ) : (
        <Camera size={30} className="text-berry/70" />
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-cream px-4 py-10 sm:py-14">
      {/* Espaço reservado para o menu/sidebar do sistema */}
      <header className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 opacity-60 transition hover:bg-pale"
            aria-label="Voltar (reservado para navegação futura)"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <span className="text-petal">/</span>
          <span className="font-medium text-wine">Perfil da Empresa</span>
        </div>
        <h1 className="font-display text-3xl font-semibold text-wine">
          Perfil da Empresa
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Esses dados são usados para calcular seus custos e identificar seu
          negócio no sistema
        </p>
      </header>

      {success && (
        <div
          role="status"
          className="mx-auto mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-petal/50 bg-pale p-4"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-berry text-white">
            <Check size={14} strokeWidth={3} />
          </div>
          <p className="text-sm font-semibold text-wine">
            Perfil atualizado com sucesso
          </p>
        </div>
      )}

      <section className="mx-auto mt-6 max-w-3xl rounded-[28px] border border-petal/40 bg-white p-7 shadow-[0_20px_60px_-25px_rgba(107,21,48,0.25)] sm:p-9">
        {mode === "view" ? (
          <div className="transition-opacity duration-300">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-start">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="shrink-0">{avatar}</div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-wine">
                    {form.nomeClinica}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {form.nomeProfissional}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={enterEditMode}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-berry bg-transparent px-5 py-3 font-sans text-sm font-bold text-berry transition hover:bg-pale focus:outline-none focus:ring-4 focus:ring-rose/35 sm:w-auto"
              >
                <Pencil size={16} />
                Editar perfil
              </button>
            </div>

            <div className="mt-9 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-petal/30 bg-cream/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Telefone/WhatsApp
                </p>
                <p className="mt-1 text-base font-semibold text-wine">
                  {form.telefone}
                </p>
              </div>

              <div className="rounded-2xl border border-petal/30 bg-cream/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  CNPJ
                </p>
                <p
                  className={cn(
                    "mt-1 text-base font-semibold",
                    form.cnpj ? "text-wine" : "text-muted-foreground/70"
                  )}
                >
                  {form.cnpj || "Não informado"}
                </p>
              </div>

              <div className="rounded-2xl border border-petal/30 bg-cream/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dias trabalhados por mês
                </p>
                <p className="mt-1 text-base font-semibold text-wine">
                  {form.diasTrabalhadosMes} dias
                </p>
              </div>

              <div className="rounded-2xl border border-petal/30 bg-cream/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Horas disponíveis por dia
                </p>
                <p className="mt-1 text-base font-semibold text-wine">
                  {form.horasDisponiveisDia} horas
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-pale p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-berry">
                <Calculator size={16} />
              </div>
              <p className="text-sm text-wine">
                Isso representa até{" "}
                <span className="font-bold">{horasMes ?? "—"}</span> horas
                disponíveis por mês
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="transition-opacity duration-300"
          >
            {/* Seção 1 — Dados da Empresa */}
            <div className="border-b border-petal/30 pb-8">
              <h2 className="font-display text-xl font-semibold text-wine">
                Dados da Empresa
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Informações de identificação do seu negócio.
              </p>

              <div className="mt-7 flex flex-col items-center gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    aria-label="Enviar logotipo"
                    className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-pale bg-pale transition focus:outline-none focus:ring-4 focus:ring-rose/35"
                  >
                    {logotipo ? (
                      <img
                        src={logotipo}
                        alt="Logotipo da clínica"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera size={30} className="text-berry/70" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-wine/30 opacity-0 transition group-hover:opacity-100">
                      <Camera size={30} className="text-white" />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    aria-label="Enviar logotipo"
                    className="absolute bottom-0 right-0 rounded-full bg-berry p-2 text-white shadow-lg shadow-berry/30 transition hover:bg-wine focus:outline-none focus:ring-4 focus:ring-rose/35"
                  >
                    <Upload size={14} />
                  </button>
                </div>
                <input
                  ref={fileRef}
                  id="logotipo"
                  name="logotipo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFile}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl px-3 py-1.5 font-sans text-sm font-bold text-berry transition hover:bg-pale focus:outline-none focus:ring-4 focus:ring-rose/35"
                >
                  Alterar logotipo
                </button>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="nomeProfissional"
                    className="mb-1.5 block text-sm font-semibold text-wine"
                  >
                    Nome da profissional
                  </label>
                  <input
                    id="nomeProfissional"
                    name="nomeProfissional"
                    type="text"
                    maxLength={150}
                    autoComplete="name"
                    placeholder="Como você quer ser chamada"
                    value={form.nomeProfissional}
                    onChange={(e) => update("nomeProfissional", e.target.value)}
                    onBlur={() => handleBlur("nomeProfissional")}
                    aria-invalid={!!errors.nomeProfissional}
                    className={fieldClass(errors.nomeProfissional)}
                  />
                  <FieldError message={errors.nomeProfissional} />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="nomeClinica"
                    className="mb-1.5 block text-sm font-semibold text-wine"
                  >
                    Nome da clínica
                  </label>
                  <input
                    id="nomeClinica"
                    name="nomeClinica"
                    type="text"
                    maxLength={150}
                    placeholder="Nome do seu espaço"
                    value={form.nomeClinica}
                    onChange={(e) => update("nomeClinica", e.target.value)}
                    onBlur={() => handleBlur("nomeClinica")}
                    aria-invalid={!!errors.nomeClinica}
                    className={fieldClass(errors.nomeClinica)}
                  />
                  <FieldError message={errors.nomeClinica} />
                </div>

                <div>
                  <label
                    htmlFor="telefone"
                    className="mb-1.5 block text-sm font-semibold text-wine"
                  >
                    Telefone/WhatsApp
                  </label>
                  <input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    inputMode="tel"
                    maxLength={20}
                    placeholder="(00) 00000-0000"
                    value={form.telefone}
                    onChange={(e) => update("telefone", maskTelefone(e.target.value))}
                    onBlur={() => handleBlur("telefone")}
                    aria-invalid={!!errors.telefone}
                    className={fieldClass(errors.telefone)}
                  />
                  <FieldError message={errors.telefone} />
                </div>

                <div>
                  <label
                    htmlFor="cnpj"
                    className="mb-1.5 block text-sm font-semibold text-wine"
                  >
                    CNPJ{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </label>
                  <input
                    id="cnpj"
                    name="cnpj"
                    type="text"
                    inputMode="numeric"
                    maxLength={18}
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={(e) => update("cnpj", maskCnpj(e.target.value))}
                    onBlur={() => handleBlur("cnpj")}
                    aria-invalid={!!errors.cnpj}
                    className={fieldClass(errors.cnpj)}
                  />
                  <FieldError message={errors.cnpj} />
                </div>
              </div>
            </div>

            {/* Seção 2 — Capacidade Operacional */}
            <div className="pt-8">
              <h2 className="font-display text-xl font-semibold text-wine">
                Capacidade Operacional
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Esses dados definem sua capacidade de atendimento e são usados
                para calcular o custo fixo de cada procedimento.
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="diasTrabalhadosMes"
                    className="mb-1.5 block text-sm font-semibold text-wine"
                  >
                    Dias trabalhados por mês
                  </label>
                  <div className="relative">
                    <input
                      id="diasTrabalhadosMes"
                      name="diasTrabalhadosMes"
                      type="number"
                      min={1}
                      max={31}
                      step={1}
                      inputMode="numeric"
                      placeholder="22"
                      value={form.diasTrabalhadosMes}
                      onChange={(e) =>
                        update("diasTrabalhadosMes", e.target.value)
                      }
                      onBlur={() => handleBlur("diasTrabalhadosMes")}
                      aria-invalid={!!errors.diasTrabalhadosMes}
                      className={cn(
                        fieldClass(errors.diasTrabalhadosMes),
                        "pr-16"
                      )}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      dias
                    </span>
                  </div>
                  <FieldError message={errors.diasTrabalhadosMes} />
                </div>

                <div>
                  <label
                    htmlFor="horasDisponiveisDia"
                    className="mb-1.5 block text-sm font-semibold text-wine"
                  >
                    Horas disponíveis por dia
                  </label>
                  <div className="relative">
                    <input
                      id="horasDisponiveisDia"
                      name="horasDisponiveisDia"
                      type="number"
                      min={0.5}
                      max={24}
                      step={0.5}
                      inputMode="decimal"
                      placeholder="6.5"
                      value={form.horasDisponiveisDia}
                      onChange={(e) =>
                        update("horasDisponiveisDia", e.target.value)
                      }
                      onBlur={() => handleBlur("horasDisponiveisDia")}
                      aria-invalid={!!errors.horasDisponiveisDia}
                      className={cn(
                        fieldClass(errors.horasDisponiveisDia),
                        "pr-20"
                      )}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      horas
                    </span>
                  </div>
                  <FieldError message={errors.horasDisponiveisDia} />
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-pale p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-berry">
                  <Calculator size={16} />
                </div>
                <p className="text-sm text-wine">
                  Isso representa até{" "}
                  <span className="font-bold">{horasMes ?? "—"}</span> horas
                  disponíveis por mês
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-berry bg-transparent px-5 py-3 font-sans text-sm font-bold text-berry transition hover:bg-pale focus:outline-none focus:ring-4 focus:ring-rose/35 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-berry px-5 py-3 font-sans text-sm font-bold text-white shadow-lg shadow-berry/25 transition hover:bg-wine focus:outline-none focus:ring-4 focus:ring-rose/35 disabled:cursor-not-allowed disabled:opacity-80 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
