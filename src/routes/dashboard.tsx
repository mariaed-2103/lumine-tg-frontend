import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";

/**
 * Placeholder da área logada.
 *
 * Rota pública apenas neste protótipo. Quando a autenticação real (JWT,
 * conforme RNF003) for integrada, esta e as demais rotas da área logada
 * (ex.: /perfil-empresa, /insumos, /procedimentos) devem virar rotas
 * protegidas — por exemplo, validando o token em um `beforeLoad` do
 * TanStack Router e redirecionando para /login quando a usuária não
 * estiver autenticada. /login, /cadastro, /recuperar-senha e
 * /redefinir-senha continuam públicas.
 */
export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Área logada | Lumine" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell mobileTitle="Início">
      <div className="flex min-h-[420px] w-full items-center justify-center rounded-[32px] border border-petal/40 bg-white p-8 text-center shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-semibold text-wine">
            Área logada
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Placeholder — em breve o dashboard financeiro do Lumine. Use o
            menu ao lado para navegar entre Insumos, Procedimentos e Perfil
            da Empresa.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
