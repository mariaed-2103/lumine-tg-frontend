import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Wordmark } from "@/components/lumine/Wordmark";
import { Spark } from "@/components/lumine/Spark";
import { FieldError } from "@/components/lumine/FieldError";
import { PasswordStrengthIndicator } from "@/components/lumine/PasswordStrengthIndicator";
import {
  validarEmailCadastro,
  validarNovaSenha,
  validarConfirmacaoSenha,
} from "@/lib/validation";


export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta | Lumine" },
      {
        name: "description",
        content:
          "Crie sua conta no Lumine e comece a organizar a precificação dos seus serviços de estética.",
      },
      { property: "og:title", content: "Criar conta | Lumine" },
      {
        property: "og:description",
        content: "Cadastro gratuito para profissionais autônomas de estética.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string | undefined;
    senha?: string | undefined;
    confirmarSenha?: string | undefined;
  }>({});

  type Campo = "email" | "senha" | "confirmarSenha";

  function setFieldError(field: Campo, message?: string) {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (errors.email && !validarEmailCadastro(value))
      setFieldError("email", undefined);
  }

  function handleSenhaChange(value: string) {
    setSenha(value);
    if (errors.senha && !validarNovaSenha(value)) setFieldError("senha", undefined);
    if (errors.confirmarSenha && confirmarSenha && confirmarSenha === value)
      setFieldError("confirmarSenha", undefined);
  }

  function handleConfirmarChange(value: string) {
    setConfirmarSenha(value);
    if (errors.confirmarSenha && !validarConfirmacaoSenha(value, senha))
      setFieldError("confirmarSenha", undefined);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = {
      email: validarEmailCadastro(email),
      senha: validarNovaSenha(senha),
      confirmarSenha: validarConfirmacaoSenha(confirmarSenha, senha),
    };

    setErrors(next);
    if (next.email || next.senha || next.confirmarSenha) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      // Protótipo: sem backend, o cadastro sempre segue para o login,
      // exibindo a mensagem de sucesso lá (?cadastro=sucesso).
      void navigate({ to: "/login", search: { cadastro: "sucesso" } });
    }, 1600);
  }


  const inputBase =
    "w-full rounded-2xl border bg-white px-4 py-3 font-sans text-ink placeholder:text-muted-foreground/70 transition outline-none focus:border-berry focus:ring-4 focus:ring-rose/25";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-12">
      {/* decorative sparks */}
      <Spark className="pointer-events-none absolute -left-10 top-16 h-40 w-40 text-petal/30" />
      <Spark className="pointer-events-none absolute -right-12 bottom-10 h-56 w-56 text-petal/25" />
      <Spark className="pointer-events-none absolute right-1/4 top-8 h-10 w-10 text-rose/25" />

      <div className="relative w-full max-w-md">
        <header className="mb-8 text-center">
          <Wordmark />
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Crie sua conta e comece a organizar sua precificação
          </p>
        </header>

        <section className="rounded-[28px] border border-petal/40 bg-white p-7 shadow-[0_20px_60px_-25px_rgba(107,21,48,0.35)] sm:p-9">
          <h1 className="font-display text-2xl font-semibold text-wine">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha os dados abaixo para acessar o Lumine.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-wine">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => setFieldError("email", validarEmailCadastro(email))}
                aria-invalid={!!errors.email}
                className={`${inputBase} ${errors.email ? "border-berry ring-4 ring-berry/15" : "border-petal"}`}
              />
              <FieldError message={errors.email} />
            </div>

            <div>
              <label htmlFor="senha" className="mb-1.5 block text-sm font-semibold text-wine">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  name="senha"
                  type={showSenha ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => handleSenhaChange(e.target.value)}
                  onBlur={() => setFieldError("senha", validarNovaSenha(senha))}
                  aria-invalid={!!errors.senha}
                  className={`${inputBase} pr-12 ${errors.senha ? "border-berry ring-4 ring-berry/15" : "border-petal"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((v) => !v)}
                  aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-wine/60 transition hover:bg-pale hover:text-berry"
                >
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldError message={errors.senha} />

              <PasswordStrengthIndicator password={senha} />
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="mb-1.5 block text-sm font-semibold text-wine">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={showConfirmar ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(e) => handleConfirmarChange(e.target.value)}
                  onBlur={() =>
                    setFieldError(
                      "confirmarSenha",
                      validarConfirmacaoSenha(confirmarSenha, senha)
                    )
                  }
                  aria-invalid={!!errors.confirmarSenha}
                  className={`${inputBase} pr-12 ${errors.confirmarSenha ? "border-berry ring-4 ring-berry/15" : "border-petal"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar((v) => !v)}
                  aria-label={showConfirmar ? "Ocultar confirmação" : "Mostrar confirmação"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-wine/60 transition hover:bg-pale hover:text-berry"
                >
                  {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldError message={errors.confirmarSenha} />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-berry px-4 py-3.5 font-sans text-sm font-bold text-white shadow-lg shadow-berry/25 transition hover:bg-wine focus:outline-none focus:ring-4 focus:ring-rose/35 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          <div className="mt-7 border-t border-petal/50 pt-5 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="font-semibold text-berry transition hover:text-rose hover:underline"
            >
              Fazer login
            </Link>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lumine · Feito para quem cuida da beleza
        </p>
      </div>
    </main>
  );
}
