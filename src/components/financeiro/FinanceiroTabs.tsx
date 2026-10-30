export type FinanceiroTabId = "configuracao" | "pagamentos" | "simulacao";

interface FinanceiroTabsProps {
  value: FinanceiroTabId;
  onChange: (tab: FinanceiroTabId) => void;
}

const tabs: { id: FinanceiroTabId; label: string }[] = [
  { id: "configuracao", label: "Configuração" },
  { id: "pagamentos", label: "Formas de pagamento" },
  { id: "simulacao", label: "Simulação de preço" },
];

export function FinanceiroTabs({ value, onChange }: FinanceiroTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Seções de precificação"
      className="mb-6 flex flex-wrap items-center gap-2 border-b border-petal/30 pb-4"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          aria-controls="painel-precificacao"
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
            value === tab.id
              ? "bg-berry text-white shadow-md shadow-berry/20"
              : "text-wine/80 hover:text-wine hover:bg-cream border border-transparent hover:border-petal/40"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
