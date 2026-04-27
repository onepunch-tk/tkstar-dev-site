# React Component Testing Examples

Testing patterns for React components using @testing-library/react.

## Basic Component Testing

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Button", () => {
  it("calls onClick handler when clicked", async () => {
    // Arrange
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    // Act
    await userEvent.click(screen.getByRole("button"));

    // Assert
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("displays children text", () => {
    // Arrange & Act
    render(<Button onClick={vi.fn()}>Submit</Button>);

    // Assert
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    // Arrange & Act
    render(<Button onClick={vi.fn()} disabled>Disabled</Button>);

    // Assert
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

## Form Component Testing

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("LoginForm", () => {
  it("submits form with entered values", async () => {
    // Arrange
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert
    expect(handleSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("displays validation error for invalid email", async () => {
    // Arrange
    render(<LoginForm onSubmit={vi.fn()} />);

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), "invalid-email");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });
});
```

## Component with Async Data

```typescript
import { render, screen, waitFor } from "@testing-library/react";

describe("UserProfile", () => {
  it("displays loading state initially", () => {
    // Arrange & Act
    render(<UserProfile userId="1" />);

    // Assert
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("displays user data after loading", async () => {
    // Arrange
    vi.mocked(fetchUser).mockResolvedValue({ name: "John Doe" });

    // Act
    render(<UserProfile userId="1" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("displays error message on fetch failure", async () => {
    // Arrange
    vi.mocked(fetchUser).mockRejectedValue(new Error("Failed to fetch"));

    // Act
    render(<UserProfile userId="1" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });
});
```

## Custom Hook Testing

```typescript
import { renderHook, act } from "@testing-library/react";

describe("useCounter", () => {
  it("initializes with default value", () => {
    // Arrange & Act
    const { result } = renderHook(() => useCounter());

    // Assert
    expect(result.current.count).toBe(0);
  });

  it("increments count", () => {
    // Arrange
    const { result } = renderHook(() => useCounter());

    // Act
    act(() => {
      result.current.increment();
    });

    // Assert
    expect(result.current.count).toBe(1);
  });

  it("accepts initial value", () => {
    // Arrange & Act
    const { result } = renderHook(() => useCounter(10));

    // Assert
    expect(result.current.count).toBe(10);
  });
});
```
