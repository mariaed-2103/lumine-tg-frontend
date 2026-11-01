import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  Wallet,
  X,
  Building2,
  BadgeDollarSign,
  CalendarCheck,
  LogOut,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

import { listarAtendimentos } from "@/services/atendimentoService";
import { listarInsumos } from "@/services/insumoService";
import { listarProcedimentos } from "@/services/procedimentoService";
import { ClipboardIcon } from "@/components/icons/lumine";

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const linkBaseClass =
  "lumine-nav-item w-full flex items-center justify-between px-2.5 py-3 rounded-2xl border border-transparent font-semibold text-sm transition-all duration-200 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

const linkInactiveClass = "text-ink hover:bg-pale/60 hover:text-wine";
const linkActiveClass =
  "lumine-nav-active border border-white/40 bg-gradient-to-br from-berry to-rose text-white shadow-[0_10px_24px_-8px_rgba(197,50,90,0.55)]";

export function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const navigate = useNavigate();

  // Contagens exibidas como badge — buscadas do backend real.
  // Se a chamada falhar (ex: backend fora do ar), o badge some silenciosamente
  // em vez de travar a navegação.
  const [insumosCount, setInsumosCount] = useState<number | null>(null);
  const [procedimentosCount, setProcedimentosCount] = useState<number | null>(null);
  const [atendimentosCount, setAtendimentosCount] = useState<number | null>(null);

  useEffect(() => {
    listarInsumos()
      .then((lista) => setInsumosCount(lista.length))
      .catch(() => setInsumosCount(null));

    listarProcedimentos()
      .then((lista) => setProcedimentosCount(lista.length))
      .catch(() => setProcedimentosCount(null));

    listarAtendimentos()
      .then((lista) => setAtendimentosCount(lista.length))
      .catch(() => setAtendimentosCount(null));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tokenLumine");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("emailUsuario");
    onCloseMobile?.();
    void navigate({ to: "/login" });
  };

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Cabeçalho da marca */}
      <div className="mb-4 flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          {/* Wrapper com anel orbital */}
          <span className="lumine-orbit">
            <img
              src="/avatar-simbolo-berry.svg"
              alt="Lumine Gestão Estética"
              className="h-10 w-10 shrink-0 rounded-full shadow-[inset_0_1px_3px_rgba(255,255,255,.65),0_5px_12px_rgba(107,21,48,.2)]"
            />
          </span>
          <div>
            <span className="block font-display text-[26px] font-bold leading-none tracking-tight text-wine">
              Lumine
            </span>
            <span className="font-sans text-[11px] font-semibold text-ink/60">
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
      <div className="lumine-nav-scroll flex-1 min-h-0 space-y-1 overflow-y-auto px-3 pt-2">
        <span className="mb-3 block px-3 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-wine/50">
          Módulos do Sistema
        </span>

        <Link
          to="/dashboard"
          onClick={onCloseMobile}
          className={linkBaseClass}
          activeProps={{ className: `${linkBaseClass} ${linkActiveClass}` }}
          inactiveProps={{ className: `${linkBaseClass} ${linkInactiveClass}` }}
        >
          {({ isActive }) => (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className={`lumine-icon-tile shrink-0 ${isActive ? "lumine-icon-tile-active" : ""}`}
                  aria-hidden="true"
                >
                  <LayoutDashboard
                    className={`h-[18px] w-[18px] transition-colors ${isActive ? "text-white" : "text-rose group-hover:text-berry"}`}
                  />
                </span>
                <span className="truncate">Dashboard</span>
              </div>
              {isActive && (
                <span className="lumine-dot-pulse shrink-0" aria-hidden="true" />
              )}
            </>
          )}
        </Link>

        <Link
          to="/insumos"
          onClick={onCloseMobile}
          className={linkBaseClass}
          activeProps={{ className: `${linkBaseClass} ${linkActiveClass}` }}
          inactiveProps={{ className: `${linkBaseClass} ${linkInactiveClass}` }}
        >
          {({ isActive }) => (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className={`lumine-icon-tile shrink-0 ${isActive ? "lumine-icon-tile-active" : ""}`}
                  aria-hidden="true"
                >
                  <Package
                    className={`h-[18px] w-[18px] transition-colors ${
                      isActive ? "text-white" : "text-rose group-hover:text-berry"
                    }`}
                  />
                </span>
                <span className="truncate">Insumos</span>
              </div>

              <div className="ml-2 flex shrink-0 items-center gap-1.5">
                {insumosCount !== null && (
                  <span
                    className={`lumine-nav-counter tabular-nums ${
                      isActive ? "lumine-nav-counter-active" : ""
                    }`}
                  >
                    {insumosCount}
                  </span>
                )}
                {isActive && (
                  <span className="lumine-dot-pulse" aria-hidden="true" />
                )}
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
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className={`lumine-icon-tile shrink-0 ${isActive ? "lumine-icon-tile-active" : ""}`}
                  aria-hidden="true"
                >
                  <ClipboardIcon
                    className={`h-[18px] w-[18px] transition-colors ${
                      isActive ? "text-white" : "text-rose group-hover:text-berry"
                    }`}
                  />
                </span>
                <span className="truncate">Procedimentos</span>
              </div>

              <div className="ml-2 flex shrink-0 items-center gap-1.5">
                {procedimentosCount !== null && (
                  <span
                    className={`lumine-nav-counter tabular-nums ${
                      isActive ? "lumine-nav-counter-active" : ""
                    }`}
                  >
                    {procedimentosCount}
                  </span>
                )}
                {isActive && (
                  <span className="lumine-dot-pulse" aria-hidden="true" />
                )}
              </div>
            </>
          )}
        </Link>

        <Link
          to="/atendimentos"
          onClick={onCloseMobile}
          className={linkBaseClass}
          activeProps={{ className: `${linkBaseClass} ${linkActiveClass}` }}
          inactiveProps={{ className: `${linkBaseClass} ${linkInactiveClass}` }}
        >
          {({ isActive }) => (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className={`lumine-icon-tile shrink-0 ${isActive ? "lumine-icon-tile-active" : ""}`}
                  aria-hidden="true"
                >
                  <CalendarCheck
                    className={`h-[18px] w-[18px] transition-colors ${
                      isActive ? "text-white" : "text-rose group-hover:text-berry"
                    }`}
                  />
                </span>
                <span className="min-w-0 whitespace-nowrap">Atendimentos</span>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-1.5">
                {atendimentosCount !== null && (
                  <span
                    className={`lumine-nav-counter tabular-nums ${
                      isActive ? "lumine-nav-counter-active" : ""
                    }`}
                  >
                    {atendimentosCount}
                  </span>
                )}
                {isActive && (
                  <span className="lumine-dot-pulse" aria-hidden="true" />
                )}
              </div>
            </>
          )}
        </Link>

        {/* Divisória visual entre módulos operacionais e financeiros */}
        <div aria-hidden="true" className="lumine-sidebar-divider" />

        <Link
          to="/precificacao"
          onClick={onCloseMobile}
          className={linkBaseClass}
          activeProps={{ className: `${linkBaseClass} ${linkActiveClass}` }}
          inactiveProps={{ className: `${linkBaseClass} ${linkInactiveClass}` }}
        >
          {({ isActive }) => (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className={`lumine-icon-tile shrink-0 ${isActive ? "lumine-icon-tile-active" : ""}`}
                  aria-hidden="true"
                >
                  <BadgeDollarSign
                    className={`h-[18px] w-[18px] ${isActive ? "text-white" : "text-rose group-hover:text-berry"}`}
                  />
                </span>
                <span className="truncate">Precificação</span>
              </div>
              {isActive && (
                <span className="lumine-dot-pulse shrink-0" aria-hidden="true" />
              )}
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
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`lumine-icon-tile shrink-0 ${isActive ? "lumine-icon-tile-active" : ""}`}
                  aria-hidden="true"
                >
                  <Wallet
                    className={`h-[18px] w-[18px] transition-colors ${
                      isActive ? "text-white" : "text-rose group-hover:text-berry"
                    }`}
                  />
                </span>
                <span className="truncate">Gestão Financeira</span>
              </div>

              <div className="ml-2 flex shrink-0 items-center gap-1">
                {isActive && (
                  <span className="lumine-dot-pulse" aria-hidden="true" />
                )}
              </div>
            </>
          )}
        </Link>
      </div>

      {/* Rodapé: Perfil da Empresa e Sair */}
      <div className="mt-auto space-y-2 pt-4">
        {/* Hairline divisória acima do rodapé */}
        <div aria-hidden="true" className="lumine-hairline mb-3" />

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
              "group flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-all bg-white/50 hover:bg-pale/70 border-white/80 shadow-[0_2px_8px_-3px_rgba(107,21,48,0.12)]",
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

        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-2xl border border-white/70 bg-white/40 px-3.5 py-2.5 text-left text-xs font-bold text-wine/80 transition-all hover:border-berry/40 hover:bg-pale/70 hover:text-berry"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="h-4 w-4 shrink-0 text-rose transition-colors group-hover:text-berry" />
            <span>Sair da conta</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar fixa (desktop) */}
      <aside className="lumine-sidebar glass glass-border-iridescent sticky top-4 hidden min-h-[500px] w-16 shrink-0 self-start rounded-[32px] p-3 md:flex md:flex-col lg:h-[calc(100vh-2rem)] lg:w-72 lg:p-4">
        {navContent}
      </aside>

      {/* Menu em drawer (mobile) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 flex animate-in fade-in bg-ink/50 backdrop-blur-xs duration-200 lg:hidden"
          onClick={onCloseMobile}
        >
          <div
            className="glass flex h-full w-[min(22rem,90vw)] max-w-[90vw] animate-in slide-in-from-left flex-col border-r border-petal/40 p-5 shadow-2xl duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
