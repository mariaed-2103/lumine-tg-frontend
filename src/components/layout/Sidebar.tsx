import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Package, Wallet, X, ChevronRight, Building2 } from "lucide-react";

import { listarInsumos } from "@/services/insumoService";
import { listarProcedimentos } from "@/services/procedimentoService";

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const linkBaseClass =
  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer group";

const linkInactiveClass = "text-wine hover:bg-pale/70 hover:text-wine";
const linkActiveClass = "bg-berry text-white shadow-sm shadow-berry/25";

export function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  // Contagens exibidas como badge — buscadas do backend real.
  // Se a chamada falhar (ex: backend fora do ar), o badge some silenciosamente
  // em vez de travar a navegação.
  const [insumosCount, setInsumosCount] = useState<number | null>(null);
  const [procedimentosCount, setProcedimentosCount] = useState<number | null>(
    null
  );

  useEffect(() => {
    listarInsumos()
      .then((lista) => setInsumosCount(lista.length))
      .catch(() => setInsumosCount(null));

    listarProcedimentos()
      .then((lista) => setProcedimentosCount(lista.length))
      .catch(() => setProcedimentosCount(null));
  }, []);

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Cabeçalho da marca */}
      <div className="mb-5 flex items-center justify-between border-b border-petal/30 pb-5">
        <div className="flex items-center gap-3">
          <img
            src="/avatar-simbolo-berry.svg"
            alt="Lumine Gestão Estética"
            className="h-10 w-10 shrink-0 rounded-2xl shadow-xs"
          />
          <div>
            <span className="block font-display text-xl font-bold leading-none tracking-tight text-wine">
              Lumine
            </span>
            <span className="font-sans text-[11px] font-semibold text-wine/70">
              Gestão Estética
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-full p-1.5 text-wine/70 transition-colors hover:bg-pale hover:text-wine lg:hidden cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Lista de navegação */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        <span className="mb-2 block px-3 font-display text-[11px] font-bold uppercase tracking-wider text-wine/60">
          Módulos do Sistema
        </span>

        <Link
          to="/insumos"
          onClick={onCloseMobile}
          className={linkBaseClass}
          activeProps={{ className: `${linkBaseClass} ${linkActiveClass}` }}
          inactiveProps={{ className: `${linkBaseClass} ${linkInactiveClass}` }}
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-2.5 truncate">
                <Package
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-rose group-hover:text-berry"
                  }`}
                />
                <span className="truncate">Insumos</span>
              </div>

              <div className="ml-2 flex shrink-0 items-center gap-1">
                {insumosCount !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-pale text-wine group-hover:bg-white"
                    }`}
                  >
                    {insumosCount}
                  </span>
                )}
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    isActive
                      ? "translate-x-0.5 text-white"
                      : "text-wine/30 group-hover:translate-x-0.5 group-hover:text-wine/60"
                  }`}
                />
              </div>
            </>
          )}
        </Link>

        <Link
          to="/procedimentos"
          onClick={onCloseMobile}
          className={linkBaseClass}
          activeProps={{ className: `${linkBaseClass} ${linkActiveClass}` }}
          inactiveProps={{ className: `${linkBaseClass} ${linkInactiveClass}` }}
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-2.5 truncate">
                <Sparkles
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-rose group-hover:text-berry"
                  }`}
                />
                <span className="truncate">Procedimentos</span>
              </div>

              <div className="ml-2 flex shrink-0 items-center gap-1">
                {procedimentosCount !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-pale text-wine group-hover:bg-white"
                    }`}
                  >
                    {procedimentosCount}
                  </span>
                )}
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    isActive
                      ? "translate-x-0.5 text-white"
                      : "text-wine/30 group-hover:translate-x-0.5 group-hover:text-wine/60"
                  }`}
                />
              </div>
            </>
          )}
        </Link>

        <Link
          to="/gestao-financeira"
          onClick={onCloseMobile}
          className={linkBaseClass}
          activeProps={{ className: `${linkBaseClass} ${linkActiveClass}` }}
          inactiveProps={{ className: `${linkBaseClass} ${linkInactiveClass}` }}
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-2.5 truncate">
                <Wallet
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-rose group-hover:text-berry"
                  }`}
                />
                <span className="truncate">Gestão Financeira</span>
              </div>

              <div className="ml-2 flex shrink-0 items-center gap-1">
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    isActive
                      ? "translate-x-0.5 text-white"
                      : "text-wine/30 group-hover:translate-x-0.5 group-hover:text-wine/60"
                  }`}
                />
              </div>
            </>
          )}
        </Link>
      </div>

      {/* Rodapé: Perfil da Empresa */}
      <div className="mt-auto border-t border-petal/30 pt-4">
        <Link
          to="/perfil-empresa"
          onClick={onCloseMobile}
          className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-all"
          activeProps={{
            className:
              "group flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-all bg-berry text-white border-berry shadow-xs",
          }}
          inactiveProps={{
            className:
              "group flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-all bg-cream hover:bg-pale/70 border-petal/40",
          }}
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-xs transition-colors ${
                  isActive ? "bg-white text-berry" : "bg-berry text-white"
                }`}
              >
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={`block truncate text-xs font-bold transition-colors ${
                    isActive ? "text-white" : "text-wine"
                  }`}
                >
                  Perfil da Empresa
                </span>
                <span
                  className={`block truncate text-[10px] font-medium transition-colors ${
                    isActive ? "text-white/80" : "text-wine/70"
                  }`}
                >
                  Dados da clínica
                </span>
              </div>
              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive
                    ? "translate-x-0.5 text-white"
                    : "text-wine/40 group-hover:translate-x-0.5 group-hover:text-wine"
                }`}
              />
            </>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar fixa (desktop) */}
      <aside className="sticky top-6 hidden min-h-[500px] w-64 shrink-0 self-start rounded-[32px] border border-petal/40 bg-white p-5 shadow-sm lg:flex lg:flex-col">
        {navContent}
      </aside>

      {/* Menu em drawer (mobile) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 flex animate-in fade-in bg-ink/50 backdrop-blur-xs duration-200 lg:hidden"
          onClick={onCloseMobile}
        >
          <div
            className="flex h-full w-72 max-w-[85vw] animate-in slide-in-from-left flex-col border-r border-petal/40 bg-white p-6 shadow-2xl duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
