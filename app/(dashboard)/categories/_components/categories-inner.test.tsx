import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoriesInner } from "./categories-inner";
import { Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Convex hooks
const mockUsePreloadedQuery = vi.fn();

vi.mock("convex/react", () => ({
  usePreloadedQuery: (preloaded: Preloaded<typeof api.categories.list>) => mockUsePreloadedQuery(preloaded),
  Preloaded: {} as Preloaded<typeof api.categories.list>,
}));

// Mock SidebarTrigger
vi.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: ({ className }: { className?: string }) => (
    <button className={className} aria-label="Toggle sidebar">Menu</button>
  ),
}));

describe("CategoriesInner", () => {
  const mockCategories = [
    {
      _id: "cat-1" as Id<"categories">,
      _creationTime: Date.now(),
      title: "Category 1",
      description: "Description 1",
      iconUrl: "/icon1.jpg",
    },
    {
      _id: "cat-2" as Id<"categories">,
      _creationTime: Date.now(),
      title: "Category 2",
      description: "Description 2",
      iconUrl: "/icon2.jpg",
    },
    {
      _id: "cat-3" as Id<"categories">,
      _creationTime: Date.now(),
      title: "Category 3",
      description: "Description 3",
      iconUrl: "/icon3.jpg",
    },
  ];

  const mockPreloadedCategories = {} as Preloaded<typeof api.categories.list>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePreloadedQuery.mockReturnValue(mockCategories);
  });

  it("should render categories inner component", () => {
    render(
      <CategoriesInner
        preloadedCategories={mockPreloadedCategories}
        initialProgress={34}
      />
    );

    const progressLabel = screen.getByText("Progresso Total");
    expect(progressLabel).toBeDefined();

    const progressPercentage = screen.getByText("34%");
    expect(progressPercentage).toBeDefined();
  });

  it("should render all categories", () => {
    render(
      <CategoriesInner
        preloadedCategories={mockPreloadedCategories}
        initialProgress={34}
      />
    );

    expect(screen.getByText("Category 1")).toBeDefined();
    expect(screen.getByText("Category 2")).toBeDefined();
    expect(screen.getByText("Category 3")).toBeDefined();
  });

  it("should render search bar", () => {
    render(
      <CategoriesInner
        preloadedCategories={mockPreloadedCategories}
        initialProgress={34}
      />
    );

    const searchInput = screen.getByPlaceholderText("Pesquise por temas, subtemas e grupos...");
    expect(searchInput).toBeDefined();
  });

  it("should filter categories based on search query", async () => {
    const user = userEvent.setup();
    render(
      <CategoriesInner
        preloadedCategories={mockPreloadedCategories}
        initialProgress={34}
      />
    );

    const searchInput = screen.getByPlaceholderText("Pesquise por temas, subtemas e grupos...");
    await user.type(searchInput, "Category 1");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Category 1")).toBeDefined();
      expect(screen.queryByText("Category 2")).toBeNull();
      expect(screen.queryByText("Category 3")).toBeNull();
    });
  });

  it("should filter categories by description", async () => {
    const user = userEvent.setup();
    render(
      <CategoriesInner
        preloadedCategories={mockPreloadedCategories}
        initialProgress={34}
      />
    );

    const searchInput = screen.getByPlaceholderText("Pesquise por temas, subtemas e grupos...");
    await user.type(searchInput, "Description 2");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Category 2")).toBeDefined();
      expect(screen.queryByText("Category 1")).toBeNull();
      expect(screen.queryByText("Category 3")).toBeNull();
    });
  });

  it("should navigate to module page when category is clicked", async () => {
    const user = userEvent.setup();
    render(
      <CategoriesInner
        preloadedCategories={mockPreloadedCategories}
        initialProgress={34}
      />
    );

    const categoryCard = screen.getByText("Category 1").closest("div[data-slot='card']");
    if (categoryCard) {
      await user.click(categoryCard);
      expect(mockPush).toHaveBeenCalledWith("/modules/cat-1");
    }
  });

  it("should show all categories when search is cleared", async () => {
    const user = userEvent.setup();
    render(
      <CategoriesInner
        preloadedCategories={mockPreloadedCategories}
        initialProgress={34}
      />
    );

    const searchInput = screen.getByPlaceholderText("Pesquise por temas, subtemas e grupos...") as HTMLInputElement;
    
    // Search for something
    await user.type(searchInput, "Category 1");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.queryByText("Category 2")).toBeNull();
    });

    // Clear search
    await user.clear(searchInput);
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Category 1")).toBeDefined();
      expect(screen.getByText("Category 2")).toBeDefined();
      expect(screen.getByText("Category 3")).toBeDefined();
    });
  });

  it("should handle case-insensitive search", async () => {
    const user = userEvent.setup();
    render(
      <CategoriesInner
        preloadedCategories={mockPreloadedCategories}
        initialProgress={34}
      />
    );

    const searchInput = screen.getByPlaceholderText("Pesquise por temas, subtemas e grupos...");
    await user.type(searchInput, "CATEGORY 1");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Category 1")).toBeDefined();
    });
  });

  it("should render sidebar trigger", () => {
    render(
      <CategoriesInner
        preloadedCategories={mockPreloadedCategories}
        initialProgress={34}
      />
    );

    const sidebarTrigger = screen.getByLabelText("Toggle sidebar");
    expect(sidebarTrigger).toBeDefined();
  });
});

