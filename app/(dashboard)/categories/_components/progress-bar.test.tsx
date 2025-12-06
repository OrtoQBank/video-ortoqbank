import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("should render progress bar with label and percentage", () => {
    render(<ProgressBar label="Progresso Total" progress={34} />);

    const label = screen.getByText("Progresso Total");
    expect(label).toBeDefined();

    const percentage = screen.getByText("34%");
    expect(percentage).toBeDefined();
  });

  it("should display correct progress percentage", () => {
    render(<ProgressBar label="Test Progress" progress={75} />);

    const percentage = screen.getByText("75%");
    expect(percentage).toBeDefined();
  });

  it("should display 0% when progress is 0", () => {
    render(<ProgressBar label="Test Progress" progress={0} />);

    const percentage = screen.getByText("0%");
    expect(percentage).toBeDefined();
  });

  it("should display 100% when progress is 100", () => {
    render(<ProgressBar label="Test Progress" progress={100} />);

    const percentage = screen.getByText("100%");
    expect(percentage).toBeDefined();
  });

  it("should render progress component", () => {
    const { container } = render(
      <ProgressBar label="Test Progress" progress={50} />
    );

    const progressElement = container.querySelector("div[role='progressbar']");
    expect(progressElement).toBeDefined();
  });

  it("should handle custom label text", () => {
    render(<ProgressBar label="Custom Label" progress={25} />);

    const label = screen.getByText("Custom Label");
    expect(label).toBeDefined();
  });
});

