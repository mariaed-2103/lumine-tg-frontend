import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";

interface AppShellProps {
  /** Título exibido na barra superior mobile (ex: "Insumos"). */
  mobileTitle?: string;
  children: ReactNode;
}

export function AppShell({ mobileTitle, children }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-pale p-3 font-sans antialiased selection:bg-petal selection:text-wine sm:p-6 lg:p-8">
      {/* Barra superior mobile, com botão de abrir o menu */}
      <header className="mb-4 flex items-center justify-between rounded-2xl border border-petal/40 bg-white px-4 py-3 shadow-xs lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-xl p-2 text-wine transition-colors hover:bg-pale"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
          <span className="font-display text-sm font-bold">Menu</span>
        </button>

        {mobileTitle && (
          <span className="font-display text-base font-bold capitalize text-wine">
            {mobileTitle}
          </span>
        )}

        <img
          src="/avatar-simbolo-berry.svg"
          alt="Lumine"
          className="h-8 w-8 shrink-0 rounded-xl shadow-xs"
        />
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-6 lg:flex-row">
        <Sidebar
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        <main className="w-full min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
