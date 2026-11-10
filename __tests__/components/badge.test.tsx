import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders its text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("default variant uses indigo background", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass("bg-indigo-600");
  });

  it("success variant uses emerald", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK")).toHaveClass("bg-emerald-100");
    expect(screen.getByText("OK")).toHaveClass("text-emerald-700");
  });

  it("destructive variant uses red", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error")).toHaveClass("bg-red-100");
  });

  it("warning variant uses amber", () => {
    render(<Badge variant="warning">Warn</Badge>);
    expect(screen.getByText("Warn")).toHaveClass("bg-amber-100");
  });

  it("secondary variant uses slate", () => {
    render(<Badge variant="secondary">Tag</Badge>);
    expect(screen.getByText("Tag")).toHaveClass("bg-slate-100");
  });

  it("outline variant has border", () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toHaveClass("border");
  });

  it("renders as a span element", () => {
    render(<Badge>Span</Badge>);
    expect(screen.getByText("Span").tagName).toBe("SPAN");
  });

  it("merges extra className", () => {
    render(<Badge className="extra-class">X</Badge>);
    expect(screen.getByText("X")).toHaveClass("extra-class");
  });

  it("is pill-shaped (rounded-full)", () => {
    render(<Badge>Pill</Badge>);
    expect(screen.getByText("Pill")).toHaveClass("rounded-full");
  });
});
