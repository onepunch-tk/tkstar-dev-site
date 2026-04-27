# NestJS Testing Examples

Testing patterns for NestJS services, controllers, and modules using @nestjs/testing.

## Service Testing with Mocked Dependencies

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";

describe("UserService", () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  it("finds user by ID", async () => {
    // Arrange
    const mockUser = { id: "1", name: "Test User" };
    repository.findById.mockResolvedValue(mockUser);

    // Act
    const result = await service.findById("1");

    // Assert
    expect(result).toEqual(mockUser);
    expect(repository.findById).toHaveBeenCalledWith("1");
  });

  it("throws NotFoundException when user not found", async () => {
    // Arrange
    repository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.findById("999")).rejects.toThrow(NotFoundException);
  });
});
```

## Controller Testing

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

describe("UserController", () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  it("returns user by ID", async () => {
    // Arrange
    const mockUser = { id: "1", name: "Test User" };
    service.findById.mockResolvedValue(mockUser);

    // Act
    const result = await controller.findOne("1");

    // Assert
    expect(result).toEqual(mockUser);
  });

  it("creates new user", async () => {
    // Arrange
    const createDto = { name: "New User", email: "new@example.com" };
    const createdUser = { id: "1", ...createDto };
    service.create.mockResolvedValue(createdUser);

    // Act
    const result = await controller.create(createDto);

    // Assert
    expect(result).toEqual(createdUser);
    expect(service.create).toHaveBeenCalledWith(createDto);
  });
});
```

## Guard Testing

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { JwtService } from "@nestjs/jwt";

describe("AuthGuard", () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService);
  });

  const createMockContext = (token?: string): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: token ? `Bearer ${token}` : undefined,
        },
      }),
    }),
  }) as ExecutionContext;

  it("allows request with valid token", async () => {
    // Arrange
    jwtService.verifyAsync.mockResolvedValue({ userId: "1" });
    const context = createMockContext("valid-token");

    // Act
    const result = await guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
  });

  it("denies request without token", async () => {
    // Arrange
    const context = createMockContext();

    // Act & Assert
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
```

## Pipe Testing

```typescript
import { ValidationPipe } from "./validation.pipe";
import { ArgumentMetadata } from "@nestjs/common";

describe("ValidationPipe", () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  it("passes valid data through", async () => {
    // Arrange
    const value = { name: "Test", email: "test@example.com" };
    const metadata: ArgumentMetadata = { type: "body", metatype: CreateUserDto };

    // Act
    const result = await pipe.transform(value, metadata);

    // Assert
    expect(result).toEqual(value);
  });

  it("throws BadRequestException for invalid data", async () => {
    // Arrange
    const value = { name: "", email: "invalid" };
    const metadata: ArgumentMetadata = { type: "body", metatype: CreateUserDto };

    // Act & Assert
    await expect(pipe.transform(value, metadata)).rejects.toThrow(BadRequestException);
  });
});
```
