import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UnitForm } from "./unit-create-form";

// Mock tenant hooks
vi.mock("@/src/hooks/use-tenant-convex", () => ({
  useTenantMutation: vi.fn(() => vi.fn(() => Promise.resolve())),
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

describe("UnitForm", () => {
  it("should render", () => {
    render(<UnitForm categories={[]} onSuccess={() => {}} />);
    expect(screen.getByText("Criar Unidade")).toBeInTheDocument();
  });
});
