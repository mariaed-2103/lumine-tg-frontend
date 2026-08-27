import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { Wordmark } from "@/components/lumine/Wordmark";
import { Spark } from "@/components/lumine/Spark";
import { FieldError } from "@/components/lumine/FieldError";

import {
  validarEmail,
  validarSenhaObrigatoria,
} from "@/lib/validation";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState<string | undefined>();
  const [senhaError, setSenhaError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  function handleEmailChange(value: string) {
    setEmail(value);
    setEmailError(undefined);
    setFormError(undefined);
  }

  function handleSenhaChange(value: string) {
    setSenha(value);
    setSenhaError(undefined);
    setFormError(undefined);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const erroEmail = validarEmail(email);
    const erroSenha = validarSenhaObrigatoria(senha);

    setEmailError(erroEmail);
    setSenhaError(erroSenha);

    if (erroEmail || erroSenha) {
      return;
    }

    try {
      setLoading(true);
      setFormError(undefined);

      const response = await fetch(
        "http://localhost:8080/usuarios/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            senha: senha,
          }),
        }
      );

      const texto = await response.text();

      if (!response.ok) {
        setFormError(
          texto || "E-mail ou senha incorretos."
        );

        return;
      }

      const usuario = JSON.parse(texto);

      // Salva o ID do usuário logado
      localStorage.setItem(
        "idUsuario",
        String(usuario.idUsuario)
      );

      // Salva também o e-mail
      localStorage.setItem(
        "emailUsuario",
        usuario.email
      );

      console.log("Usuário logado:", usuario);
      console.log(
        "ID salvo:",
        usuario.idUsuario
      );

      void navigate({
        to: "/dashboard",
      });
    } catch (error) {
      console.error(
        "Erro ao fazer login:",
        error
      );

      setFormError(
        "Não foi possível conectar ao backend."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-2xl border bg-white px-4 py-3 font-sans text-ink placeholder:text-muted-foreground/70 transition outline-none focus:border-berry focus:ring-4 focus:ring-rose/25";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-12">
      <Spark
        className="pointer-events-none absolute -left-10 top-16 h-40 w-40 text-petal/30"
      />

      <Spark
        className="pointer-events-none absolute -right-12 bottom-10 h-56 w-56 text-petal/25"
      />

      <Spark
        className="pointer-events-none absolute right-1/4 top-8 h-10 w-10 text-rose/25"
      />

      <div className="relative w-full max-w-md">
        <header className="mb-8 text-center">
          <Wordmark />

          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Gestão de custos e rentabilidade para profissionais de estética
          </p>
        </header>

        <section className="rounded-[28px] border border-petal/40 bg-white p-7 shadow-[0_20px_60px_-25px_rgba(107,21,48,0.35)] sm:p-9">
          <h1 className="font-display text-2xl font-semibold text-wine">
            Bem-vinda de volta
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Entre para acompanhar seus serviços e lucros.
          </p>

          {formError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-2xl border border-berry/40 bg-berry/5 p-3.5"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-berry"
              />

              <p className="font-sans text-[13px] font-semibold text-berry">
                {formError}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-7 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-wine"
              >
                E-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(event) =>
                  handleEmailChange(event.target.value)
                }
                onBlur={() =>
                  setEmailError(validarEmail(email))
                }
                aria-invalid={Boolean(emailError)}
                className={`${inputBase} ${
                  emailError
                    ? "border-berry ring-4 ring-berry/15"
                    : "border-petal"
                }`}
              />

              <FieldError message={emailError} />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="mb-1.5 block text-sm font-semibold text-wine"
              >
                Senha
              </label>

              <div className="relative">
                <input
                  id="senha"
                  name="senha"
                  type={showSenha ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(event) =>
                    handleSenhaChange(event.target.value)
                  }
                  onBlur={() =>
                    setSenhaError(
                      validarSenhaObrigatoria(senha)
                    )
                  }
                  aria-invalid={Boolean(senhaError)}
                  className={`${inputBase} pr-12 ${
                    senhaError
                      ? "border-berry ring-4 ring-berry/15"
                      : "border-petal"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowSenha((valor) => !valor)
                  }
                  aria-label={
                    showSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-wine/60 transition hover:bg-pale hover:text-berry"
                >
                  {showSenha ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <FieldError message={senhaError} />

              <div className="mt-2 text-right">
                <Link
                  to="/recuperar-senha"
                  className="text-sm font-semibold text-berry transition hover:text-rose hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-berry px-4 py-3.5 font-sans text-sm font-bold text-white shadow-lg shadow-berry/25 transition hover:bg-wine focus:outline-none focus:ring-4 focus:ring-rose/35 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-7 border-t border-petal/50 pt-5 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}

            <Link
              to="/cadastro"
              className="font-semibold text-berry transition hover:text-rose hover:underline"
            >
              Cadastre-se
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