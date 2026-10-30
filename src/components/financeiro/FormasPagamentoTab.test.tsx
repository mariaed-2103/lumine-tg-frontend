import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FormasPagamentoTab } from "./FormasPagamentoTab";

afterEach(cleanup);

describe("validação das formas de pagamento", () => {
  it("mostra os campos obrigatórios e impede cadastro vazio", async () => {
    const user = userEvent.setup();
    const onAddForma = vi.fn().mockResolvedValue(undefined);
    render(
      <FormasPagamentoTab
        formasPagamento={[]}
        onAddForma={onAddForma}
        onUpdateForma={vi.fn().mockResolvedValue(undefined)}
        onDeleteRequest={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Nova Forma de Pagamento" }));
    await user.clear(screen.getByLabelText("Taxa percentual aplicada (%) *"));
    await user.click(screen.getByRole("button", { name: "Cadastrar Forma" }));

    expect(screen.getByText("O nome da forma de pagamento é obrigatório")).toBeTruthy();
    expect(screen.getByText("Informe uma taxa percentual válida entre 0% e 100%")).toBeTruthy();
    expect(onAddForma).not.toHaveBeenCalled();
  });
});
