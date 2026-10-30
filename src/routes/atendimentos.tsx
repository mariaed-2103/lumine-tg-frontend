import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

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
import { buscarPerfilEmpresa } from "@/services/perfilEmpresaService";

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

  const total = atendimentos.length;

  // ================================
  // Interface
  // ================================

  return (
    <AppShell mobileTitle="Atendimentos">
      {temPerfil === false && <SemPerfilBanner />}
      {/* Cabeçalho da página */}
      <div>
        <nav aria-label="Navegação" className="mb-3 flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="inline-flex cursor-pointer items-center gap-1 text-wine/70 transition-colors hover:text-berry"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar</span>
          </button>
          <span className="text-wine/40">/</span>
          <span className="text-wine" aria-current="page">
            Atendimentos
          </span>
        </nav>

        <h1 className="font-display text-3xl font-bold tracking-tight text-wine sm:text-4xl">
          Atendimentos
        </h1>

        <p className="mt-1 text-xs font-medium text-wine/80 sm:text-sm">
          Registre e acompanhe os atendimentos realizados com suas clientes
        </p>
      </div>

      {/* Card branco principal */}
      <div className="mt-6 w-full rounded-[32px] border border-petal/40 bg-white p-6 shadow-sm transition-all sm:p-8">
        {/* Cabeçalho da listagem */}
        <div className="flex flex-col gap-4 border-b border-petal/20 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-wine sm:text-lg">
              Atendimentos
            </span>
            <span className="rounded-full border border-petal/40 bg-cream px-2.5 py-0.5 text-sm font-semibold text-wine/70">
              {total}
            </span>
          </div>

          <button
            type="button"
            id="btn-novo-atendimento"
            onClick={handleOpenCreateModal}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-berry px-4 py-2 text-xs font-bold text-white shadow-md shadow-berry/20 transition-all hover:bg-wine active:scale-95 sm:px-5 sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Atendimento</span>
          </button>
        </div>

        {/* Corpo do card */}
        {total === 0 ? (
          <EmptyState onNewAtendimento={handleOpenCreateModal} />
        ) : (
          <div className="pt-5">
            <AtendimentoTable
              atendimentos={atendimentosOrdenados}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
            <AtendimentoCardList
              atendimentos={atendimentosOrdenados}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
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
    </AppShell>
  );
}
