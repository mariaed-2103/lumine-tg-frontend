import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/lumine/Wordmark";
import { Spark } from "@/components/lumine/Spark";
import { FieldError } from "@/components/lumine/FieldError";
import { validarEmail } from "@/lib/validation";


export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha | Lumine" },
      {
        name: "description",
        content:
          "Recupere o acesso ao Lumine informando seu e-mail cadastrado.",
      },
      { property: "og:title", content: "Recuperar senha | Lumine" },
      {
        property: "og:description",
        content: "Redefina sua senha do Lumine com segurança.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecuperarSenhaPage,
});

function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = validarEmail(email);
    setError(message ?? null);
    if (message) return;

    // RN003: a tela sempre segue para a confirmação, exista ou não o e-mail.
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
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
        </header>

        <section className="rounded-[28px] border border-petal/40 bg-white p-7 shadow-[0_20px_60px_-25px_rgba(107,21,48,0.35)] sm:p-9">
          {!sent ? (
            <>
              <h1 className="font-display text-2xl font-semibold text-wine">
                Recuperar senha
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Informe o e-mail cadastrado e enviaremos as instruções para redefinir sua senha.
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);
                      if (error && !validarEmail(value)) setError(null);
                    }}
                    onBlur={() => setError(validarEmail(email) ?? null)}
                    aria-invalid={!!error}
                    className={`${inputBase} ${error ? "border-berry ring-4 ring-berry/15" : "border-petal"}`}
                  />
                  <FieldError message={error ?? undefined} />

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-berry px-4 py-3.5 font-sans text-sm font-bold text-white shadow-lg shadow-berry/25 transition hover:bg-wine focus:outline-none focus:ring-4 focus:ring-rose/35 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instruções"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-berry transition hover:text-rose hover:underline"
                >
                  <ArrowLeft size={16} />
                  Voltar para o login
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pale">
                <Mail className="h-7 w-7 text-berry" />
              </div>
              <h1 className="text-center font-display text-2xl font-semibold text-wine">
                Verifique seu e-mail
              </h1>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Se o e-mail informado estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setLoading(false);
                }}
                className="mt-7 w-full rounded-2xl border border-berry bg-transparent px-4 py-3.5 font-sans text-sm font-bold text-berry transition hover:bg-pale focus:outline-none focus:ring-4 focus:ring-rose/35"
              >
                Reenviar e-mail
              </button>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-berry transition hover:text-rose hover:underline"
                >
                  <ArrowLeft size={16} />
                  Voltar para o login
                </Link>
              </div>
            </>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lumine · Feito para quem cuida da beleza
        </p>
      </div>
    </main>
  );
}
