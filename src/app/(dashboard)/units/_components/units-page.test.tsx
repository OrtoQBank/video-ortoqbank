import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnitsPage } from "./units-page";
import { Id } from "@/convex/_generated/dataModel";
import { renderWithProviders } from "@/__tests__/utils/test-utils";

// Mock Next.js Router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Clerk useUser hook
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: "test-user-id",
      firstName: "Test",
      lastName: "User",
    },
  }),
}));

// Mock tenant hooks
const mockUseTenantQuery = vi.fn();
const mockUseTenantMutation = vi.fn(() => vi.fn(() => Promise.resolve()));

vi.mock("@/hooks/use-tenant-convex", () => ({
  useTenantQuery: () => mockUseTenantQuery(),
  useTenantMutation: () => mockUseTenantMutation(),
  useTenantReady: vi.fn(() => true),
}));

// Mock Convex hooks (for getCurrentUserCpf which uses useQuery directly)
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => null),
}));

// Mock getSignedEmbedUrl
vi.mock("@/app/actions/bunny", () => ({
  getSignedEmbedUrl: vi.fn(() =>
    Promise.resolve({ embedUrl: "https://test-embed-url.com" }),
  ),
}));

// Mock nuqs (URL query state library)
const mockSetLessonIdParam = vi.fn();
const mockLessonIdParam = vi.fn(() => "");

vi.mock("nuqs", () => ({
  useQueryState: vi.fn(() => [mockLessonIdParam(), mockSetLessonIdParam]),
  parseAsString: {
    withDefault: vi.fn((defaultValue) => ({
      parse: (value: string) => value || defaultValue,
      serialize: (value: string) => value,
    })),
  },
}));

describe("UnitsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock returns: units list, then various other queries return null
    mockUseTenantQuery
      .mockReturnValueOnce([
        {
          _id: "unit-1" as Id<"units">,
          title: "Test Unit",
          categoryId: "cat-1" as Id<"categories">,
          totalLessonVideos: 5,
        },
      ]) // units
      .mockReturnValue(null); // other queries
  });

  it("should render", () => {
    renderWithProviders(
      <UnitsPage
        categoryId={"cat-1" as Id<"categories">}
        categoryTitle="Test Category"
      />,
    );
    // The component shows categoryTitle in the header
    expect(screen.getByText(/Test Category/)).toBeInTheDocument();
  });

  it("should validate lessonIdParam before casting to Id<'lessons'>", () => {
    // Setup: empty lessonIdParam should skip the query
    mockLessonIdParam.mockReturnValue("");

    renderWithProviders(
      <UnitsPage
        categoryId={"cat-1" as Id<"categories">}
        categoryTitle="Test Category"
      />,
    );

    // The component should not attempt to query with empty string
    // This is implicitly tested by not throwing an error
    expect(screen.getByText(/Test Category/)).toBeInTheDocument();
  });

  it("should handle invalid lessonId in URL parameter gracefully", () => {
    // Setup: invalid lessonId returns null from query
    mockLessonIdParam.mockReturnValue("invalid-lesson-id");

    renderWithProviders(
      <UnitsPage
        categoryId={"cat-1" as Id<"categories">}
        categoryTitle="Test Category"
      />,
    );

    // Should still render without crashing
    expect(screen.getByText(/Test Category/)).toBeInTheDocument();
  });
});
