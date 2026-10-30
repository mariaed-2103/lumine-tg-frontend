import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { FinanceiroTabs, type FinanceiroTabId } from "./FinanceiroTabs";

afterEach(cleanup);

function Harness() {
  const [activeTab, setActiveTab] = useState<FinanceiroTabId>("configuracao");
  return (
    <>
      <FinanceiroTabs value={activeTab} onChange={setActiveTab} />
      <section role="tabpanel" id="painel-precificacao">
        {activeTab}
      </section>
    </>
  );
}

describe("navegação das abas de precificação", () => {
  it("troca o painel ativo ao selecionar formas de pagamento e simulação", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("tab", { name: "Formas de pagamento" }));
    expect(
      screen.getByRole("tab", { name: "Formas de pagamento" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("pagamentos");

    await user.click(screen.getByRole("tab", { name: "Simulação de preço" }));
    expect(
      screen.getByRole("tab", { name: "Simulação de preço" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("simulacao");
  });
});
