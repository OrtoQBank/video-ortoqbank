import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LessonList } from "./lesson-list";
import { Id } from "@/convex/_generated/dataModel";

// Mock tenant hooks
vi.mock("@/hooks/use-tenant-convex", () => ({
  useTenantQuery: vi.fn(() => []), // Return empty array for lessons
}));

describe("LessonList", () => {
  it("should render unit title", () => {
    render(
      <LessonList
        unitId={"" as Id<"units">}
        unitTitle="Test Unit"
        totalLessons={10}
        isExpanded={false}
        currentLessonId={null}
        userProgress={[]}
        onToggle={() => {}}
        onLessonClick={() => {}}
      />,
    );
    expect(screen.getByText("Test Unit")).toBeInTheDocument();
  });
});
