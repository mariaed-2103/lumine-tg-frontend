import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { Wordmark } from "@/components/lumine/Wordmark";
import { Spark } from "@/components/lumine/Spark";
import { FieldError } from "@/components/lumine/FieldError";
import { apiPublicFetch } from "@/services/api";

import {
  validarEmail,
  validarNovaSenha,
  validarConfirmacaoSenha,
} from "@/lib/validation";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar Conta | Lumine" },
      {
        name: "description",
        content: "Crie sua conta no Lumine e organize os custos e rentabilidade do seu negócio de estética.",
      },
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
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState<string | undefined>();
  const [senhaError, setSenhaError] = useState<string | undefined>();
  const [confirmarSenhaError, setConfirmarSenhaError] =
    useState<string | undefined>();

  const [formError, setFormError] = useState<string | undefined>();
  const [isEmailCadastrado, setIsEmailCadastrado] = useState(false);

  function handleEmailChange(value: string) {
    setEmail(value);
    setEmailError(undefined);
    setFormError(undefined);
    setIsEmailCadastrado(false);
  }

  function handleSenhaChange(value: string) {
    setSenha(value);
    setSenhaError(undefined);
    setFormError(undefined);
  }

  function handleConfirmarSenhaChange(value: string) {
    setConfirmarSenha(value);
    setConfirmarSenhaError(undefined);
    setFormError(undefined);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError(undefined);
    setIsEmailCadastrado(false);

    const erroEmail = validarEmail(email);
    const erroSenha = validarNovaSenha(senha);
    const erroConfirmacao = validarConfirmacaoSenha(
      senha,
      confirmarSenha
    );

    setEmailError(erroEmail);
    setSenhaError(erroSenha);
    setConfirmarSenhaError(erroConfirmacao);

    if (
      erroEmail ||
      erroSenha ||
      erroConfirmacao
    ) {
      return;
    }

    try {
      setLoading(true);

      console.log("CADASTRO INICIADO");

      const response = await apiPublicFetch("/usuarios", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          senha: senha,
        }),
      });

      const texto = await response.text();

      console.log(
        "RESPOSTA DO CADASTRO:",
        response.status
      );

      console.log(
        "CONTEÚDO DA RESPOSTA:",
        texto
      );

      if (!response.ok) {
        let mensagemAmigavel = "Não foi possível realizar o cadastro. Tente novamente.";
        let emailJaExiste = false;

        try {
          const body = JSON.parse(texto);
          const rawMsg = body.mensagem ?? body.message ?? body.erro ?? body.error;
          if (rawMsg) {
            const rawLower = String(rawMsg).toLowerCase();
            if (rawLower.includes("já cadastrado") || rawLower.includes("ja cadastrado")) {
              mensagemAmigavel = "Este e-mail já está cadastrado.";
              emailJaExiste = true;
            } else {
              mensagemAmigavel = String(rawMsg);
            }
          }
        } catch {
          if (texto && !texto.startsWith("{") && !texto.startsWith("<")) {
            mensagemAmigavel = texto;
          }
        }

        if (
          response.status === 409 ||
          (response.status === 400 && texto.toLowerCase().includes("cadastrado"))
        ) {
          emailJaExiste = true;
          mensagemAmigavel = "Este e-mail já está cadastrado.";
        }

        setIsEmailCadastrado(emailJaExiste);
        setFormError(mensagemAmigavel);

        if (emailJaExiste) {
          setEmailError("Este e-mail já está em uso.");
        }

        return;
      }

      /*
       * O backend retorna:
       *
       * {
       *   "idUsuario": 1,
       *   "email": "email@exemplo.com"
       * }
       */

      const usuario = JSON.parse(texto);

      console.log(
        "USUÁRIO CADASTRADO:",
        usuario
      );

      /*
       * SALVA O ID DO USUÁRIO
       *
       * Esse ID será utilizado depois
       * para cadastrar o PerfilEmpresa.
       */

      localStorage.setItem(
        "idUsuario",
        String(usuario.idUsuario)
      );

      localStorage.setItem(
        "emailUsuario",
        usuario.email
      );

      // Se o endpoint de cadastro já retornar token, salva direto
      if (usuario.token) {
        localStorage.setItem("tokenLumine", usuario.token);
      } else {
        // Caso contrário, faz login automático para gerar e salvar o token JWT
        try {
          const loginResp = await apiPublicFetch("/usuarios/login", {
            method: "POST",
            body: JSON.stringify({
              email: email.trim(),
              senha: senha,
            }),
          });

          if (loginResp.ok) {
            const loginDados = await loginResp.json();
            if (loginDados.token) {
              localStorage.setItem("tokenLumine", loginDados.token);
            }
          }
        } catch (loginErr) {
          console.error("Erro ao autenticar automaticamente após cadastro:", loginErr);
        }
      }

      console.log(
        "ID DO USUÁRIO SALVO:",
        usuario.idUsuario
      );

      /*
       * Depois do cadastro do usuário,
       * vai para o cadastro do PerfilEmpresa.
       */

      void navigate({
        to: "/perfil-empresa",
        search: {
          onboarding: true,
        },
      });
    } catch (error) {
      console.error(
        "ERRO AO REALIZAR CADASTRO:",
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
            Crie sua conta
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre-se para começar a organizar seu negócio.
          </p>

          {formError && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-berry/30 bg-berry/5 p-4 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-berry/15 text-berry">
                  <AlertCircle size={16} />
                </div>
                <div className="flex-1 text-[13px]">
                  <p className="font-semibold text-wine">
                    {isEmailCadastrado ? "E-mail já cadastrado" : "Não foi possível cadastrar"}
                  </p>
                  <p className="mt-0.5 text-wine/80 leading-relaxed font-sans">
                    {isEmailCadastrado
                      ? "Já existe uma conta com este endereço de e-mail no Lumine."
                      : formError}
                  </p>
                  {isEmailCadastrado && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-3">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1 text-xs font-bold text-berry hover:text-wine underline underline-offset-2 transition-colors"
                      >
                        Entrar com minha conta &rarr;
                      </Link>
                      <Link
                        to="/recuperar-senha"
                        className="text-xs text-wine/70 hover:text-wine transition-colors"
                      >
                        Esqueceu a senha?
                      </Link>
                    </div>
                  )}
                </div>
              </div>
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
                  handleEmailChange(
                    event.target.value
                  )
                }
                onBlur={() => {
                  if (!isEmailCadastrado) {
                    setEmailError(
                      validarEmail(email)
                    );
                  }
                }}
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
                  type={
                    showSenha
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(event) =>
                    handleSenhaChange(
                      event.target.value
                    )
                  }
                  onBlur={() =>
                    setSenhaError(
                      validarNovaSenha(senha)
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
                    setShowSenha(
                      (valor) => !valor
                    )
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
            </div>

            <div>
              <label
                htmlFor="confirmarSenha"
                className="mb-1.5 block text-sm font-semibold text-wine"
              >
                Confirmar senha
              </label>

              <div className="relative">
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={
                    showConfirmarSenha
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(event) =>
                    handleConfirmarSenhaChange(
                      event.target.value
                    )
                  }
                  onBlur={() =>
                    setConfirmarSenhaError(
                      validarConfirmacaoSenha(
                        senha,
                        confirmarSenha
                      )
                    )
                  }
                  aria-invalid={Boolean(
                    confirmarSenhaError
                  )}
                  className={`${inputBase} pr-12 ${
                    confirmarSenhaError
                      ? "border-berry ring-4 ring-berry/15"
                      : "border-petal"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmarSenha(
                      (valor) => !valor
                    )
                  }
                  aria-label={
                    showConfirmarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-wine/60 transition hover:bg-pale hover:text-berry"
                >
                  {showConfirmarSenha ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <FieldError
                message={confirmarSenhaError}
              />
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

                  Cadastrando...
                </>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          <div className="mt-7 border-t border-petal/50 pt-5 text-center text-sm text-muted-foreground">
            Já possui uma conta?{" "}

            <Link
              to="/login"
              className="font-semibold text-berry transition hover:text-rose hover:underline"
            >
              Entrar
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
