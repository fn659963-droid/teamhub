import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("accepts typed text", async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole("textbox");
    await user.type(input, "hello");
    expect(input).toHaveValue("hello");
  });

  it("shows placeholder", () => {
    render(<Input placeholder="Enter name" />);
    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
  });

  it("is disabled when prop is set", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Input onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("supports type=password (not role textbox)", () => {
    render(<Input type="password" data-testid="pw" />);
    expect(screen.getByTestId("pw")).toHaveAttribute("type", "password");
  });

  it("supports type=email", () => {
    render(<Input type="email" data-testid="em" />);
    expect(screen.getByTestId("em")).toHaveAttribute("type", "email");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLInputElement>;
    render(<Input ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it("has rounded-lg class", () => {
    render(<Input data-testid="inp" />);
    expect(screen.getByTestId("inp")).toHaveClass("rounded-lg");
  });

  it("merges custom className", () => {
    render(<Input className="w-32" data-testid="inp" />);
    expect(screen.getByTestId("inp")).toHaveClass("w-32");
  });
});
