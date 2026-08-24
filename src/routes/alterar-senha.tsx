import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Check, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alterar-senha")({
  head: () => ({
    meta: [
      { title: "Alterar senha | Lumine" },
      {
        name: "description",
        content: "Altere sua senha de acesso ao Lumine com segurança.",
      },
      { property: "og:title", content: "Alterar senha | Lumine" },
      {
        property: "og:description",
        content: "Redefina sua senha de acesso ao Lumine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AlterarSenhaPage,
});

const inputBase =
  "w-full rounded-2xl border bg-white px-4 py-3 font-sans text-ink placeholder:text-muted-foreground/70 transition outline-none focus:border-berry focus:ring-4 focus:ring-rose/25";

function strengthInfo(value: string) {
  const length = value.length;
  if (length === 0) return null;
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  if (length >= 10 && hasNumber && hasSymbol) {
    return { label: "Forte", color: "bg-berry", width: "100%" };
  }
  if (length >= 8 && (hasNumber || hasSymbol)) {
    return { label: "Média", color: "bg-rose", width: "66%" };
  }
  return { label: "Fraca", color: "bg-petal", width: "33%" };
}

function AlterarSenhaPage() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const [errors, setErrors] = useState<{
    senhaAtual?: string | undefined;
    novaSenha?: string | undefined;
    confirmarNovaSenha?: string | undefined;
  }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => strengthInfo(novaSenha), [novaSenha]);

  function resetForm() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarNovaSenha("");
    setShowSenhaAtual(false);
    setShowNovaSenha(false);
    setShowConfirmar(false);
    setErrors({});
    setSuccess(false);
  }

  function handleCancel() {
    resetForm();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const next: typeof errors = {};
    if (!senhaAtual) {
      next.senhaAtual = "Senha atual obrigatória";
    } else if (senhaAtual !== "lumine123") {
      // Demo-only check so the visual error can be shown
      next.senhaAtual = "Senha atual incorreta";
    }
    if (!novaSenha) {
      next.novaSenha = "Nova senha obrigatória";
    } else if (novaSenha.length < 6) {
      next.novaSenha = "A senha deve ter no mínimo 6 caracteres";
    }
    if (!confirmarNovaSenha) {
      next.confirmarNovaSenha = "Confirme a nova senha";
    } else if (confirmarNovaSenha !== novaSenha) {
      next.confirmarNovaSenha = "As senhas não coincidem";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1400);
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-10 sm:py-14">
      <header className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-wine">
          Alterar senha
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina uma nova senha de acesso
        </p>
      </header>

      <section className="mx-auto mt-8 max-w-2xl">
        <div className="rounded-[28px] border border-petal/40 bg-white p-7 shadow-[0_20px_60px_-25px_rgba(107,21,48,0.25)] sm:p-9">
          {/* Placeholder for breadcrumb / back navigation once the logged-in layout exists */}
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
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
            <span className="font-medium text-wine">Alterar senha</span>
          </div>

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-pale p-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-berry text-white">
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <p className="text-sm font-semibold text-wine">
                  Senha alterada com sucesso
                </p>
                <p className="text-xs text-muted-foreground">
                  Use sua nova senha no próximo acesso.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="senhaAtual"
                className="mb-1.5 block text-sm font-semibold text-wine"
              >
                Senha atual
              </label>
              <div className="relative">
                <input
                  id="senhaAtual"
                  name="senhaAtual"
                  type={showSenhaAtual ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={senhaAtual}
                  onChange={(e) => {
                    setSenhaAtual(e.target.value);
                    if (errors.senhaAtual) {
                      setErrors((prev) => ({ ...prev, senhaAtual: undefined }));
                    }
                    if (success) setSuccess(false);
                  }}
                  aria-invalid={!!errors.senhaAtual}
                  className={cn(
                    inputBase,
                    "pr-12",
                    errors.senhaAtual
                      ? "border-berry ring-4 ring-berry/15"
                      : "border-petal"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowSenhaAtual((v) => !v)}
                  aria-label={
                    showSenhaAtual ? "Ocultar senha atual" : "Mostrar senha atual"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-wine/60 transition hover:bg-pale hover:text-berry"
                >
                  {showSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.senhaAtual && (
                <p className="mt-1.5 text-xs font-medium text-berry">
                  {errors.senhaAtual}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="novaSenha"
                className="mb-1.5 block text-sm font-semibold text-wine"
              >
                Nova senha
              </label>
              <div className="relative">
                <input
                  id="novaSenha"
                  name="novaSenha"
                  type={showNovaSenha ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    if (errors.novaSenha) {
                      setErrors((prev) => ({ ...prev, novaSenha: undefined }));
                    }
                    if (success) setSuccess(false);
                  }}
                  aria-invalid={!!errors.novaSenha}
                  className={cn(
                    inputBase,
                    "pr-12",
                    errors.novaSenha
                      ? "border-berry ring-4 ring-berry/15"
                      : "border-petal"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNovaSenha((v) => !v)}
                  aria-label={
                    showNovaSenha ? "Ocultar nova senha" : "Mostrar nova senha"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-wine/60 transition hover:bg-pale hover:text-berry"
                >
                  {showNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.novaSenha && (
                <p className="mt-1.5 text-xs font-medium text-berry">
                  {errors.novaSenha}
                </p>
              )}

              {strength && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Força da senha</span>
                    <span className={cn("font-semibold", strength.label === "Forte" ? "text-berry" : strength.label === "Média" ? "text-rose" : "text-petal")}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-pale">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", strength.color)}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmarNovaSenha"
                className="mb-1.5 block text-sm font-semibold text-wine"
              >
                Confirmar nova senha
              </label>
              <div className="relative">
                <input
                  id="confirmarNovaSenha"
                  name="confirmarNovaSenha"
                  type={showConfirmar ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmarNovaSenha}
                  onChange={(e) => {
                    setConfirmarNovaSenha(e.target.value);
                    if (errors.confirmarNovaSenha) {
                      setErrors((prev) => ({
                        ...prev,
                        confirmarNovaSenha: undefined,
                      }));
                    }
                    if (success) setSuccess(false);
                  }}
                  aria-invalid={!!errors.confirmarNovaSenha}
                  className={cn(
                    inputBase,
                    "pr-12",
                    errors.confirmarNovaSenha
                      ? "border-berry ring-4 ring-berry/15"
                      : "border-petal"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar((v) => !v)}
                  aria-label={
                    showConfirmar
                      ? "Ocultar confirmação de senha"
                      : "Mostrar confirmação de senha"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-wine/60 transition hover:bg-pale hover:text-berry"
                >
                  {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmarNovaSenha && (
                <p className="mt-1.5 text-xs font-medium text-berry">
                  {errors.confirmarNovaSenha}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
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
                  "Salvar nova senha"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
