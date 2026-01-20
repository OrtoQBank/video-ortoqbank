import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnitsTreeSidebar } from "./units-tree-sidebar";

// Mock Zustand store
vi.mock("./store", () => ({
  useUnitsLessonsStore: () => ({
    setIsDraggingUnit: vi.fn(),
  }),
}));

describe("UnitsTreeSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
