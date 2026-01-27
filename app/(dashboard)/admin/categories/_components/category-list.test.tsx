import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CategoryList } from "./category-list";

// Mock tenant hooks
vi.mock("@/hooks/use-tenant-convex", () => ({
  useTenantMutation: vi.fn(() => vi.fn(() => Promise.resolve())),
  useTenantReady: vi.fn(() => true),
}));

describe("CategoryList", () => {
  it("should render", () => {
    render(<CategoryList categories={[]} />);
    expect(screen.getByText("Categorias Cadastradas")).toBeInTheDocument();
    expect(
      screen.getByText("Nenhuma categoria cadastrada ainda."),
    ).toBeInTheDocument();
    expect(screen.getByText("Editar Ordem")).toBeInTheDocument();
  });
});
