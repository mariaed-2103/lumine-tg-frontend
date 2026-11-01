import { useState, type ReactNode } from "react";
import { Heart, Menu } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Wordmark } from "@/components/lumine/Wordmark";

interface AppShellProps {
  /** Título exibido na barra superior mobile (ex: "Insumos"). */
  mobileTitle?: string;
  children: ReactNode;
}

export function AppShell({ mobileTitle, children }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="lumine-bg flex min-h-screen flex-col p-4 pb-0 font-sans antialiased selection:bg-petal selection:text-wine sm:p-6 sm:pb-0 lg:p-10 lg:pb-0">
      {/* Barra superior mobile, com botão de abrir o menu */}
      <header className="glass mb-4 flex items-center justify-between rounded-2xl px-4 py-3 lg:hidden">
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

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-6 lg:flex-row lg:gap-8">
        <Sidebar isMobileOpen={isMobileNavOpen} onCloseMobile={() => setIsMobileNavOpen(false)} />

        <main className="w-full min-w-0 flex-1">{children}</main>
      </div>
      <footer className="-mx-4 mt-8 border-t border-petal/30 bg-white/90 px-4 py-3 sm:-mx-6 sm:px-6 sm:py-3.5 lg:-mx-10 lg:px-10">
        <div className="flex min-h-10 w-full flex-wrap items-center justify-start gap-x-3 gap-y-1 text-left">
          <Wordmark className="text-lg sm:text-lg" />
          <p className="flex flex-wrap items-center justify-start gap-x-1 text-xs text-wine/55">
            Feito com carinho por Maria Eduarda Zinatto de Siqueira e Júlia Dias Mendes
            <Heart aria-label="amor" className="h-3 w-3 fill-berry text-berry" />
          </p>
        </div>
      </footer>
    </div>
  );
}
