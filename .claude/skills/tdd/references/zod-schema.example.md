# Zod Schema Testing Examples

Testing patterns for Zod schema validation.

## Basic Schema Testing

```typescript
import { userSchema } from "~/domain/user/user.schema";

describe("userSchema", () => {
  it("parses valid data successfully", () => {
    // Arrange
    const validData = { id: "1", email: "test@example.com" };

    // Act
    const result = userSchema.safeParse(validData);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it("fails parsing with invalid email format", () => {
    // Arrange
    const invalidData = { id: "1", email: "invalid" };

    // Act
    const result = userSchema.safeParse(invalidData);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("fails parsing when required field is missing", () => {
    // Arrange
    const incompleteData = { id: "1" };

    // Act
    const result = userSchema.safeParse(incompleteData);

    // Assert
    expect(result.success).toBe(false);
  });
});
```

## Schema with Transformations

```typescript
import { dateSchema } from "~/domain/shared/date.schema";

describe("dateSchema", () => {
  it("transforms string to Date object", () => {
    // Arrange
    const dateString = "2024-01-15";

    // Act
    const result = dateSchema.safeParse(dateString);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeInstanceOf(Date);
      expect(result.data.toISOString()).toContain("2024-01-15");
    }
  });

  it("rejects invalid date string", () => {
    // Arrange
    const invalidDate = "not-a-date";

    // Act
    const result = dateSchema.safeParse(invalidDate);

    // Assert
    expect(result.success).toBe(false);
  });
});
```

## Schema with Refinements

```typescript
import { passwordSchema } from "~/domain/auth/auth.schema";

describe("passwordSchema", () => {
  it("accepts password meeting all requirements", () => {
    // Arrange
    const validPassword = "SecurePass123!";

    // Act
    const result = passwordSchema.safeParse(validPassword);

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejects password without uppercase letter", () => {
    // Arrange
    const weakPassword = "securepass123!";

    // Act
    const result = passwordSchema.safeParse(weakPassword);

    // Assert
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than minimum length", () => {
    // Arrange
    const shortPassword = "Abc1!";

    // Act
    const result = passwordSchema.safeParse(shortPassword);

    // Assert
    expect(result.success).toBe(false);
  });
});
```

## Union and Discriminated Union Schemas

```typescript
import { responseSchema } from "~/domain/shared/response.schema";

describe("responseSchema (discriminated union)", () => {
  it("parses success response", () => {
    // Arrange
    const successResponse = { status: "success", data: { id: "1" } };

    // Act
    const result = responseSchema.safeParse(successResponse);

    // Assert
    expect(result.success).toBe(true);
    if (result.success && result.data.status === "success") {
      expect(result.data.data).toEqual({ id: "1" });
    }
  });

  it("parses error response", () => {
    // Arrange
    const errorResponse = { status: "error", message: "Not found" };

    // Act
    const result = responseSchema.safeParse(errorResponse);

    // Assert
    expect(result.success).toBe(true);
    if (result.success && result.data.status === "error") {
      expect(result.data.message).toBe("Not found");
    }
  });

  it("rejects invalid discriminator value", () => {
    // Arrange
    const invalidResponse = { status: "unknown", data: {} };

    // Act
    const result = responseSchema.safeParse(invalidResponse);

    // Assert
    expect(result.success).toBe(false);
  });
});
```
