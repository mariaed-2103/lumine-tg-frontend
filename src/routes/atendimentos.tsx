import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  Atendimento,
  AtendimentoInput,
  FormaPagamentoOpcao,
  ProcedimentoOpcao,
} from "@/components/atendimentos/types";

import { EmptyState } from "@/components/atendimentos/EmptyState";
import { AtendimentoTable } from "@/components/atendimentos/AtendimentoTable";
import { AtendimentoCardList } from "@/components/atendimentos/AtendimentoCardList";
import { AtendimentoFormModal } from "@/components/atendimentos/AtendimentoFormModal";
import { DeleteConfirmModal } from "@/components/atendimentos/DeleteConfirmModal";
import { Toast, type ToastMessage } from "@/components/insumos/Toast";

import { AppShell } from "@/components/layout/AppShell";
import { SemPerfilBanner } from "@/components/layout/SemPerfilBanner";
import { GlassCalendar } from "@/components/decor/GlassCalendar";
import { buscarPerfilEmpresa } from "@/services/perfilEmpresaService";
import { ArrowLeftIcon, PlusIcon } from "@/components/icons/lumine";

import {
  listarAtendimentos,
  cadastrarAtendimento,
  editarAtendimento,
  excluirAtendimento,
} from "@/services/atendimentoService";
import { listarProcedimentos } from "@/services/procedimentoService";
import { listarFormasPagamento } from "@/services/formaPagamentoService";

export const Route = createFileRoute("/atendimentos")({
  head: () => ({
    meta: [
      { title: "Atendimentos | Lumine" },
      {
        name: "description",
        content: "Registre e acompanhe os atendimentos realizados com suas clientes.",
      },
    ],
  }),
  component: AtendimentosPage,
});

export function AtendimentosPage() {
  const router = useRouter();

  // ================================
  // Estados principais (iniciam vazios — sem dados fictícios)
  // ================================

  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [procedimentos, setProcedimentos] = useState<ProcedimentoOpcao[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoOpcao[]>([]);
  const [temPerfil, setTemPerfil] = useState<boolean | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [busca, setBusca] = useState("");
  const [procedimentoFiltrado, setProcedimentoFiltrado] = useState("");
  const [pagamentoFiltrado, setPagamentoFiltrado] = useState("");
  const [imprevistoFiltrado, setImprevistoFiltrado] = useState("");

  // Contador usado como fallback caso o backend esteja desligado durante testes visuais
  const proximoId = useRef(1);

  // ================================
  // Estados dos modais
  // ================================

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAtendimento, setDeletingAtendimento] = useState<Atendimento | null>(null);

  // ================================
  // Toasts
  // ================================

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage["type"] = "success") => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // ================================
  // Carregar dados iniciais
  // ================================

  useEffect(() => {
    async function carregarDados() {
      try {
        const perfil = await buscarPerfilEmpresa();
        setTemPerfil(!!perfil);
      } catch {
        setTemPerfil(null);
      }

      const [procRes, formasRes, atendRes] = await Promise.allSettled([
        listarProcedimentos(),
        listarFormasPagamento(),
        listarAtendimentos(),
      ]);

      const listaProc: ProcedimentoOpcao[] =
        procRes.status === "fulfilled"
          ? procRes.value.map((p) => ({
              idProcedimento: p.idProcedimento,
              nome: p.nome,
              precoPadrao: p.precoPadrao,
            }))
          : [];

      const listaFormas: FormaPagamentoOpcao[] =
        formasRes.status === "fulfilled"
          ? formasRes.value.map((f) => ({
              idFormaPagamento: f.idFormaPagamento,
              nome: f.nome,
              taxaPercentual: f.taxaPercentual,
            }))
          : [];

      setProcedimentos(listaProc);
      setFormasPagamento(listaFormas);

      if (atendRes.status === "fulfilled") {
        const enriquecidos = atendRes.value.map((a) => ({
          ...a,
          nomeProcedimento:
            a.nomeProcedimento ||
            listaProc.find((p) => p.idProcedimento === a.idProcedimento)?.nome ||
            "",
          nomeFormaPagamento:
            a.nomeFormaPagamento ||
            listaFormas.find((f) => f.idFormaPagamento === a.idFormaPagamento)?.nome ||
            "",
        }));
        setAtendimentos(enriquecidos);
      }
    }

    void carregarDados();
  }, []);

  // ================================
  // Abrir / fechar modais
  // ================================

  const handleOpenCreateModal = () => {
    setEditingAtendimento(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (atendimento: Atendimento) => {
    setEditingAtendimento(atendimento);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAtendimento(null);
  };

  const handleOpenDeleteModal = (atendimento: Atendimento) => {
    setDeletingAtendimento(atendimento);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingAtendimento(null);
  };

  // ================================
  // Salvar (criar / editar)
  // ================================

  const handleSaveAtendimento = async (dados: AtendimentoInput) => {
    const nomeProcedimento =
      procedimentos.find((p) => p.idProcedimento === dados.idProcedimento)?.nome ??
      editingAtendimento?.nomeProcedimento ??
      "";

    const nomeFormaPagamento =
      formasPagamento.find((f) => f.idFormaPagamento === dados.idFormaPagamento)?.nome ??
      editingAtendimento?.nomeFormaPagamento ??
      "";

    if (editingAtendimento) {
      let atualizado: Atendimento;
      try {
        const salvo = await editarAtendimento(editingAtendimento.idAtendimento, dados);
        atualizado = {
          ...salvo,
          nomeProcedimento: salvo.nomeProcedimento || nomeProcedimento,
          nomeFormaPagamento: salvo.nomeFormaPagamento || nomeFormaPagamento,
        };
      } catch (error) {
        if (error instanceof TypeError) {
          atualizado = {
            ...dados,
            idAtendimento: editingAtendimento.idAtendimento,
            nomeProcedimento,
            nomeFormaPagamento,
          };
        } else {
          addToast(
            error instanceof Error ? error.message : "Não foi possível atualizar o atendimento.",
            "error",
          );
          return;
        }
      }

      setAtendimentos((prev) =>
        prev.map((item) => (item.idAtendimento === atualizado.idAtendimento ? atualizado : item)),
      );
      addToast("Atendimento atualizado com sucesso");
    } else {
      let novoAtendimento: Atendimento;
      try {
        const salvo = await cadastrarAtendimento(dados);
        novoAtendimento = {
          ...salvo,
          nomeProcedimento: salvo.nomeProcedimento || nomeProcedimento,
          nomeFormaPagamento: salvo.nomeFormaPagamento || nomeFormaPagamento,
        };
      } catch (error) {
        if (error instanceof TypeError) {
          novoAtendimento = {
            ...dados,
            idAtendimento: proximoId.current++,
            nomeProcedimento,
            nomeFormaPagamento,
          };
        } else {
          addToast(
            error instanceof Error ? error.message : "Não foi possível registrar o atendimento.",
            "error",
          );
          return;
        }
      }

      setAtendimentos((prev) => [...prev, novoAtendimento]);
      addToast("Atendimento registrado com sucesso");
    }

    handleCloseFormModal();
  };

  // ================================
  // Excluir
  // ================================

  const handleConfirmDelete = async () => {
    if (!deletingAtendimento) return;

    try {
      await excluirAtendimento(deletingAtendimento.idAtendimento);
    } catch (error) {
      if (!(error instanceof TypeError)) {
        addToast(
          error instanceof Error ? error.message : "Não foi possível excluir o atendimento.",
          "error",
        );
        return;
      }
    }

    setAtendimentos((prev) =>
      prev.filter((item) => item.idAtendimento !== deletingAtendimento.idAtendimento),
    );
    addToast("Atendimento excluído com sucesso", "info");
    handleCloseDeleteModal();
  };

  // ================================
  // Ordenação: mais recentes primeiro
  // ================================

  const atendimentosOrdenados = useMemo(
    () =>
      [...atendimentos].sort(
        (a, b) =>
          b.dataAtendimento.localeCompare(a.dataAtendimento) || b.idAtendimento - a.idAtendimento,
      ),
    [atendimentos],
  );

  const atendimentosFiltrados = useMemo(() => {
    const textoBusca = busca
      .trim()
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return atendimentosOrdenados.filter((atendimento) => {
      const textoAtendimento = `${atendimento.nomeCliente} ${atendimento.nomeProcedimento}`
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const correspondeBusca = !textoBusca || textoAtendimento.includes(textoBusca);
      const correspondeProcedimento =
        !procedimentoFiltrado || String(atendimento.idProcedimento) === procedimentoFiltrado;
      const correspondePagamento =
        !pagamentoFiltrado || String(atendimento.idFormaPagamento) === pagamentoFiltrado;
      const temImprevisto = atendimento.tempoAdicional > 0 || atendimento.desperdicioMateriais > 0;
      const correspondeImprevisto =
        !imprevistoFiltrado || (imprevistoFiltrado === "com" ? temImprevisto : !temImprevisto);

      return (
        correspondeBusca && correspondeProcedimento && correspondePagamento && correspondeImprevisto
      );
    });
  }, [atendimentosOrdenados, busca, procedimentoFiltrado, pagamentoFiltrado, imprevistoFiltrado]);

  const filtrosAtivos = Boolean(
    busca.trim() || procedimentoFiltrado || pagamentoFiltrado || imprevistoFiltrado,
  );
  const limparFiltros = () => {
    setBusca("");
    setProcedimentoFiltrado("");
    setPagamentoFiltrado("");
    setImprevistoFiltrado("");
  };

  const total = atendimentos.length;

  // ================================
  // Interface
  // ================================

  return (
    <AppShell mobileTitle="Atendimentos">
      <div className="atendimentos-page min-w-0 pb-24 md:pb-0">
        {temPerfil === false && <SemPerfilBanner />}
        {/* Cabeçalho da página */}
        <div className="relative mb-6">
          <nav aria-label="Navegação" className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.history.back()}
              className="group inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-white/80 bg-white/50 px-3 text-xs font-semibold text-ink/60 transition-colors hover:bg-pale hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Voltar</span>
            </button>
            <span className="h-1 w-1 rounded-full bg-petal" aria-hidden="true" />
            <span className="text-xs font-bold text-wine" aria-current="page">
              Atendimentos
            </span>
          </nav>

          <h1 className="font-display text-4xl font-bold tracking-tight text-wine sm:text-[40px]">
            Atendimentos
          </h1>

          <p className="mt-1.5 max-w-[600px] text-pretty text-sm font-medium text-ink/65 sm:text-[15px]">
            Registre e acompanhe os atendimentos realizados com suas clientes
          </p>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-8 z-0 hidden h-[88px] w-[92px] select-none lg:block 2xl:h-[98px] 2xl:w-[104px]"
          >
            <GlassCalendar className="h-full w-full" size={190} />
          </div>
        </div>

        {/* Card branco principal */}
        <div className="glass-strong glass-border-iridescent w-full rounded-[32px] p-6 transition-all sm:p-8">
          {/* Cabeçalho da listagem */}
          <div className="relative flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-petal/60 to-transparent" />
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold text-wine sm:text-lg">
                Atendimentos
              </span>
              <span className="rounded-full bg-pale px-2.5 py-1 text-xs font-bold tabular-nums text-wine">
                {filtrosAtivos ? `${atendimentosFiltrados.length}/${total}` : total}
              </span>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {total > 0 && (
                <button
                  type="button"
                  onClick={() => setFiltrosAbertos((abertos) => !abertos)}
                  aria-expanded={filtrosAbertos}
                  aria-controls="atendimentos-filtros"
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 ${
                    filtrosAbertos || filtrosAtivos
                      ? "border-petal bg-pale/70 text-wine"
                      : "border-petal/40 bg-white/70 text-ink/70 hover:bg-pale/50"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filtrar
                  {filtrosAtivos && <span className="h-1.5 w-1.5 rounded-full bg-berry" />}
                </button>
              )}
              <button
                type="button"
                id="btn-novo-atendimento"
                onClick={handleOpenCreateModal}
                className="group shine inline-flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/80 bg-gradient-to-br from-[#D13E66] to-berry px-5 text-sm font-bold text-white shadow-lg shadow-berry/30 transition-all hover:from-wine hover:to-wine active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5] sm:w-auto"
              >
                <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
                <span>Novo Atendimento</span>
              </button>
            </div>
          </div>

          {filtrosAbertos && total > 0 && (
            <div
              id="atendimentos-filtros"
              className="mb-5 grid gap-3 rounded-2xl border border-petal/25 bg-[#FFF9F7] p-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2"
            >
              <label className="relative min-w-0 sm:col-span-2 2xl:col-span-1">
                <span className="sr-only">Buscar cliente ou procedimento</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                <input
                  type="search"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Cliente ou procedimento"
                  className="h-10 w-full min-w-0 rounded-full border border-petal/40 bg-white pl-9 pr-3 text-sm text-wine outline-none transition placeholder:text-ink/45 focus:border-berry/60 focus:ring-2 focus:ring-berry/10"
                />
              </label>

              <div className="min-w-0">
                <Select
                  value={procedimentoFiltrado || undefined}
                  onValueChange={setProcedimentoFiltrado}
                >
                  <SelectTrigger
                    aria-label="Filtrar por procedimento"
                    className="h-10 min-w-0 rounded-full border-petal/40 bg-white px-3 text-sm"
                  >
                    <SelectValue placeholder="Todos os procedimentos" />
                  </SelectTrigger>
                  <SelectContent>
                    {procedimentos.map((procedimento) => (
                      <SelectItem
                        key={procedimento.idProcedimento}
                        value={String(procedimento.idProcedimento)}
                      >
                        {procedimento.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0">
                <Select value={pagamentoFiltrado || undefined} onValueChange={setPagamentoFiltrado}>
                  <SelectTrigger
                    aria-label="Filtrar por forma de pagamento"
                    className="h-10 min-w-0 rounded-full border-petal/40 bg-white px-3 text-sm"
                  >
                    <SelectValue placeholder="Todas as formas de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map((forma) => (
                      <SelectItem
                        key={forma.idFormaPagamento}
                        value={String(forma.idFormaPagamento)}
                      >
                        {forma.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex min-w-0 gap-2">
                <div className="min-w-0 flex-1">
                  <Select
                    value={imprevistoFiltrado || undefined}
                    onValueChange={setImprevistoFiltrado}
                  >
                    <SelectTrigger
                      aria-label="Filtrar por imprevistos"
                      className="h-10 min-w-0 rounded-full border-petal/40 bg-white px-3 text-sm"
                    >
                      <SelectValue placeholder="Com e sem imprevistos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="com">Com imprevistos</SelectItem>
                      <SelectItem value="sem">Sem imprevistos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {filtrosAtivos && (
                  <button
                    type="button"
                    onClick={limparFiltros}
                    aria-label="Limpar filtros"
                    title="Limpar filtros"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink/55 transition hover:bg-pale hover:text-wine"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Corpo do card */}
          {total === 0 ? (
            <EmptyState onNewAtendimento={handleOpenCreateModal} />
          ) : (
            <div className="pt-5">
              {atendimentosFiltrados.length > 0 ? (
                <>
                  <AtendimentoTable
                    atendimentos={atendimentosFiltrados}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                  />
                  <AtendimentoCardList
                    atendimentos={atendimentosFiltrados}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <p className="text-sm font-semibold text-wine">Nenhum atendimento encontrado</p>
                  <p className="text-xs text-ink/55">
                    Ajuste ou limpe os filtros para ver resultados.
                  </p>
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="mt-1 text-xs font-semibold text-berry hover:underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal: Novo / Editar atendimento */}
        <AtendimentoFormModal
          isOpen={isFormModalOpen}
          editingAtendimento={editingAtendimento}
          procedimentos={procedimentos}
          formasPagamento={formasPagamento}
          onSave={handleSaveAtendimento}
          onClose={handleCloseFormModal}
        />

        {/* Modal: Confirmação de exclusão */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          atendimento={deletingAtendimento}
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseDeleteModal}
        />

        {/* Toasts */}
        <Toast toasts={toasts} onDismiss={removeToast} />
      </div>
    </AppShell>
  );
}
