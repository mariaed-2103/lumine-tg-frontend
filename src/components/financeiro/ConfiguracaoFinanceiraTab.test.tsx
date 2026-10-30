import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfiguracaoFinanceiraTab } from "./ConfiguracaoFinanceiraTab";

afterEach(cleanup);

const configuracao = {
  margemSeguranca: 10,
  lucroDesejado: 20,
  provisaoFeriasAtiva: false,
  percentualProvisaoFerias: null,
};

describe("validação da configuração financeira", () => {
  it("exibe erro quando margem e lucro somam 100% e não envia o formulário", async () => {
    const user = userEvent.setup();
    const onSaveConfiguracao = vi.fn().mockResolvedValue(undefined);
    render(
      <ConfiguracaoFinanceiraTab
        configuracao={configuracao}
        onSaveConfiguracao={onSaveConfiguracao}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar configuração" }));
    await user.clear(screen.getByLabelText("Margem de segurança (%) *"));
    await user.type(screen.getByLabelText("Margem de segurança (%) *"), "50");
    await user.clear(screen.getByLabelText("Lucro desejado (%) *"));
    await user.type(screen.getByLabelText("Lucro desejado (%) *"), "50");
    await user.click(screen.getByRole("button", { name: "Salvar Configuração" }));

    expect(
      screen.getByText(
        "A soma da margem de segurança com o lucro desejado deve ser menor que 100%",
      ),
    ).toBeTruthy();
    expect(onSaveConfiguracao).not.toHaveBeenCalled();
  });

  it("exibe erro se a provisão está ativa sem percentual", async () => {
    const user = userEvent.setup();
    const onSaveConfiguracao = vi.fn().mockResolvedValue(undefined);
    render(
      <ConfiguracaoFinanceiraTab
        configuracao={configuracao}
        onSaveConfiguracao={onSaveConfiguracao}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar configuração" }));
    await user.click(screen.getByRole("switch"));
    await user.clear(screen.getByLabelText("Percentual de provisão de férias (%) *"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar Configuração" }));

    expect(screen.getByText("Informe um percentual maior que zero")).toBeTruthy();
    expect(onSaveConfiguracao).not.toHaveBeenCalled();
  });
});
