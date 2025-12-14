import { render, screen } from "@testing-library/react";
import { UnitList } from "./unit-list";

describe("UnitList", () => {
  it("should render", () => {
    render(<UnitList categories={[]} />);
    expect(screen.getByText("Unidades")).toBeInTheDocument();
  });
});