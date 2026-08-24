import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { z } from "zod";
import { Wordmark } from "@/components/lumine/Wordmark";
import { Spark } from "@/components/lumine/Spark";
import { PasswordStrengthIndicator } from "@/components/lumine/PasswordStrengthIndicator";
import { FieldError } from "@/components/lumine/FieldError";
import { validarNovaSenha, validarConfirmacaoSenha } from "@/lib/validation";


export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha | Lumine" },
      {
        name: "description",
        content: "Crie uma nova senha para acessar sua conta no Lumine.",
      },
      { property: "og:title", content: "Redefinir senha | Lumine" },
      {
        property: "og:description",
        content: "Crie uma nova senha para acessar sua conta no Lumine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: z.object({
    estado: z.enum(["form", "success", "invalid"]).optional(),
    token: z.string().optional(),
  }),
  component: RedefinirSenhaPage,
});

/**
 * Protótipo: sem backend real, o token só é usado para simular qual
 * estado a tela deve mostrar (RN pendente de validação real):
 * - sem token na URL, ou token contendo "expirado"/"invalido" → link inválido/expirado
 * - qualquer outro token → formulário de nova senha
 */
function resolveModeFromToken(token?: string): "form" | "invalid" {
  if (!token) return "invalid";
  const marcadoresInvalidos = ["expirado", "expired", "invalido", "invalid"];
  if (marcadoresInvalidos.some((marcador) => token.toLowerCase().includes(marcador)))
    return "invalid";
  return "form";
}

function RedefinirSenhaPage() {
  const search = Route.useSearch();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [errors, setErrors] = useState<{
    novaSenha?: string | undefined;
    confirmarNovaSenha?: string | undefined;
  }>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // "estado" continua disponível como atalho manual para QA/design;
  // por padrão, o estado é derivado do token recebido na URL.
  const mode =
    search.estado ?? (submitted ? "success" : resolveModeFromToken(search.token));

  function setFieldError(
    field: "novaSenha" | "confirmarNovaSenha",
    message?: string
  ) {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = {
      novaSenha: validarNovaSenha(novaSenha),
      confirmarNovaSenha: validarConfirmacaoSenha(confirmarNovaSenha, novaSenha),
    };

    setErrors(next);
    if (next.novaSenha || next.confirmarNovaSenha) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1400);
  }


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-12">
      {/* decorative sparks */}
      <Spark className="pointer-events-none absolute -left-10 top-16 h-40 w-40 text-petal/30" />
      <Spark className="pointer-events-none absolute -right-12 bottom-10 h-56 w-56 text-petal/25" />
      <Spark className="pointer-events-none absolute right-1/4 top-8 h-10 w-10 text-rose/25" />

      <div className="relative w-full max-w-md">
        <header className="mb-8 text-center">
          <Wordmark />
        </header>

        <section className="rounded-[28px] border border-petal/40 bg-white p-7 shadow-[0_20px_60px_-25px_rgba(107,21,48,0.35)] sm:p-9">
          {mode === "success" && <SuccessView />}
          {mode === "invalid" && <InvalidView />}
          {mode === "form" && (
            <FormView
              novaSenha={novaSenha}
              confirmarNovaSenha={confirmarNovaSenha}
              showNova={showNova}
              showConfirmar={showConfirmar}
              errors={errors}
              loading={loading}
              onNovaSenhaChange={(v) => {
                setNovaSenha(v);
                if (errors.novaSenha && !validarNovaSenha(v))
                  setFieldError("novaSenha", undefined);
                if (
                  errors.confirmarNovaSenha &&
                  confirmarNovaSenha &&
                  confirmarNovaSenha === v
                )
                  setFieldError("confirmarNovaSenha", undefined);
              }}
              onConfirmarChange={(v) => {
                setConfirmarNovaSenha(v);
                if (
                  errors.confirmarNovaSenha &&
                  !validarConfirmacaoSenha(v, novaSenha)
                )
                  setFieldError("confirmarNovaSenha", undefined);
              }}
              onBlurNova={() =>
                setFieldError("novaSenha", validarNovaSenha(novaSenha))
              }
              onBlurConfirmar={() =>
                setFieldError(
                  "confirmarNovaSenha",
                  validarConfirmacaoSenha(confirmarNovaSenha, novaSenha)
                )
              }
              onToggleNova={() => setShowNova((s) => !s)}
              onToggleConfirmar={() => setShowConfirmar((s) => !s)}
              onSubmit={handleSubmit}

            />
          )}
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lumine · Feito para quem cuida da beleza
        </p>
      </div>
    </main>
  );
}

const inputBase =
  "w-full rounded-2xl border bg-white px-4 py-3 font-sans text-ink placeholder:text-muted-foreground/70 transition outline-none focus:border-berry focus:ring-4 focus:ring-rose/25";

interface FormViewProps {
  novaSenha: string;
  confirmarNovaSenha: string;
  showNova: boolean;
  showConfirmar: boolean;
  errors: { novaSenha?: string | undefined; confirmarNovaSenha?: string | undefined };
  loading: boolean;
  onNovaSenhaChange: (value: string) => void;
  onConfirmarChange: (value: string) => void;
  onBlurNova: () => void;
  onBlurConfirmar: () => void;
  onToggleNova: () => void;
  onToggleConfirmar: () => void;
  onSubmit: (e: FormEvent) => void;
}

function FormView({
  novaSenha,
  confirmarNovaSenha,
  showNova,
  showConfirmar,
  errors,
  loading,
  onNovaSenhaChange,
  onConfirmarChange,
  onBlurNova,
  onBlurConfirmar,
  onToggleNova,
  onToggleConfirmar,
  onSubmit,

}: FormViewProps) {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-wine">
        Criar nova senha
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Defina uma nova senha para acessar sua conta.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
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
              type={showNova ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={novaSenha}
              onChange={(e) => onNovaSenhaChange(e.target.value)}
              onBlur={onBlurNova}
              aria-invalid={!!errors.novaSenha}
              className={`${inputBase} pr-12 ${errors.novaSenha ? "border-berry ring-4 ring-berry/15" : "border-petal"}`}
            />
            <button
              type="button"
              onClick={onToggleNova}
              aria-label={showNova ? "Ocultar nova senha" : "Mostrar nova senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-wine/60 transition hover:bg-pale hover:text-berry"
            >
              {showNova ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <FieldError message={errors.novaSenha} />

          <PasswordStrengthIndicator password={novaSenha} />
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
              onChange={(e) => onConfirmarChange(e.target.value)}
              onBlur={onBlurConfirmar}
              aria-invalid={!!errors.confirmarNovaSenha}
              className={`${inputBase} pr-12 ${errors.confirmarNovaSenha ? "border-berry ring-4 ring-berry/15" : "border-petal"}`}
            />
            <button
              type="button"
              onClick={onToggleConfirmar}
              aria-label={
                showConfirmar ? "Ocultar confirmação" : "Mostrar confirmação"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-wine/60 transition hover:bg-pale hover:text-berry"
            >
              {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <FieldError message={errors.confirmarNovaSenha} />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-berry px-4 py-3.5 font-sans text-sm font-bold text-white shadow-lg shadow-berry/25 transition hover:bg-wine focus:outline-none focus:ring-4 focus:ring-rose/35 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Salvando...
            </>
          ) : (
            "Redefinir senha"
          )}
        </button>
      </form>
    </>
  );
}

function SuccessView() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pale">
        <Check className="h-7 w-7 text-berry" strokeWidth={2.5} />
      </div>
      <h1 className="font-display text-2xl font-semibold text-wine">
        Senha redefinida com sucesso
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Você já pode entrar com sua nova senha.
      </p>
      <Link
        to="/login"
        className="mt-7 flex w-full items-center justify-center rounded-2xl bg-berry px-4 py-3.5 font-sans text-sm font-bold text-white shadow-lg shadow-berry/25 transition hover:bg-wine focus:outline-none focus:ring-4 focus:ring-rose/35"
      >
        Ir para o login
      </Link>
    </div>
  );
}

function InvalidView() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pale">
        <AlertCircle className="h-7 w-7 text-wine" strokeWidth={2.5} />
      </div>
      <h1 className="font-display text-2xl font-semibold text-wine">
        Este link não é mais válido
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        O link de redefinição expirou ou já foi utilizado. Solicite uma nova
        recuperação de senha.
      </p>
      <Link
        to="/recuperar-senha"
        className="mt-7 flex w-full items-center justify-center rounded-2xl bg-berry px-4 py-3.5 font-sans text-sm font-bold text-white shadow-lg shadow-berry/25 transition hover:bg-wine focus:outline-none focus:ring-4 focus:ring-rose/35"
      >
        Solicitar novo link
      </Link>
    </div>
  );
}
