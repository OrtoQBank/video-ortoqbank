import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserInfos from "./user-infos";

// Mock Clerk useUser hook
const mockUseUser = vi.fn();
vi.mock("@clerk/nextjs", () => ({
  useUser: () => mockUseUser(),
}));

// Mock session provider
const mockUseSession = vi.fn();
vi.mock("@/components/providers/session-provider", () => ({
  useSession: () => mockUseSession(),
}));

describe("UserInfos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      isAdmin: false,
      isSuperAdmin: false,
      globalRole: "user",
      tenantRole: "member",
      hasAccess: true,
      isLoading: false,
    });
  });

  it("should render", () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: {
        fullName: "Test User",
        imageUrl: null,
        primaryEmailAddress: { emailAddress: "test@example.com" },
      },
    });
    render(<UserInfos />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("should render with loading state", () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      user: null,
    });
    render(<UserInfos />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("should render with admin role", () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: {
        fullName: "Admin User",
        imageUrl: null,
        primaryEmailAddress: { emailAddress: "admin@example.com" },
      },
    });
    mockUseSession.mockReturnValue({
      isAdmin: true,
      isSuperAdmin: false,
      globalRole: "admin",
      tenantRole: "admin",
      hasAccess: true,
      isLoading: false,
    });
    render(<UserInfos />);
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });
});
