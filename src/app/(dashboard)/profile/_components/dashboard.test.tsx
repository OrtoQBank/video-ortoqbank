import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "./dashboard";

// Mock useCurrentUser hook
const mockUseCurrentUser = vi.fn();
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

// Mock tenant hooks
const mockUseTenantQuery = vi.fn();
vi.mock("@/hooks/use-tenant-convex", () => ({
  useTenantQuery: () => mockUseTenantQuery(),
  useTenantReady: vi.fn(() => true),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default data", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { clerkUserId: "test-user" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseTenantQuery
      .mockReturnValueOnce({ totalLessons: 10 }) // contentStats
      .mockReturnValueOnce(5) // completedCountResult
      .mockReturnValueOnce(3); // viewedCountResult

    render(<Dashboard />);
    expect(screen.getByText("Aulas Concluídas")).toBeInTheDocument();
    expect(screen.getByText("Progresso Geral")).toBeInTheDocument();
    expect(screen.getByText("Aulas Iniciadas")).toBeInTheDocument();
  });

  it("should render with custom props", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { clerkUserId: "test-user" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseTenantQuery
      .mockReturnValueOnce({ totalLessons: 20 }) // totalLessons
      .mockReturnValueOnce(10) // completedCountResult
      .mockReturnValueOnce(5); // viewedCountResult

    render(<Dashboard />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("should render with loading state", () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });
    mockUseTenantQuery.mockReturnValue(undefined); // Loading state

    render(<Dashboard />);
    expect(screen.getByText("Aulas Concluídas")).toBeInTheDocument();
    expect(screen.getByText("Progresso Geral")).toBeInTheDocument();
    expect(screen.getByText("Aulas Iniciadas")).toBeInTheDocument();
  });
});
