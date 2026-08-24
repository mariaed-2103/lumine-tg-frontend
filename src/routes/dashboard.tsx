import { createFileRoute } from "@tanstack/react-router";

/**
 * Placeholder da área logada.
 *
 * Rota pública apenas neste protótipo. Quando a autenticação real (JWT,
 * conforme RNF003) for integrada, esta e as demais rotas da área logada
 * (ex.: /perfil-empresa) devem virar rotas protegidas — por exemplo,
 * validando o token em um `beforeLoad` do TanStack Router e redirecionando
 * para /login quando a usuária não estiver autenticada. /login, /cadastro,
 * /recuperar-senha e /redefinir-senha continuam públicas.
 */
export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Área logada | Lumine" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-wine">
          Área logada
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Placeholder — em breve o dashboard do Lumine.
        </p>
      </div>
    </main>
  );
}
