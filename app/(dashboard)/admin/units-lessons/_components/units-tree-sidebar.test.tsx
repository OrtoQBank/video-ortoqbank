import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UnitsTreeSidebar } from "./units-tree-sidebar";

// Mock the store
vi.mock("./store", () => ({
  useUnitsLessonsStore: () => ({
    setIsDraggingUnit: vi.fn(),
    expandedUnits: new Set(),
    toggleUnit: vi.fn(),
    editUnit: vi.fn(),
    isDraggingUnit: false,
    setIsDraggingLesson: vi.fn(),
  }),
}));

// Mock UnitTreeItem to simplify testing
vi.mock("./unit-tree-item", () => ({
  UnitTreeItem: () => <div data-testid="unit-tree-item">Unit</div>,
}));

describe("UnitsTreeSidebar", () => {
  it("should render", () => {
    render(
      <UnitsTreeSidebar
        units={[]}
        lessons={{}}
        sensors={[]}
        onDragEndUnits={async () => {}}
        onDragEndLessons={() => async () => {}}
      />,
    );
    expect(screen.getByText("Visualização")).toBeInTheDocument();
  });
});
