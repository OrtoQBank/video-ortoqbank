import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CategoryForm } from "./category-form";

// Mock tenant hooks
const mockCreateCategory = vi.fn(() => Promise.resolve());

vi.mock("@/hooks/use-tenant-convex", () => ({
  useTenantMutation: vi.fn(() => mockCreateCategory),
  useTenantReady: vi.fn(() => true),
}));

// Mock useToast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock useErrorModal hook
vi.mock("@/hooks/use-error-modal", () => ({
  useErrorModal: () => ({
    error: { isOpen: false, title: "", message: "" },
    showError: vi.fn(),
    hideError: vi.fn(),
  }),
}));

describe("CategoryForm", () => {
  it("should render", () => {
    render(<CategoryForm />);
    expect(screen.getByText("Criar Categoria")).toBeInTheDocument();
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Descrição")).toBeInTheDocument();
    expect(screen.getByText("Limpar")).toBeInTheDocument();
  });
});
