import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnitsLessonsPage } from "./units-lessons-page";
import { Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { renderWithProviders } from "@/__tests__/utils/test-utils";

// Mock Convex hooks
const mockUsePreloadedQuery = vi.fn(() => []);
const mockUseQuery = vi.fn(() => null);
const mockUseMutation = vi.fn(() => vi.fn(() => Promise.resolve()));

vi.mock("convex/react", () => ({
  usePreloadedQuery: () => mockUsePreloadedQuery(),
  useQuery: () => mockUseQuery(),
  useMutation: () => mockUseMutation(),
  Preloaded: {} as unknown,
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

// Mock useConfirmModal hook
vi.mock("@/hooks/use-confirm-modal", () => ({
  useConfirmModal: () => ({
    confirm: { isOpen: false, title: "", message: "", onConfirm: vi.fn() },
    showConfirm: vi.fn(),
    hideConfirm: vi.fn(),
  }),
}));

// Mock Zustand store
vi.mock("./store", () => ({
  useUnitsLessonsStore: () => ({
    selectedCategoryId: null,
    setSelectedCategoryId: vi.fn(),
    editMode: { type: "none" },
    clearEditMode: vi.fn(),
    showCreateUnitModal: false,
    showCreateLessonModal: false,
    setShowCreateUnitModal: vi.fn(),
    setShowCreateLessonModal: vi.fn(),
    setIsDraggingUnit: vi.fn(),
    setIsDraggingLesson: vi.fn(),
    draggedUnits: null,
    draggedLessons: null,
    setDraggedUnits: vi.fn(),
    setDraggedLessons: vi.fn(),
    updateDraggedLessonsForUnit: vi.fn(),
  }),
}));

describe("UnitsLessonsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render", () => {
    renderWithProviders(
      <UnitsLessonsPage
        preloadedCategories={
          api.categories.list as unknown as Preloaded<
            typeof api.categories.list
          >
        }
      />,
    );
    expect(
      screen.getByText("Selecione uma categoria para começar"),
    ).toBeInTheDocument();
  });
});
