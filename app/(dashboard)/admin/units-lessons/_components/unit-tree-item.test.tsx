import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnitTreeItem } from "./unit-tree-item";
import { Doc } from "@/convex/_generated/dataModel";

// Mock useSortable from @dnd-kit/sortable
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

// Mock Zustand store
vi.mock("./store", () => ({
  useUnitsLessonsStore: () => ({
    expandedUnits: new Set<string>(),
    toggleUnit: vi.fn(),
    editUnit: vi.fn(),
    isDraggingUnit: false,
    setIsDraggingLesson: vi.fn(),
  }),
}));

// Mock the page context
vi.mock("./units-lessons-page", () => ({
  useUnitsLessonsPageContext: () => ({
    handleDeleteUnit: vi.fn(),
  }),
}));

// Mock Convex
vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(() => Promise.resolve()),
}));

// Mock toast hooks
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-error-modal", () => ({
  useErrorModal: () => ({
    showError: vi.fn(),
  }),
}));

describe("UnitTreeItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render", () => {
    const unit = { _id: "1", title: "Test Unit" } as Doc<"units">;
    const unitLessons: Array<Doc<"lessons">> = [];

    const props = {
      unit,
      unitLessons,
      sensors: [],
      onDragEndLessons: () => async () => {},
    };

    render(<UnitTreeItem {...props} />);
    expect(screen.getByText("Test Unit")).toBeInTheDocument();
  });
});
