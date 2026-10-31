import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  X,
  RefreshCw,
} from "lucide-react";

import type {
  Procedimento,
  ProcedimentoSortOption,
} from "@/components/procedimentos/types";
import type { InsumoDisponivel } from "@/components/procedimentos/types";

import { EmptyState } from "@/components/procedimentos/EmptyState";
import { ProcedimentoTable } from "@/components/procedimentos/ProcedimentoTable";
import { ProcedimentoCardList } from "@/components/procedimentos/ProcedimentoCardList";
import { ProcedimentoFormModal } from "@/components/procedimentos/ProcedimentoFormModal";
import { DeleteConfirmModal } from "@/components/procedimentos/DeleteConfirmModal";
import { Toast, ToastMessage } from "@/components/insumos/Toast";

import {
  listarProcedimentos,
  cadastrarProcedimento,
  editarProcedimento,
  excluirProcedimento,
} from "@/services/procedimentoService";

import {
  listarFichaTecnica,
  cadastrarFichaTecnica,
  editarFichaTecnica,
  excluirFichaTecnica,
} from "@/services/fichaTecnicaService";

import { listarInsumos } from "@/services/insumoService";

import { AppShell } from "@/components/layout/AppShell";
import { SemPerfilBanner } from "@/components/layout/SemPerfilBanner";
import { buscarPerfilEmpresa } from "@/services/perfilEmpresaService";
import { PlusIcon, SearchIcon } from "@/components/icons/lumine";
import { GlassLayers } from "@/components/decor/GlassLayers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/procedimentos")({
  head: () => ({
    meta: [
      { title: "Procedimentos | Lumine" },
      {
        name: "description",
        content:
          "Cadastre os procedimentos que você realiza e a ficha técnica de insumos de cada um.",
      },
    ],
  }),
  component: ProcedimentosPage,
});

function ProcedimentosPage() {
  const navigate = useNavigate();

  // ================================
  // Estados principais
  // ================================

  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [loading, setLoading] = useState(true);

  // Insumos reais do backend, usados no select da Ficha Técnica
  const [insumosDisponiveis, setInsumosDisponiveis] = useState<
    InsumoDisponivel[]
  >([]);

  // ================================
  // Busca, filtro e ordenação
  // ================================

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemInsumo, setFilterSemInsumo] = useState(false);
  const [sortBy, setSortBy] =
    useState<ProcedimentoSortOption>("nome_asc");

  // ================================
  // Estados dos modais
  // ================================

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [editingProcedimento, setEditingProcedimento] =
    useState<Procedimento | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [deletingProcedimento, setDeletingProcedimento] =
    useState<Procedimento | null>(null);

  // ================================
  // Toast notifications
  // ================================

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // null = ainda verificando; false = usuário sem perfil da empresa
  const [temPerfil, setTemPerfil] = useState<boolean | null>(null);

  const addToast = (
    message: string,
    type: "success" | "info" | "error" = "success"
  ) => {
    const id =
      Date.now().toString() +
      Math.random().toString().slice(2, 5);

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    );
  };

  // ================================
  // Carregar procedimentos e insumos
  // ================================

  useEffect(() => {
    async function carregarProcedimentos() {
      try {
        setLoading(true);

        // Primeiro busca os procedimentos
        const dados = await listarProcedimentos();

        // Depois busca a Ficha Técnica de cada procedimento
        const procedimentosComFicha = await Promise.all(
          dados.map(async (procedimento) => {
            try {
              const fichaTecnica = await listarFichaTecnica(
                procedimento.idProcedimento
              );

              return {
                ...procedimento,
                itensFichaTecnica: fichaTecnica,
              };
            } catch (error) {
              console.error(
                `Erro ao carregar ficha técnica do procedimento ${procedimento.idProcedimento}:`,
                error
              );

              return {
                ...procedimento,
                itensFichaTecnica: [],
              };
            }
          })
        );

        setProcedimentos(procedimentosComFicha);
      } catch (error) {
        console.error(
          "Erro ao carregar procedimentos:",
          error
        );

        addToast(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os procedimentos.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }

    async function carregarInsumosDisponiveis() {
      try {
        const dados = await listarInsumos();

        setInsumosDisponiveis(
          dados.map((insumo) => ({
            idInsumo: insumo.idInsumo,
            nome: insumo.nome,
            unidadeMedida: insumo.unidadeMedida,
          }))
        );
      } catch (error) {
        // Não bloqueia a tela de Procedimentos se os insumos falharem.
        console.error(
          "Erro ao carregar insumos disponíveis:",
          error
        );
      }
    }

    async function carregarDados() {
      const perfil = await buscarPerfilEmpresa();
      setTemPerfil(!!perfil);

      if (!perfil) {
        // não tentar carregar dados sem perfil
        setLoading(false);
        return;
      }

      void carregarProcedimentos();
      void carregarInsumosDisponiveis();
    }

    void carregarDados();
  }, []);

  // ================================
  // Abrir modal de cadastro
  // ================================

  const handleOpenCreateModal = () => {
    setEditingProcedimento(null);
    setIsFormModalOpen(true);
  };

  // ================================
  // Abrir modal de edição
  // ================================

  const handleOpenEditModal = (
    procedimento: Procedimento
  ) => {
    setEditingProcedimento(procedimento);
    setIsFormModalOpen(true);
  };

  // ================================
  // Salvar / editar procedimento
  // ================================

  const handleSaveProcedimento = async (
    formData: Omit<Procedimento, "idProcedimento">
  ) => {
    try {
      // Dados enviados para /procedimentos
      //
      // A Ficha Técnica NÃO é enviada aqui.
      // Ela possui endpoints próprios no backend.

      const dados = {
        nome: formData.nome,
        duracaoMinutos: formData.duracaoMinutos,
        precoPadrao: formData.precoPadrao,
      };

      // ============================================================
      // EDIÇÃO
      // ============================================================

      if (editingProcedimento) {
        const idProcedimento =
          editingProcedimento.idProcedimento;

        // ----------------------------------------------------------
        // 1. Edita os dados básicos do procedimento
        // ----------------------------------------------------------

        const procedimentoAtualizado =
          await editarProcedimento(
            idProcedimento,
            dados
          );

        // ----------------------------------------------------------
        // 2. Busca a ficha técnica que existe atualmente no banco
        // ----------------------------------------------------------

        const fichaAtual =
          await listarFichaTecnica(idProcedimento);

        // Nova ficha enviada pelo formulário
        const fichaNova =
          formData.itensFichaTecnica;

        // ----------------------------------------------------------
        // 3. Exclui os itens que foram removidos do formulário
        // ----------------------------------------------------------

        const idsFichaNova = fichaNova
          .filter(
            (item) => item.idFichaTecnica
          )
          .map(
            (item) => item.idFichaTecnica
          );

        const itensParaExcluir =
          fichaAtual.filter(
            (item) =>
              item.idFichaTecnica &&
              !idsFichaNova.includes(
                item.idFichaTecnica
              )
          );

        for (const item of itensParaExcluir) {
          if (item.idFichaTecnica) {
            await excluirFichaTecnica(
              item.idFichaTecnica
            );
          }
        }

        // ----------------------------------------------------------
        // 4. Adiciona novos itens ou edita os existentes
        // ----------------------------------------------------------

        for (const item of fichaNova) {
          const quantidade =
            Number(item.quantidadeUtilizada);

          // Item já existente
          if (item.idFichaTecnica) {
            await editarFichaTecnica(
              item.idFichaTecnica,
              quantidade
            );
          }

          // Item novo
          else {
            await cadastrarFichaTecnica(
              idProcedimento,
              Number(item.idInsumo),
              quantidade
            );
          }
        }

        // ----------------------------------------------------------
        // 5. Busca novamente a ficha técnica atualizada
        // ----------------------------------------------------------

        const fichaAtualizada =
          await listarFichaTecnica(
            idProcedimento
          );

        // ----------------------------------------------------------
        // 6. Monta o objeto completo para o frontend
        // ----------------------------------------------------------

        const procedimentoFinal: Procedimento = {
          ...procedimentoAtualizado,
          itensFichaTecnica:
            fichaAtualizada,
        };

        // ----------------------------------------------------------
        // 7. Atualiza somente o procedimento alterado na tela
        // ----------------------------------------------------------

        setProcedimentos((prev) =>
          prev.map((item) =>
            item.idProcedimento ===
            idProcedimento
              ? procedimentoFinal
              : item
          )
        );

        addToast(
          `Procedimento "${formData.nome}" atualizado com sucesso!`,
          "success"
        );
      }

      // ============================================================
      // CADASTRO
      // ============================================================

      else {
        // ----------------------------------------------------------
        // 1. Primeiro cadastra o procedimento
        // ----------------------------------------------------------

        const novoProcedimento =
          await cadastrarProcedimento(dados);

        const idProcedimento =
          novoProcedimento.idProcedimento;

        // ----------------------------------------------------------
        // 2. Depois cadastra cada item da Ficha Técnica
        // ----------------------------------------------------------

        for (const item of formData.itensFichaTecnica) {
          await cadastrarFichaTecnica(
            idProcedimento,
            Number(item.idInsumo),
            Number(item.quantidadeUtilizada)
          );
        }

        // ----------------------------------------------------------
        // 3. Busca a ficha técnica criada
        // ----------------------------------------------------------

        const fichaTecnica =
          await listarFichaTecnica(
            idProcedimento
          );

        // ----------------------------------------------------------
        // 4. Monta o procedimento completo
        // ----------------------------------------------------------

        const procedimentoCompleto: Procedimento = {
          ...novoProcedimento,
          itensFichaTecnica:
            fichaTecnica,
        };

        // ----------------------------------------------------------
        // 5. Adiciona na lista da tela
        // ----------------------------------------------------------

        setProcedimentos((prev) => [
          procedimentoCompleto,
          ...prev,
        ]);

        addToast(
          `Procedimento "${formData.nome}" cadastrado com sucesso!`,
          "success"
        );
      }

      // Fecha o modal
      setIsFormModalOpen(false);
      setEditingProcedimento(null);
    } catch (error) {
      console.error(
        "Erro ao salvar procedimento:",
        error
      );

      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o procedimento.",
        "error"
      );
    }
  };

  // ================================
  // Abrir modal de exclusão
  // ================================

  const handleOpenDeleteModal = (
    procedimento: Procedimento
  ) => {
    setDeletingProcedimento(procedimento);
    setIsDeleteModalOpen(true);
  };

  // ================================
  // Confirmar exclusão
  // ================================

  const handleConfirmDeleteProcedimento =
    async () => {
      if (!deletingProcedimento) {
        return;
      }

      try {
        const removedName =
          deletingProcedimento.nome;

        await excluirProcedimento(
          deletingProcedimento.idProcedimento
        );

        setProcedimentos((prev) =>
          prev.filter(
            (item) =>
              item.idProcedimento !==
              deletingProcedimento.idProcedimento
          )
        );

        addToast(
          `Procedimento "${removedName}" excluído com sucesso!`,
          "info"
        );

        setIsDeleteModalOpen(false);
        setDeletingProcedimento(null);
      } catch (error) {
        console.error(
          "Erro ao excluir procedimento:",
          error
        );

        addToast(
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o procedimento.",
          "error"
        );
      }
    };

  // ================================
  // Filtro, busca e ordenação
  // ================================

  const totalProcedimentos =
    procedimentos.length;

  const procedimentosSemInsumosCount =
    useMemo(() => {
      return procedimentos.filter(
        (item) =>
          item.itensFichaTecnica.length === 0
      ).length;
    }, [procedimentos]);

  const filteredProcedimentos =
    useMemo(() => {
      let result = [...procedimentos];

      // Busca
      if (searchTerm.trim()) {
        const term =
          searchTerm.toLowerCase();

        result = result.filter((item) =>
          item.nome
            .toLowerCase()
            .includes(term)
        );
      }

      // Filtro sem insumos
      if (filterSemInsumo) {
        result = result.filter(
          (item) =>
            item.itensFichaTecnica.length === 0
        );
      }

      // Ordenação
      result.sort((a, b) => {
        if (sortBy === "nome_asc") {
          return a.nome.localeCompare(b.nome);
        }

        if (sortBy === "nome_desc") {
          return b.nome.localeCompare(a.nome);
        }

        if (sortBy === "duracao_asc") {
          return (
            a.duracaoMinutos -
            b.duracaoMinutos
          );
        }

        if (sortBy === "duracao_desc") {
          return (
            b.duracaoMinutos -
            a.duracaoMinutos
          );
        }

        if (sortBy === "preco_asc") {
          return (
            (a.precoPadrao || 0) -
            (b.precoPadrao || 0)
          );
        }

        if (sortBy === "preco_desc") {
          return (
            (b.precoPadrao || 0) -
            (a.precoPadrao || 0)
          );
        }

        return 0;
      });

      return result;
    }, [
      procedimentos,
      searchTerm,
      filterSemInsumo,
      sortBy,
    ]);

  // ================================
  // Interface
  // ================================

  return (
    <AppShell mobileTitle="Procedimentos">
      {temPerfil === false && <SemPerfilBanner />}
      {/* Cabeçalho */}
      <div className="relative pt-2 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight text-wine sm:text-[40px]">
          Procedimentos
        </h1>

        <p className="mt-1.5 max-w-[600px] text-balance text-sm font-medium text-ink/65 sm:text-[15px]">
          Cadastre os procedimentos que você
          realiza e os insumos que cada um
          consome
        </p>

        <GlassLayers className="pointer-events-none absolute -right-8 top-0 z-20 hidden h-[166px] w-[174px] select-none lg:block xl:-right-12 2xl:-right-16 2xl:h-[190px] 2xl:w-[198px]" />
      </div>

      {/* Card branco principal */}
      <div className="glass-strong glass-border-iridescent w-full rounded-[32px] p-7 pb-8 shadow-sm transition-all sm:p-8">
        {/* Barra superior dentro do card */}
        <div className="relative flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-petal/70 to-transparent" />
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-wine sm:text-lg">
              Seus Procedimentos
            </span>

            <span className="rounded-full bg-pale px-2.5 py-1 text-xs font-bold text-wine tabular-nums">
              {totalProcedimentos}
            </span>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose" />

              <input
                type="text"
                placeholder="Buscar procedimento..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="h-11 w-full rounded-full border border-petal/70 bg-white/65 pl-10 pr-8 text-sm text-ink placeholder-ink/40 outline-none transition-all duration-250 focus:border-berry focus:ring-4 focus:ring-berry/15 focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5] sm:w-60 sm:focus:w-64"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-petal hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40"
                  aria-label="Limpar busca"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="group shine glass-border-iridescent inline-flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-br from-[#D13E66] to-berry px-5 text-sm font-bold text-white shadow-lg shadow-berry/30 transition-all hover:from-wine hover:to-wine active:scale-[0.98] sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
            >
              <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>Novo Procedimento</span>
            </button>
          </div>
        </div>

        {/* Corpo do card */}
        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-wine/70">
            Carregando procedimentos...
          </div>
        ) : totalProcedimentos === 0 ? (
          <EmptyState
            onNewProcedimento={
              handleOpenCreateModal
            }
          />
        ) : (
          <div className="space-y-5 pt-5">
            {/* Filtros e ordenação */}
            <div className="flex flex-col gap-3 rounded-2xl border border-petal/40 bg-white/45 p-2 shadow-[inset_0_1px_3px_rgba(107,21,48,0.07)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:rounded-full">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFilterSemInsumo(false)
                  }
                  className={`shine inline-flex h-9 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-transparent px-4 text-[13px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5] ${
                    !filterSemInsumo
                      ? "border-white/80 bg-gradient-to-r from-berry to-rose text-white shadow-md shadow-berry/25"
                      : "border border-petal/60 bg-white text-wine hover:bg-pale"
                  }`}
                >
                  Todos ({totalProcedimentos})
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilterSemInsumo(true)
                  }
                  className={`inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-transparent px-3.5 text-[13px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5] ${
                    filterSemInsumo
                      ? "border-white/80 bg-gradient-to-r from-berry to-rose text-white shadow-md shadow-berry/25"
                      : procedimentosSemInsumosCount >
                          0
                        ? "border border-berry/50 bg-white text-berry hover:bg-pale"
                        : "border border-petal/60 bg-white text-wine hover:bg-pale"
                  }`}
                >
                  <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${filterSemInsumo ? "bg-white" : "bg-[#D97706]"}`} />

                  <span>
                    Sem insumos vinculados (
                    {procedimentosSemInsumosCount}
                    )
                  </span>
                </button>
              </div>

              <div className="relative shrink-0">
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as ProcedimentoSortOption)
                  }
                >
                  <SelectTrigger className="h-9 w-full rounded-full border-petal/60 bg-white/80 pl-3.5 pr-3 text-[13px] font-bold sm:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nome_asc">Nome (A - Z)</SelectItem>
                    <SelectItem value="nome_desc">Nome (Z - A)</SelectItem>
                    <SelectItem value="duracao_asc">Menor Duração</SelectItem>
                    <SelectItem value="duracao_desc">Maior Duração</SelectItem>
                    <SelectItem value="preco_asc">Menor Preço</SelectItem>
                    <SelectItem value="preco_desc">Maior Preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchTerm ||
              filterSemInsumo) && (
              <div className="flex items-center justify-between px-1 text-xs font-medium text-wine">
                <p>
                  Mostrando{" "}
                  <span className="font-bold text-berry">
                    {
                      filteredProcedimentos.length
                    }
                  </span>{" "}
                  de {totalProcedimentos}{" "}
                  procedimentos
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterSemInsumo(false);
                  }}
                  className="flex cursor-pointer items-center gap-1 font-bold text-berry hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 rounded"
                >
                  <RefreshCw className="h-3 w-3" />

                  <span>
                    Limpar filtros
                  </span>
                </button>
              </div>
            )}

            {filteredProcedimentos.length ===
            0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-bold text-wine">
                  Nenhum procedimento encontrado
                </p>

                <p className="mt-1 text-xs text-wine/70">
                  Ajuste o termo de busca ou
                  filtros.
                </p>
              </div>
            ) : (
              <>
                <ProcedimentoTable
                  procedimentos={
                    filteredProcedimentos
                  }
                  insumosDisponiveis={
                    insumosDisponiveis
                  }
                  onEdit={
                    handleOpenEditModal
                  }
                  onDelete={
                    handleOpenDeleteModal
                  }
                />

                <ProcedimentoCardList
                  procedimentos={
                    filteredProcedimentos
                  }
                  insumosDisponiveis={
                    insumosDisponiveis
                  }
                  onEdit={
                    handleOpenEditModal
                  }
                  onDelete={
                    handleOpenDeleteModal
                  }
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal: Cadastro / Edição de Procedimento com Ficha Técnica */}
      <ProcedimentoFormModal
        isOpen={isFormModalOpen}
        editingProcedimento={
          editingProcedimento
        }
        insumosDisponiveis={
          insumosDisponiveis
        }
        onSave={
          handleSaveProcedimento
        }
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProcedimento(null);
        }}
        onNavigateToInsumos={() => {
          setIsFormModalOpen(false);
          void navigate({
            to: "/insumos",
          });
        }}
      />

      {/* Modal: Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        procedimento={
          deletingProcedimento
        }
        onConfirm={
          handleConfirmDeleteProcedimento
        }
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingProcedimento(null);
        }}
      />

      {/* Toasts */}
      <Toast
        toasts={toasts}
        onDismiss={removeToast}
      />
    </AppShell>
  );
}
