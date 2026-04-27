# Expo/React Native Testing Examples

Testing patterns for Expo and React Native components using @testing-library/react-native.

> **Important**: Expo and React Native do NOT support Vitest. You must use Jest.

## Basic Component Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import Button from "./Button";

describe("Button", () => {
  it("renders button text", () => {
    // Arrange & Act
    render(<Button title="Click me" onPress={jest.fn()} />);

    // Assert
    expect(screen.getByText("Click me")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    // Arrange
    const handlePress = jest.fn();
    render(<Button title="Click me" onPress={handlePress} />);

    // Act
    fireEvent.press(screen.getByText("Click me"));

    // Assert
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    // Arrange
    const handlePress = jest.fn();
    render(<Button title="Disabled" onPress={handlePress} disabled />);

    // Act
    fireEvent.press(screen.getByText("Disabled"));

    // Assert
    expect(handlePress).not.toHaveBeenCalled();
  });
});
```

## TextInput Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import SearchInput from "./SearchInput";

describe("SearchInput", () => {
  it("calls onChangeText when text changes", () => {
    // Arrange
    const handleChange = jest.fn();
    render(<SearchInput onChangeText={handleChange} />);

    // Act
    fireEvent.changeText(screen.getByPlaceholderText("Search..."), "query");

    // Assert
    expect(handleChange).toHaveBeenCalledWith("query");
  });

  it("calls onSubmit when submitted", () => {
    // Arrange
    const handleSubmit = jest.fn();
    render(<SearchInput onSubmit={handleSubmit} />);

    // Act
    fireEvent(screen.getByPlaceholderText("Search..."), "submitEditing");

    // Assert
    expect(handleSubmit).toHaveBeenCalled();
  });
});
```

## FlatList Testing

```typescript
import { render, screen } from "@testing-library/react-native";
import UserList from "./UserList";

describe("UserList", () => {
  it("renders list of users", () => {
    // Arrange
    const users = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ];

    // Act
    render(<UserList users={users} />);

    // Assert
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
  });

  it("renders empty state when no users", () => {
    // Arrange & Act
    render(<UserList users={[]} />);

    // Assert
    expect(screen.getByText("No users found")).toBeTruthy();
  });
});
```

## Navigation Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./HomeScreen";

describe("HomeScreen", () => {
  const renderWithNavigation = (component: React.ReactElement) => {
    return render(
      <NavigationContainer>
        {component}
      </NavigationContainer>
    );
  };

  it("navigates to profile when button pressed", () => {
    // Arrange
    const mockNavigate = jest.fn();
    jest.spyOn(require("@react-navigation/native"), "useNavigation")
      .mockReturnValue({ navigate: mockNavigate });

    renderWithNavigation(<HomeScreen />);

    // Act
    fireEvent.press(screen.getByText("Go to Profile"));

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("Profile");
  });
});
```

## Async Component Testing

```typescript
import { render, screen, waitFor } from "@testing-library/react-native";
import UserProfile from "./UserProfile";

describe("UserProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays loading indicator initially", () => {
    // Arrange & Act
    render(<UserProfile userId="1" />);

    // Assert
    expect(screen.getByTestId("loading-indicator")).toBeTruthy();
  });

  it("displays user data after loading", async () => {
    // Arrange
    jest.mocked(fetchUser).mockResolvedValue({ name: "John Doe" });

    // Act
    render(<UserProfile userId="1" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });
  });

  it("displays error message on failure", async () => {
    // Arrange
    jest.mocked(fetchUser).mockRejectedValue(new Error("Network error"));

    // Act
    render(<UserProfile userId="1" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeTruthy();
    });
  });
});
```

## Expo-specific Testing

```typescript
import { render, screen } from "@testing-library/react-native";
import * as Location from "expo-location";
import LocationDisplay from "./LocationDisplay";

jest.mock("expo-location");

describe("LocationDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays current location", async () => {
    // Arrange
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "granted",
    });
    jest.mocked(Location.getCurrentPositionAsync).mockResolvedValue({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    });

    // Act
    render(<LocationDisplay />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/37.7749/)).toBeTruthy();
    });
  });

  it("displays permission denied message", async () => {
    // Arrange
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "denied",
    });

    // Act
    render(<LocationDisplay />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/permission denied/i)).toBeTruthy();
    });
  });
});
```
