# React Router v7 Testing Patterns

## Common Imports

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
```

---

## 1. Direct Loader/Action Testing (Recommended)

Use **type casting pattern** for `Route.LoaderArgs` / `Route.ActionArgs`:

```typescript
import { loader } from "~/presentation/routes/my-route";
import { action } from "~/presentation/routes/auth/sign-out";
import type { IContainer } from "~/application/shared/container.types";

// ✅ Reusable helper - same pattern for loader and action
const createArgs = (request: Request, container: IContainer) =>
  ({
    request,
    context: { env: {}, platform: "node", container },
    params: {},
  }) as unknown as Parameters<typeof loader>[0]; // or action

describe("Route loader/action", () => {
  let mockContainer: IContainer;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContainer = {
      myService: { getData: vi.fn().mockResolvedValue({ data: "test" }) },
    } as unknown as IContainer;
  });

  it("loader returns data", async () => {
    const request = new Request("http://localhost/my-route");
    const result = await loader(createArgs(request, mockContainer));
    expect(result).toEqual({ data: "test" });
  });

  it("action handles redirect response", async () => {
    const request = new Request("http://localhost/auth/signout", { method: "POST" });
    try {
      await action(createArgs(request, mockContainer));
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toBe(302);
      }
    }
  });
});
```

---

## 2. Component Testing with createRoutesStub

### Basic Usage

```typescript
const RoutesStub = createRoutesStub([
  {
    path: "/users/:id",
    Component: UserPage,
    loader: () => ({ user: { id: "1", name: "Test User" } }),
  },
]);

render(<RoutesStub initialEntries={["/users/1"]} />);
expect(await screen.findByText("Test User")).toBeInTheDocument();
```

### Nested Routes

```typescript
const RoutesStub = createRoutesStub([
  {
    path: "/dashboard",
    Component: DashboardLayout,
    loader: () => ({ user: { name: "Admin" } }),
    children: [
      { path: "stats", Component: StatsPage, loader: () => ({ views: 100 }) },
    ],
  },
]);

render(<RoutesStub initialEntries={["/dashboard/stats"]} />);
```

### Error Boundary

```typescript
const RoutesStub = createRoutesStub([
  {
    path: "/users/:id",
    Component: UserPage,
    ErrorBoundary: UserErrorBoundary,
    loader: () => { throw new Response("Not Found", { status: 404 }); },
  },
]);
```

---

## 3. Hooks Mocking Pattern

For `useOutletContext`, `useActionData`, `useSearchParams`:

```typescript
// ✅ Step 1: Declare mocks at top-level
const mockUseOutletContext = vi.fn();
const mockUseActionData = vi.fn();
const mockUseSearchParams = vi.fn();

// ✅ Step 2: Mock module (hoisted automatically)
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useOutletContext: () => mockUseOutletContext(),
    useActionData: () => mockUseActionData(),
    useSearchParams: () => mockUseSearchParams(),
  };
});

// ✅ Step 3: Dynamic import AFTER mocking
const { default: MyComponent } = await import("~/presentation/routes/my-route");

describe("MyComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOutletContext.mockReturnValue({ user: null });
    mockUseActionData.mockReturnValue(null);
    mockUseSearchParams.mockReturnValue([new URLSearchParams()]);
  });

  it("renders with mocked hooks", async () => {
    mockUseOutletContext.mockReturnValue({ user: { id: "1", name: "Test" } });

    const RoutesStub = createRoutesStub([
      { path: "/my-route", Component: MyComponent },
    ]);
    render(<RoutesStub initialEntries={["/my-route"]} />);

    expect(await screen.findByText("Test")).toBeInTheDocument();
  });
});
```

---

## 4. Route.ComponentProps Testing

Use **wrapper component** for type casting:

```typescript
const { default: Settings } = await import("~/presentation/routes/settings");

// ✅ Wrapper bypasses Route.ComponentProps type requirements
const SettingsWrapper = ({ actionData }: { actionData?: Record<string, unknown> }) => {
  const props = { actionData } as unknown as Parameters<typeof Settings>[0];
  return <Settings {...props} />;
};

describe("Settings", () => {
  it("displays error from actionData", async () => {
    const RoutesStub = createRoutesStub([
      {
        path: "/settings",
        Component: () => <SettingsWrapper actionData={{ error: "Save failed" }} />,
      },
    ]);
    render(<RoutesStub initialEntries={["/settings"]} />);
    expect(await screen.findByText(/Save failed/i)).toBeInTheDocument();
  });
});
```

---

## Cautions

### 1. Duplicate Text Matching

```typescript
// ❌ Error: multiple elements match
expect(await screen.findByText("Login")).toBeInTheDocument();

// ✅ Use findAllBy or specific selector
const elements = await screen.findAllByText("Login");
expect(elements.length).toBeGreaterThan(0);

expect(await screen.findByRole("button", { name: /Login/i })).toBeInTheDocument();
```

### 2. vi.mock Hoisting

`vi.mock` is hoisted - define mock functions as variables:

```typescript
// ❌ Won't work - vi.mock inside tests
it("test 1", () => { vi.mock("module", () => ({ fn: () => "a" })); });
it("test 2", () => { vi.mock("module", () => ({ fn: () => "b" })); }); // Ignored

// ✅ Declare at top-level, set return value per test
const mockFn = vi.fn();
vi.mock("module", () => ({ fn: () => mockFn() }));

it("test 1", () => { mockFn.mockReturnValue("a"); });
it("test 2", () => { mockFn.mockReturnValue("b"); });
```
