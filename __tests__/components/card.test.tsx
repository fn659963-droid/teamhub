import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("has rounded-xl and shadow-sm", () => {
    render(<Card data-testid="card">x</Card>);
    const el = screen.getByTestId("card");
    expect(el).toHaveClass("rounded-xl");
    expect(el).toHaveClass("shadow-sm");
  });

  it("CardHeader renders with border-b", () => {
    render(<CardHeader data-testid="hdr">Header</CardHeader>);
    expect(screen.getByTestId("hdr")).toHaveClass("border-b");
  });

  it("CardTitle renders as h3", () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByRole("heading", { name: "My Title" })).toBeInTheDocument();
  });

  it("CardTitle is font-semibold", () => {
    render(<CardTitle data-testid="t">T</CardTitle>);
    expect(screen.getByTestId("t")).toHaveClass("font-semibold");
  });

  it("CardContent has px-6 padding", () => {
    render(<CardContent data-testid="c">C</CardContent>);
    expect(screen.getByTestId("c")).toHaveClass("px-6");
  });

  it("CardFooter renders children", () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("composes all parts together", () => {
    render(
      <Card>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Foot")).toBeInTheDocument();
  });
});
