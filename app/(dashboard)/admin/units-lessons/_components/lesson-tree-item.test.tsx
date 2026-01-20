import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LessonTreeItem } from "./lesson-tree-item";
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
    editLesson: vi.fn(),
    isDraggingLesson: false,
  }),
}));

// Mock the page context
vi.mock("./units-lessons-page", () => ({
  useUnitsLessonsPageContext: () => ({
    handleDeleteLesson: vi.fn(),
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

describe("LessonTreeItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render", () => {
    render(
      <LessonTreeItem
        lesson={
          { _id: "1", title: "Test Lesson", lessonNumber: 1 } as Doc<"lessons">
        }
      />,
    );
    expect(screen.getByText(/Test Lesson/)).toBeInTheDocument();
  });
});
