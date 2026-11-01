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
      className="flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-full border border-petal/40 bg-white/45 p-1.5 shadow-[inset_0_1px_3px_rgba(107,21,48,0.07)] sm:w-auto"
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
          className={`inline-flex h-9 flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border px-4 text-[13px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5] sm:flex-none ${
            value === tab.id
              ? "border-white/80 bg-gradient-to-r from-berry to-rose text-white shadow-md shadow-berry/25"
              : "border-transparent text-wine/75 hover:bg-pale hover:text-wine"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
