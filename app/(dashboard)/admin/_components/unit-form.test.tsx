import { render, screen } from "@testing-library/react";
import { UnitForm } from "./unit-form";

describe("UnitForm", () => {
  it("should render", () => {
    render(<UnitForm categories={[]} />);
    expect(screen.getByText("Unidade")).toBeInTheDocument();
    expect(screen.getByText("Categoria")).toBeInTheDocument();
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Descrição")).toBeInTheDocument();
    expect(screen.getByText("Criar Módulo")).toBeInTheDocument();
  });
});