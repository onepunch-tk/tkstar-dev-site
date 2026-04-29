---
framework: nestjs
applies_to: nestjs-10+
---

# Glossary — NestJS

> Read this file when `framework-detection` resolves to `nestjs`. Pair with CLAUDE.md §Ubiquitous Language.

| Term | Meaning |
|------|---------|
| **Module** | A class decorated with `@Module({ imports, controllers, providers, exports })`. The unit of organization. Domain modules sit under `src/<feature>/`. |
| **Controller** | A `@Controller()` class that maps HTTP routes to handler methods (`@Get` / `@Post` / `@Patch`...). Presentation layer in our CA mapping. |
| **Provider** | Any class registered in a module's `providers` array — service, repository, factory, etc. Resolved by Nest's DI container via constructor injection. |
| **Service** | A `@Injectable()` provider that holds business logic. Lives in the Application layer (Use Case orchestration). |
| **DTO** | Data Transfer Object — class describing request/response shape. Used with `class-validator` decorators for `ValidationPipe` checks. |
| **Pipe** | A transformer/validator run before a controller handler (`@UsePipes(ValidationPipe)`). Built-in: `ParseIntPipe`, `ZodValidationPipe` (community). |
| **Guard** | A `CanActivate` implementation deciding whether a request proceeds (`@UseGuards(JwtAuthGuard)`). Authentication / authorization gate. |
| **Interceptor** | A `NestInterceptor` wrapping a handler call — used for transform/serialize, logging, caching, timeout. |
| **Exception Filter** | A `@Catch(SomeException)` class that converts thrown errors into HTTP responses. Domain errors must be mapped here, not raised raw. |
| **Repository** | A provider that wraps the ORM (Drizzle / Prisma / TypeORM). Implements an Application-layer Port (Repository Port). |
| **Decorator (custom)** | A function that attaches metadata or extracts values (`@CurrentUser()`, `@ApiBearerAuth()`). Used heavily for swagger and auth. |
| **Lifecycle Hook** | `OnModuleInit` / `OnApplicationBootstrap` / `OnModuleDestroy` — methods Nest calls during the module lifecycle. Use sparingly; document side effects. |
