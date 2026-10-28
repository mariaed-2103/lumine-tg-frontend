import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";

import type {
  DespesaFixa,
  DespesaVariavel,
  CompraInsumo,
  FormaPagamento,
  ConfiguracaoFinanceira,
  FinanceiroTab,
} from "@/components/financeiro/types";
import type { Insumo } from "@/components/insumos/types";

import { CompetenciaSelector } from "@/components/financeiro/CompetenciaSelector";
import { DespesasFixasTab } from "@/components/financeiro/DespesasFixasTab";
import { DespesasVariaveisTab } from "@/components/financeiro/DespesasVariaveisTab";
import { ComprasTab } from "@/components/financeiro/ComprasTab";
import { FormasPagamentoTab } from "@/components/financeiro/FormasPagamentoTab";
import { ConfiguracaoFinanceiraTab } from "@/components/financeiro/ConfiguracaoFinanceiraTab";
import { FinanceiroDeleteModal } from "@/components/financeiro/FinanceiroDeleteModal";
import { Toast, type ToastMessage } from "@/components/insumos/Toast";

import {
  listarDespesasFixas,
  cadastrarDespesaFixa,
  editarDespesaFixa,
  excluirDespesaFixa,
} from "@/services/despesaFixaService";
import {
  listarDespesasVariaveis,
  cadastrarDespesaVariavel,
  editarDespesaVariavel,
  excluirDespesaVariavel,
} from "@/services/despesaVariavelService";
import {
  listarCompras,
  cadastrarCompra,
  editarCompra,
  excluirCompra,
} from "@/services/compraService";
import {
  listarFormasPagamento,
  cadastrarFormaPagamento,
  editarFormaPagamento,
  excluirFormaPagamento,
} from "@/services/formaPagamentoService";
import {
  buscarConfiguracaoFinanceira,
  salvarConfiguracaoFinanceira,
} from "@/services/configuracaoFinanceiraService";
import { listarInsumos } from "@/services/insumoService";
import { apiFetch } from "@/services/api";

import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/gestao-financeira")({
  head: () => ({
    meta: [
      { title: "Gestão Financeira | Lumine" },
      {
        name: "description",
        content:
          "Gerencie despesas fixas, variáveis, compras de insumos, formas de pagamento e configurações financeiras.",
      },
    ],
  }),
  component: GestaoFinanceiraPage,
});

// Configuração padrão usada quando o backend ainda não tem registro criado
const CONFIGURACAO_PADRAO: ConfiguracaoFinanceira = {
  margemSeguranca: 10,
  lucroDesejado: 20,
  provisaoFeriasAtiva: false,
  percentualProvisaoFerias: null,
};

// Rótulos das abas para exibição
const TABS: { id: FinanceiroTab; label: string }[] = [
  { id: "despesas-fixas", label: "Despesas Fixas" },
  { id: "despesas-variaveis", label: "Despesas Variáveis" },
  { id: "compras", label: "Compras" },
  { id: "formas-pagamento", label: "Formas de Pagamento" },
  { id: "configuracao", label: "Configuração" },
];

// Tipo genérico para o modal de exclusão
type DeleteTarget =
  | { tipo: "despesa-fixa"; item: DespesaFixa }
  | { tipo: "despesa-variavel"; item: DespesaVariavel }
  | { tipo: "compra"; item: CompraInsumo; nomeInsumo: string }
  | { tipo: "forma-pagamento"; item: FormaPagamento };

function GestaoFinanceiraPage() {
  const navigate = useNavigate();

  // ================================
  // Competência (mês / ano)
  // ================================
  const hoje = new Date();
  const [competenciaMes, setCompetenciaMes] = useState(hoje.getMonth() + 1);
  const [competenciaAno, setCompetenciaAno] = useState(hoje.getFullYear());

  // ================================
  // Aba ativa
  // ================================
  const [abaAtiva, setAbaAtiva] = useState<FinanceiroTab>("despesas-fixas");

  // ================================
  // Dados do backend
  // ================================
  const [despesasFixas, setDespesasFixas] = useState<DespesaFixa[]>([]);
  const [despesasVariaveis, setDespesasVariaveis] = useState<DespesaVariavel[]>([]);
  const [compras, setCompras] = useState<CompraInsumo[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoFinanceira>(CONFIGURACAO_PADRAO);
  const [insumos, setInsumos] = useState<Insumo[]>([]);

  const [loading, setLoading] = useState(true);
  const [idPerfilEmpresa, setIdPerfilEmpresa] = useState<number | null>(null);

  // ================================
  // Modal de exclusão genérico
  // ================================
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ================================
  // Toasts
  // ================================
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

  // ================================
  // Carga inicial de dados
  // ================================
  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [fixas, variaveis, comprasData, formas, insumosData] =
          await Promise.allSettled([
            listarDespesasFixas(),
            listarDespesasVariaveis(),
            listarCompras(),
            listarFormasPagamento(),
            listarInsumos(),
          ]);

        if (fixas.status === "fulfilled") setDespesasFixas(fixas.value);
        else console.error("Erro ao carregar despesas fixas:", fixas.reason);

        if (variaveis.status === "fulfilled") setDespesasVariaveis(variaveis.value);
        else console.error("Erro ao carregar despesas variáveis:", variaveis.reason);

        if (comprasData.status === "fulfilled") setCompras(comprasData.value);
        else console.error("Erro ao carregar compras:", comprasData.reason);

        if (formas.status === "fulfilled") setFormasPagamento(formas.value);
        else console.error("Erro ao carregar formas de pagamento:", formas.reason);

        if (insumosData.status === "fulfilled") setInsumos(insumosData.value);
        else console.error("Erro ao carregar insumos:", insumosData.reason);

        // Busca o perfil para obter o idPerfilEmpresa exigido pela API financeira.
        const idUsuario = localStorage.getItem("idUsuario");

        if (!idUsuario) {
          addToast(
            "Usuário não identificado. Faça login novamente para carregar a configuração financeira.",
            "error"
          );
        } else {
          try {
            const perfilResponse = await apiFetch(`/perfis-empresa/usuario/${idUsuario}`);

            if (perfilResponse.status === 404) {
              addToast(
                "Você ainda não possui um perfil de empresa. Cadastre seu perfil antes de configurar os dados financeiros.",
                "info"
              );
            } else if (!perfilResponse.ok) {
              throw new Error("Não foi possível identificar o perfil da empresa.");
            } else {
              const perfil: { idPerfilEmpresa: number } =
                await perfilResponse.json();

              if (!perfil.idPerfilEmpresa) {
                throw new Error("O backend não retornou o identificador do perfil da empresa.");
              }

              setIdPerfilEmpresa(perfil.idPerfilEmpresa);

              try {
                const config = await buscarConfiguracaoFinanceira(
                  perfil.idPerfilEmpresa
                );
                setConfiguracao(config);
              } catch (error) {
                // Se ainda não existe configuração, mantém os valores padrão.
                console.info(
                  "Não foi possível carregar a configuração financeira; os valores padrão serão exibidos.",
                  error
                );
                addToast(
                  "Configuração financeira não encontrada. Confira os valores e salve para cadastrá-la.",
                  "info"
                );
              }
            }
          } catch (error) {
            console.error("Erro ao identificar perfil da empresa:", error);
            addToast(
              error instanceof Error
                ? error.message
                : "Não foi possível identificar o perfil da empresa.",
              "error"
            );
          }
        }
      } finally {
        setLoading(false);
      }
    }

    void carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================================
  // Handlers — Despesas Fixas
  // ================================

  const handleAddDespesaFixa = async (
    dados: Omit<DespesaFixa, "idDespesa">
  ) => {
    try {
      const nova = await cadastrarDespesaFixa(dados);
      setDespesasFixas((prev) => [nova, ...prev]);
      addToast(`Despesa fixa "${nova.nome}" cadastrada com sucesso!`);
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a despesa fixa.",
        "error"
      );
      throw error; // relança para o componente exibir o isSaving corretamente
    }
  };

  const handleUpdateDespesaFixa = async (
    id: number,
    dados: Omit<DespesaFixa, "idDespesa">
  ) => {
    try {
      const atualizada = await editarDespesaFixa(id, dados);
      setDespesasFixas((prev) =>
        prev.map((item) => (item.idDespesa === id ? atualizada : item))
      );
      addToast(`Despesa fixa "${atualizada.nome}" atualizada com sucesso!`);
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível editar a despesa fixa.",
        "error"
      );
      throw error;
    }
  };

  // ================================
  // Handlers — Despesas Variáveis
  // ================================

  const handleAddDespesaVariavel = async (
    dados: Omit<DespesaVariavel, "idDespesaVariavel">
  ) => {
    try {
      const nova = await cadastrarDespesaVariavel(dados);
      setDespesasVariaveis((prev) => [nova, ...prev]);
      addToast(`Despesa variável "${nova.nome}" registrada com sucesso!`);
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a despesa variável.",
        "error"
      );
      throw error;
    }
  };

  const handleUpdateDespesaVariavel = async (
    id: number,
    dados: Omit<DespesaVariavel, "idDespesaVariavel">
  ) => {
    try {
      const atualizada = await editarDespesaVariavel(id, dados);
      setDespesasVariaveis((prev) =>
        prev.map((item) => (item.idDespesaVariavel === id ? atualizada : item))
      );
      addToast(`Despesa variável "${atualizada.nome}" atualizada com sucesso!`);
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível editar a despesa variável.",
        "error"
      );
      throw error;
    }
  };

  // ================================
  // Handlers — Compras
  // ================================

  const handleAddCompra = async (dados: Omit<CompraInsumo, "idCompra">) => {
    try {
      const nova = await cadastrarCompra(dados);
      setCompras((prev) => [nova, ...prev]);
      addToast("Compra de insumo registrada com sucesso!");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a compra.",
        "error"
      );
      throw error;
    }
  };

  const handleUpdateCompra = async (
    id: number,
    dados: Omit<CompraInsumo, "idCompra">
  ) => {
    try {
      const atualizada = await editarCompra(id, dados);
      setCompras((prev) =>
        prev.map((item) => (item.idCompra === id ? atualizada : item))
      );
      addToast("Compra de insumo atualizada com sucesso!");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível editar a compra.",
        "error"
      );
      throw error;
    }
  };

  // ================================
  // Handlers — Formas de Pagamento
  // ================================

  const handleAddFormaPagamento = async (
    dados: Omit<FormaPagamento, "idFormaPagamento">
  ) => {
    try {
      const nova = await cadastrarFormaPagamento(dados);
      setFormasPagamento((prev) => [...prev, nova]);
      addToast(`Forma de pagamento "${nova.nome}" cadastrada com sucesso!`);
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a forma de pagamento.",
        "error"
      );
      throw error;
    }
  };

  const handleUpdateFormaPagamento = async (
    id: number,
    dados: Omit<FormaPagamento, "idFormaPagamento">
  ) => {
    try {
      const atualizada = await editarFormaPagamento(id, dados);
      setFormasPagamento((prev) =>
        prev.map((item) => (item.idFormaPagamento === id ? atualizada : item))
      );
      addToast(`Forma de pagamento "${atualizada.nome}" atualizada com sucesso!`);
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível editar a forma de pagamento.",
        "error"
      );
      throw error;
    }
  };

  // ================================
  // Handler — Configuração Financeira
  // ================================

  const handleSaveConfiguracao = async (
    dados: Omit<ConfiguracaoFinanceira, "idConfiguracao" | "dataAtualizacao">
  ) => {
    if (idPerfilEmpresa === null) {
      const mensagem =
        "Não foi possível salvar: o perfil da empresa não foi identificado. Confira se seu perfil está cadastrado e tente novamente.";
      addToast(mensagem, "error");
      throw new Error(mensagem);
    }

    try {
      const payload: ConfiguracaoFinanceira = {
        ...configuracao,
        ...dados,
        dataAtualizacao: new Date().toISOString(),
      };
      const salva = await salvarConfiguracaoFinanceira(idPerfilEmpresa, payload);
      setConfiguracao(salva);
      addToast("Configuração financeira salva com sucesso!");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a configuração financeira.",
        "error"
      );
      throw error;
    }
  };

  // ================================
  // Handlers — Modal de Exclusão
  // ================================

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.tipo === "despesa-fixa") {
        await excluirDespesaFixa(deleteTarget.item.idDespesa);
        setDespesasFixas((prev) =>
          prev.filter((d) => d.idDespesa !== deleteTarget.item.idDespesa)
        );
        addToast(
          `Despesa fixa "${deleteTarget.item.nome}" excluída com sucesso!`,
          "info"
        );
      } else if (deleteTarget.tipo === "despesa-variavel") {
        await excluirDespesaVariavel(deleteTarget.item.idDespesaVariavel);
        setDespesasVariaveis((prev) =>
          prev.filter(
            (d) => d.idDespesaVariavel !== deleteTarget.item.idDespesaVariavel
          )
        );
        addToast(
          `Despesa variável "${deleteTarget.item.nome}" excluída com sucesso!`,
          "info"
        );
      } else if (deleteTarget.tipo === "compra") {
        await excluirCompra(deleteTarget.item.idCompra);
        setCompras((prev) =>
          prev.filter((c) => c.idCompra !== deleteTarget.item.idCompra)
        );
        addToast("Compra excluída com sucesso!", "info");
      } else if (deleteTarget.tipo === "forma-pagamento") {
        await excluirFormaPagamento(deleteTarget.item.idFormaPagamento);
        setFormasPagamento((prev) =>
          prev.filter(
            (f) => f.idFormaPagamento !== deleteTarget.item.idFormaPagamento
          )
        );
        addToast(
          `Forma de pagamento "${deleteTarget.item.nome}" excluída com sucesso!`,
          "info"
        );
      }
      setDeleteTarget(null);
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o item.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Monta as propriedades do modal de exclusão com base no target
  const deleteModalProps = (() => {
    if (!deleteTarget) return null;
    if (deleteTarget.tipo === "despesa-fixa") {
      return {
        title: "Excluir Despesa Fixa",
        itemName: deleteTarget.item.nome,
        itemTypeLabel: "a despesa fixa",
      };
    }
    if (deleteTarget.tipo === "despesa-variavel") {
      return {
        title: "Excluir Despesa Variável",
        itemName: deleteTarget.item.nome,
        itemTypeLabel: "a despesa variável",
      };
    }
    if (deleteTarget.tipo === "compra") {
      return {
        title: "Excluir Compra de Insumo",
        itemName: deleteTarget.nomeInsumo,
        itemTypeLabel: "a compra do insumo",
      };
    }
    if (deleteTarget.tipo === "forma-pagamento") {
      return {
        title: "Excluir Forma de Pagamento",
        itemName: deleteTarget.item.nome,
        itemTypeLabel: "a forma de pagamento",
      };
    }
    return null;
  })();

  // ================================
  // Interface
  // ================================

  return (
    <AppShell mobileTitle="Gestão Financeira">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-wine sm:text-4xl">
          Gestão Financeira
        </h1>
        <p className="mt-1 text-xs font-medium text-wine/80 sm:text-sm">
          Controle suas despesas, compras de insumos, formas de pagamento e parâmetros de precificação
        </p>
      </div>

      {/* Card branco principal */}
      <div className="mt-6 w-full rounded-[32px] border border-petal/40 bg-white p-6 shadow-sm transition-all sm:p-8">
        {/* Header do card: título + seletor de competência */}
        <div className="flex flex-col gap-4 border-b border-petal/20 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-berry shrink-0" />
            <span className="font-display text-base font-bold text-wine sm:text-lg">
              Financeiro
            </span>
          </div>

          {/* Seletor de competência — não visível na aba de configuração */}
          {abaAtiva !== "configuracao" && abaAtiva !== "formas-pagamento" && (
            <CompetenciaSelector
              mes={competenciaMes}
              ano={competenciaAno}
              onMesChange={setCompetenciaMes}
              onAnoChange={setCompetenciaAno}
            />
          )}
        </div>

        {/* Navegação por abas */}
        <div className="mt-4 border-b border-petal/20">
          <nav className="-mb-px flex gap-1 overflow-x-auto scrollbar-none pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAbaAtiva(tab.id)}
                className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-xs font-bold transition-all rounded-t-xl cursor-pointer ${
                  abaAtiva === tab.id
                    ? "border-b-2 border-berry text-berry bg-pale/40"
                    : "text-wine/60 hover:text-wine hover:bg-cream"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo da aba */}
        <div className="mt-6">
          {loading ? (
            <div className="py-16 text-center text-sm font-semibold text-wine/70">
              Carregando dados financeiros...
            </div>
          ) : (
            <>
              {abaAtiva === "despesas-fixas" && (
                <DespesasFixasTab
                  despesas={despesasFixas}
                  competenciaMes={competenciaMes}
                  competenciaAno={competenciaAno}
                  onAddDespesa={handleAddDespesaFixa}
                  onUpdateDespesa={handleUpdateDespesaFixa}
                  onDeleteRequest={(item) =>
                    setDeleteTarget({ tipo: "despesa-fixa", item })
                  }
                />
              )}

              {abaAtiva === "despesas-variaveis" && (
                <DespesasVariaveisTab
                  despesas={despesasVariaveis}
                  competenciaMes={competenciaMes}
                  competenciaAno={competenciaAno}
                  onAddDespesa={handleAddDespesaVariavel}
                  onUpdateDespesa={handleUpdateDespesaVariavel}
                  onDeleteRequest={(item) =>
                    setDeleteTarget({ tipo: "despesa-variavel", item })
                  }
                />
              )}

              {abaAtiva === "compras" && (
                <ComprasTab
                  compras={compras}
                  insumos={insumos}
                  competenciaMes={competenciaMes}
                  competenciaAno={competenciaAno}
                  onAddCompra={handleAddCompra}
                  onUpdateCompra={handleUpdateCompra}
                  onDeleteRequest={(item, nomeInsumo) =>
                    setDeleteTarget({ tipo: "compra", item, nomeInsumo })
                  }
                  onNavigateToInsumos={() => {
                    void navigate({ to: "/insumos" });
                  }}
                />
              )}

              {abaAtiva === "formas-pagamento" && (
                <FormasPagamentoTab
                  formasPagamento={formasPagamento}
                  onAddForma={handleAddFormaPagamento}
                  onUpdateForma={handleUpdateFormaPagamento}
                  onDeleteRequest={(item) =>
                    setDeleteTarget({ tipo: "forma-pagamento", item })
                  }
                />
              )}

              {abaAtiva === "configuracao" && (
                <ConfiguracaoFinanceiraTab
                  configuracao={configuracao}
                  onSaveConfiguracao={handleSaveConfiguracao}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de exclusão genérico */}
      {deleteModalProps && (
        <FinanceiroDeleteModal
          isOpen={!!deleteTarget}
          title={deleteModalProps.title}
          itemName={deleteModalProps.itemName}
          itemTypeLabel={deleteModalProps.itemTypeLabel}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            if (!isDeleting) setDeleteTarget(null);
          }}
        />
      )}

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </AppShell>
  );
}
