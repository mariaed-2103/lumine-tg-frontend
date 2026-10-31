import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  X,
  RefreshCw,
} from "lucide-react";

import type {
  Insumo,
  FilterOption,
  SortOption,
} from "@/components/insumos/types";

import { EmptyState } from "@/components/insumos/EmptyState";
import { InsumoTable } from "@/components/insumos/InsumoTable";
import { InsumoCardList } from "@/components/insumos/InsumoCardList";
import { InsumoFormModal } from "@/components/insumos/InsumoFormModal";
import { DeleteConfirmModal } from "@/components/insumos/DeleteConfirmModal";
import { Toast, ToastMessage } from "@/components/insumos/Toast";

import {
  listarInsumos,
  cadastrarInsumo,
  editarInsumo,
  excluirInsumo,
} from "@/services/insumoService";

import { AppShell } from "@/components/layout/AppShell";
import { SemPerfilBanner } from "@/components/layout/SemPerfilBanner";
import { buscarPerfilEmpresa } from "@/services/perfilEmpresaService";
import { GlassBottle } from "@/components/decor/GlassBottle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/insumos")({
  head: () => ({
    meta: [
      { title: "Insumos | Lumine" },
      {
        name: "description",
        content:
          "Gerencie os insumos utilizados nos seus procedimentos de estética.",
      },
    ],
  }),
  component: InsumosPage,
});

function InsumosPage() {
  // ================================
  // Estados principais
  // ================================

  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // Busca, filtro e ordenação
  // ================================

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<FilterOption>("todos");

  const [sortBy, setSortBy] =
    useState<SortOption>("nome_asc");

  // ================================
  // Estados dos modais
  // ================================

  const [isFormModalOpen, setIsFormModalOpen] =
    useState(false);

  const [editingInsumo, setEditingInsumo] =
    useState<Insumo | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [deletingInsumo, setDeletingInsumo] =
    useState<Insumo | null>(null);

  // ================================
  // Toast notifications
  // ================================

  const [toasts, setToasts] =
    useState<ToastMessage[]>([]);

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
  // Carregar insumos do backend
  // ================================

  useEffect(() => {
    async function carregarInsumos() {
      try {
        setLoading(true);

        const perfil = await buscarPerfilEmpresa();
        setTemPerfil(!!perfil);

        if (!perfil) return; // não tentar carregar dados sem perfil

        const dados = await listarInsumos();

        setInsumos(dados);
      } catch (error) {
        console.error(
          "Erro ao carregar insumos:",
          error
        );

        addToast(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os insumos.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }

    void carregarInsumos();
  }, []);

  // ================================
  // Abrir modal de cadastro
  // ================================

  const handleOpenCreateModal = () => {
    setEditingInsumo(null);
    setIsFormModalOpen(true);
  };

  // ================================
  // Abrir modal de edição
  // ================================

  const handleOpenEditModal = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setIsFormModalOpen(true);
  };

  // ================================
  // Salvar / editar insumo
  // ================================

  const handleSaveInsumo = async (
    formData: Omit<Insumo, "idInsumo">
  ) => {
    try {
      const dados = {
        nome: formData.nome,
        unidadeMedida: formData.unidadeMedida,
        quantidadePorEmbalagem: Number(
          formData.quantidadePorEmbalagem
        ),
        estoqueAtual: Number(
          formData.estoqueAtual
        ),
        estoqueMinimo: Number(
          formData.estoqueMinimo
        ),
      };

      // ================================
      // Edição
      // ================================

      if (editingInsumo) {
        const insumoAtualizado =
          await editarInsumo(
            editingInsumo.idInsumo,
            dados
          );

        setInsumos((prev) =>
          prev.map((item) =>
            item.idInsumo ===
            insumoAtualizado.idInsumo
              ? insumoAtualizado
              : item
          )
        );

        addToast(
          `Insumo "${formData.nome}" atualizado com sucesso!`,
          "success"
        );
      }

      // ================================
      // Cadastro
      // ================================

      else {
        const novoInsumo =
          await cadastrarInsumo(dados);

        setInsumos((prev) => [
          novoInsumo,
          ...prev,
        ]);

        addToast(
          `Insumo "${formData.nome}" cadastrado com sucesso!`,
          "success"
        );
      }

      // Fecha o modal
      setIsFormModalOpen(false);
      setEditingInsumo(null);
    } catch (error) {
      console.error(
        "Erro ao salvar insumo:",
        error
      );

      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o insumo.",
        "error"
      );
    }
  };

  // ================================
  // Abrir modal de exclusão
  // ================================

  const handleOpenDeleteModal = (
    insumo: Insumo
  ) => {
    setDeletingInsumo(insumo);
    setIsDeleteModalOpen(true);
  };

  // ================================
  // Confirmar exclusão
  // ================================

  const handleConfirmDelete = async () => {
    if (!deletingInsumo) {
      return;
    }

    try {
      const removedName =
        deletingInsumo.nome;

      await excluirInsumo(
        deletingInsumo.idInsumo
      );

      setInsumos((prev) =>
        prev.filter(
          (item) =>
            item.idInsumo !==
            deletingInsumo.idInsumo
        )
      );

      addToast(
        `Insumo "${removedName}" excluído com sucesso!`,
        "info"
      );

      setIsDeleteModalOpen(false);
      setDeletingInsumo(null);
    } catch (error) {
      console.error(
        "Erro ao excluir insumo:",
        error
      );

      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o insumo.",
        "error"
      );
    }
  };

  // ================================
  // Métricas
  // ================================

  const totalInsumos = insumos.length;

  const lowStockCount = useMemo(() => {
    return insumos.filter(
      (item) =>
        item.estoqueAtual <=
        item.estoqueMinimo
    ).length;
  }, [insumos]);

  // ================================
  // Filtragem e ordenação
  // ================================

  const filteredInsumos = useMemo(() => {
    let result = [...insumos];

    // Busca por nome
    if (searchTerm.trim()) {
      const term =
        searchTerm.toLowerCase();

      result = result.filter((item) =>
        item.nome
          .toLowerCase()
          .includes(term)
      );
    }

    // Filtro
    if (
      activeFilter ===
      "estoque_baixo"
    ) {
      result = result.filter(
        (item) =>
          item.estoqueAtual <=
          item.estoqueMinimo
      );
    } else if (
      activeFilter === "mL" ||
      activeFilter === "g" ||
      activeFilter === "unidade"
    ) {
      result = result.filter(
        (item) =>
          item.unidadeMedida ===
          activeFilter
      );
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === "nome_asc") {
        return a.nome.localeCompare(
          b.nome
        );
      }

      if (sortBy === "nome_desc") {
        return b.nome.localeCompare(
          a.nome
        );
      }

      if (sortBy === "estoque_asc") {
        return (
          a.estoqueAtual -
          b.estoqueAtual
        );
      }

      if (sortBy === "estoque_desc") {
        return (
          b.estoqueAtual -
          a.estoqueAtual
        );
      }

      return 0;
    });

    return result;
  }, [
    insumos,
    searchTerm,
    activeFilter,
    sortBy,
  ]);

  // ================================
  // Interface
  // ================================

  return (
    <AppShell mobileTitle="Insumos">
          {temPerfil === false && <SemPerfilBanner />}

          {/* Título */}
          <div className="relative mb-6">
            <h1 className="font-display font-bold text-4xl sm:text-[40px] text-wine tracking-tight">
              Insumos
            </h1>

            <p className="mt-1.5 max-w-[560px] text-sm font-medium text-ink/70 sm:text-[15px] lg:max-w-[410px] xl:max-w-[560px]">
              Gerencie os produtos que você utiliza nos seus procedimentos
            </p>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 right-6 z-10 hidden select-none lg:block xl:right-10"
            >
              <GlassBottle size={140} />
            </div>
          </div>

          {/* Card principal */}
          <div className="glass-strong glass-border-iridescent rounded-[32px] p-6 shadow-sm w-full transition-all sm:p-8">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 relative">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-petal/70 to-transparent" />

              {/* Contador */}
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base sm:text-lg text-wine">
                  Seus insumos
                </span>

                <span className="rounded-full bg-pale px-2.5 py-1 text-xs font-bold text-wine tabular-nums">
                  {totalInsumos}
                </span>
              </div>

              {/* Busca + botão */}
              <div className="flex items-center gap-3">

                <div className="relative">
                  <Search className="w-4 h-4 text-petal absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                  <input
                    type="text"
                    id="input-busca-insumo"
                    placeholder="Buscar insumo..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-full border border-petal/70 bg-white/65 pl-10 pr-8 text-sm text-ink placeholder-ink/40 outline-none transition-all duration-250 focus:border-berry focus:ring-4 focus:ring-berry/15 sm:w-60 sm:focus:w-64"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm("")
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-petal hover:text-wine"
                      aria-label="Limpar busca"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  id="btn-novo-insumo-header"
                  onClick={
                    handleOpenCreateModal
                  }
                  className="shine inline-flex items-center justify-center gap-1.5 rounded-full border border-white/45 bg-gradient-to-br from-[#D13E66] to-berry px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_12px_-5px_rgba(107,21,48,0.32)] transition-all hover:from-wine hover:to-wine active:scale-[0.98] cursor-pointer whitespace-nowrap sm:px-5 sm:text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Insumo</span>
                </button>
              </div>
            </div>

            {/* Corpo */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-berry mx-auto mb-3 animate-spin" />

                  <p className="font-bold text-wine text-sm">
                    Carregando insumos...
                  </p>

                  <p className="text-xs text-wine/60 mt-1">
                    Buscando os dados no servidor.
                  </p>
                </div>
              </div>
            ) : totalInsumos === 0 ? (
              <EmptyState
                onNewInsumo={
                  handleOpenCreateModal
                }
              />
            ) : (
              <div className="space-y-4 pt-5">

                {/* Filtros e ordenação */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/45 p-2 rounded-full border border-white/80 shadow-inner shadow-wine/5">

                  {/* Filtros */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">

                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilter(
                          "todos"
                        )
                      }
                      className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeFilter ===
                        "todos"
                          ? "bg-berry text-white shadow-xs"
                          : "bg-white text-wine border border-petal/60 hover:bg-pale"
                      }`}
                    >
                      Todos ({totalInsumos})
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilter(
                          "estoque_baixo"
                        )
                      }
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeFilter ===
                        "estoque_baixo"
                          ? "bg-berry text-white shadow-xs"
                          : lowStockCount > 0
                          ? "bg-white text-berry border border-berry/50 hover:bg-pale"
                          : "bg-white text-wine border border-petal/60 hover:bg-pale"
                      }`}
                    >
                      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${activeFilter === "estoque_baixo" ? "bg-white" : "bg-berry animate-pulse"}`} />

                      <span>
                        Estoque baixo (
                        {lowStockCount})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilter(
                          "mL"
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeFilter ===
                        "mL"
                          ? "bg-wine text-white shadow-xs"
                          : "bg-white text-wine border border-petal/60 hover:bg-pale"
                      }`}
                    >
                      mL
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilter("g")
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeFilter ===
                        "g"
                          ? "bg-wine text-white shadow-xs"
                          : "bg-white text-wine border border-petal/60 hover:bg-pale"
                      }`}
                    >
                      g
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilter(
                          "unidade"
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeFilter ===
                        "unidade"
                          ? "bg-wine text-white shadow-xs"
                          : "bg-white text-wine border border-petal/60 hover:bg-pale"
                      }`}
                    >
                      Unidades
                    </button>
                  </div>

                  {/* Ordenação */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as SortOption)}
                    >
                      <SelectTrigger
                        id="select-sort"
                        className="h-9 w-auto rounded-full border-petal bg-white px-3 text-xs font-bold"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nome_asc">Nome (A - Z)</SelectItem>
                        <SelectItem value="nome_desc">Nome (Z - A)</SelectItem>
                        <SelectItem value="estoque_asc">Menor Estoque</SelectItem>
                        <SelectItem value="estoque_desc">Maior Estoque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Feedback dos filtros */}
                {(searchTerm ||
                  activeFilter !==
                    "todos") && (
                  <div className="flex items-center justify-between px-1 text-xs text-wine font-medium">
                    <p>
                      Mostrando{" "}
                      <span className="font-bold text-berry">
                        {
                          filteredInsumos.length
                        }
                      </span>{" "}
                      de{" "}
                      {totalInsumos}{" "}
                      insumos
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setActiveFilter(
                          "todos"
                        );
                      }}
                      className="text-berry hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />

                      <span>
                        Limpar filtros
                      </span>
                    </button>
                  </div>
                )}

                {/* Resultados */}
                {filteredInsumos.length ===
                0 ? (
                  <div className="py-10 text-center">
                    <Package className="w-10 h-10 text-petal mx-auto mb-2" />

                    <p className="font-bold text-wine text-sm">
                      Nenhum insumo encontrado
                    </p>

                    <p className="text-xs text-wine/70 mt-1">
                      Ajuste o termo de busca ou filtros.
                    </p>
                  </div>
                ) : (
                  <>
                    <InsumoTable
                      insumos={
                        filteredInsumos
                      }
                      onEdit={
                        handleOpenEditModal
                      }
                      onDelete={
                        handleOpenDeleteModal
                      }
                    />

                    <InsumoCardList
                      insumos={
                        filteredInsumos
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

      {/* Modal: Cadastro / Edição */}
      <InsumoFormModal
        isOpen={isFormModalOpen}
        editingInsumo={
          editingInsumo
        }
        onSave={handleSaveInsumo}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingInsumo(null);
        }}
      />

      {/* Modal: Exclusão */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        insumo={deletingInsumo}
        onConfirm={
          handleConfirmDelete
        }
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingInsumo(null);
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