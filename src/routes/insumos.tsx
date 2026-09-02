import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  X,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import { Insumo, FilterOption, SortOption } from "@/components/insumos/types";
import { EmptyState } from "@/components/insumos/EmptyState";
import { InsumoTable } from "@/components/insumos/InsumoTable";
import { InsumoCardList } from "@/components/insumos/InsumoCardList";
import { InsumoFormModal } from "@/components/insumos/InsumoFormModal";
import { DeleteConfirmModal } from "@/components/insumos/DeleteConfirmModal";
import { Toast, ToastMessage } from "@/components/insumos/Toast";

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
  const navigate = useNavigate();

  // Primary state: initialized EMPTY as mandated
  const [insumos, setInsumos] = useState<Insumo[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("todos");
  const [sortBy, setSortBy] = useState<SortOption>("nome_asc");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingInsumo, setDeletingInsumo] = useState<Insumo | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    message: string,
    type: "success" | "info" | "error" = "success"
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Handlers for Form Modal (Create / Edit)
  const handleOpenCreateModal = () => {
    setEditingInsumo(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setIsFormModalOpen(true);
  };

  const handleSaveInsumo = (formData: Omit<Insumo, "idInsumo">) => {
    if (editingInsumo) {
      setInsumos((prev) =>
        prev.map((item) =>
          item.idInsumo === editingInsumo.idInsumo
            ? { ...item, ...formData }
            : item
        )
      );
      addToast(`Insumo "${formData.nome}" atualizado com sucesso!`, "success");
    } else {
      const newInsumo: Insumo = {
        ...formData,
        idInsumo: `ins-${Date.now()}`,
        dataCadastro: new Date().toISOString(),
      };
      setInsumos((prev) => [newInsumo, ...prev]);
      addToast(`Insumo "${formData.nome}" cadastrado com sucesso!`, "success");
    }
    setIsFormModalOpen(false);
    setEditingInsumo(null);
  };

  // Handlers for Delete Modal
  const handleOpenDeleteModal = (insumo: Insumo) => {
    setDeletingInsumo(insumo);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingInsumo) {
      const removedName = deletingInsumo.nome;
      setInsumos((prev) =>
        prev.filter((item) => item.idInsumo !== deletingInsumo.idInsumo)
      );
      addToast(`Insumo "${removedName}" excluído com sucesso!`, "info");
      setIsDeleteModalOpen(false);
      setDeletingInsumo(null);
    }
  };

  // Computed metrics
  const totalInsumos = insumos.length;
  const lowStockCount = useMemo(() => {
    return insumos.filter((item) => item.estoqueAtual <= item.estoqueMinimo)
      .length;
  }, [insumos]);

  // Filtered & Sorted Insumos
  const filteredInsumos = useMemo(() => {
    let result = [...insumos];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => item.nome.toLowerCase().includes(term));
    }

    if (activeFilter === "estoque_baixo") {
      result = result.filter((item) => item.estoqueAtual <= item.estoqueMinimo);
    } else if (
      activeFilter === "mL" ||
      activeFilter === "g" ||
      activeFilter === "unidade"
    ) {
      result = result.filter((item) => item.unidadeMedida === activeFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "nome_asc") return a.nome.localeCompare(b.nome);
      if (sortBy === "nome_desc") return b.nome.localeCompare(a.nome);
      if (sortBy === "estoque_asc") return a.estoqueAtual - b.estoqueAtual;
      if (sortBy === "estoque_desc") return b.estoqueAtual - a.estoqueAtual;
      return 0;
    });

    return result;
  }, [insumos, searchTerm, activeFilter, sortBy]);

  return (
    <main className="min-h-screen bg-pale flex flex-col font-sans antialiased selection:bg-petal selection:text-wine p-4 sm:p-6 lg:p-8">
      {/* Centered App Container with Sidebar & Main Area */}
      <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar Placeholder: Menu do sistema / Espaço reservado */}
        <aside className="w-52 sm:w-56 shrink-0 rounded-3xl border border-dashed border-petal p-6 hidden lg:flex flex-col min-h-[580px] bg-transparent">
          <span className="font-bold text-sm text-wine">Menu do sistema</span>
          <span className="text-xs text-wine/60 mt-1 font-medium">
            Espaço reservado
          </span>
        </aside>

        {/* Right Section: Main Insumos Content */}
        <div className="flex-1 w-full min-w-0">
          {/* Breadcrumb: < Voltar / Insumos */}
          <div className="flex items-center gap-2 text-xs font-semibold text-wine/80 mb-3">
            <button
              type="button"
              onClick={() => void navigate({ to: "/dashboard" })}
              className="hover:text-wine transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>&lt; Voltar</span>
            </button>
            <span className="text-wine/40">/</span>
            <span className="font-bold text-wine">Insumos</span>
          </div>

          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-wine tracking-tight">
              Insumos
            </h1>
            <p className="text-xs sm:text-sm text-wine/80 mt-1 font-medium">
              Gerencie os produtos que você utiliza nos seus procedimentos
            </p>
          </div>

          {/* Main White Card Container */}
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-petal/40 w-full transition-all">
            {/* Top Toolbar inside the Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-petal/20">
              {/* Left: Seus Insumos Count */}
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base sm:text-lg text-wine">
                  Seus insumos
                </span>
                <span className="text-sm font-medium text-wine/60">
                  {totalInsumos}
                </span>
              </div>

              {/* Right: Search Input & + Novo Insumo Button */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-petal absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="input-busca-insumo"
                    placeholder="Buscar insumo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-white rounded-full border border-petal text-xs text-ink placeholder-petal focus:outline-none focus:ring-2 focus:ring-rose/20 transition-all w-44 sm:w-56"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
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
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center justify-center gap-1.5 bg-berry hover:bg-wine text-white font-bold px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm transition-all shadow-md shadow-berry/20 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Insumo</span>
                </button>
              </div>
            </div>

            {/* Body inside Card */}
            {totalInsumos === 0 ? (
              <EmptyState onNewInsumo={handleOpenCreateModal} />
            ) : (
              <div className="space-y-4 pt-5">
                {/* Filter Tabs & Sorting */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-cream p-3 rounded-2xl border border-petal/40">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setActiveFilter("todos")}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeFilter === "todos"
                          ? "bg-berry text-white shadow-xs"
                          : "bg-white text-wine border border-petal/60 hover:bg-pale"
                      }`}
                    >
                      Todos ({totalInsumos})
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFilter("estoque_baixo")}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeFilter === "estoque_baixo"
                          ? "bg-berry text-white shadow-xs"
                          : lowStockCount > 0
                          ? "bg-white text-berry border border-berry/50 hover:bg-pale"
                          : "bg-white text-wine border border-petal/60 hover:bg-pale"
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Estoque baixo ({lowStockCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFilter("mL")}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeFilter === "mL"
                          ? "bg-wine text-white shadow-xs"
                          : "bg-white text-wine border border-petal/60 hover:bg-pale"
                      }`}
                    >
                      mL
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFilter("g")}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeFilter === "g"
                          ? "bg-wine text-white shadow-xs"
                          : "bg-white text-wine border border-petal/60 hover:bg-pale"
                      }`}
                    >
                      g
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFilter("unidade")}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeFilter === "unidade"
                          ? "bg-wine text-white shadow-xs"
                          : "bg-white text-wine border border-petal/60 hover:bg-pale"
                      }`}
                    >
                      Unidades
                    </button>
                  </div>

                  {/* Sort dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <select
                        id="select-sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-white border border-petal text-xs font-bold text-wine rounded-full px-3 py-1.5 pr-7 outline-none focus:ring-2 focus:ring-rose/20 cursor-pointer appearance-none"
                      >
                        <option value="nome_asc">Nome (A - Z)</option>
                        <option value="nome_desc">Nome (Z - A)</option>
                        <option value="estoque_asc">Menor Estoque</option>
                        <option value="estoque_desc">Maior Estoque</option>
                      </select>
                      <SlidersHorizontal className="w-3 h-3 text-berry absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Filter Feedback if active */}
                {(searchTerm || activeFilter !== "todos") && (
                  <div className="flex items-center justify-between px-1 text-xs text-wine font-medium">
                    <p>
                      Mostrando{" "}
                      <span className="font-bold text-berry">
                        {filteredInsumos.length}
                      </span>{" "}
                      de {totalInsumos} insumos
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setActiveFilter("todos");
                      }}
                      className="text-berry hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Limpar filtros</span>
                    </button>
                  </div>
                )}

                {/* Empty filter results or Table */}
                {filteredInsumos.length === 0 ? (
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
                      insumos={filteredInsumos}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                    />
                    <InsumoCardList
                      insumos={filteredInsumos}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Cadastro / Edição de Insumo */}
      <InsumoFormModal
        isOpen={isFormModalOpen}
        editingInsumo={editingInsumo}
        onSave={handleSaveInsumo}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingInsumo(null);
        }}
      />

      {/* Modal: Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        insumo={deletingInsumo}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingInsumo(null);
        }}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </main>
  );
}
