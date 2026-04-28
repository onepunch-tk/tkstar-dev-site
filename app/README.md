# app/ — Clean Architecture 4-layer

tkstarDev의 코어 애플리케이션 코드. 모든 모듈은 아래 4개 layer 중 하나에 속한다.

## Dependency Direction

```
Domain  ←  Application  ←  Infrastructure
                       ↖
                         Presentation
```

**규칙**: 안쪽 layer는 바깥 layer를 import 하지 않는다. 바깥 layer만 안쪽으로 의존할 수 있다.

| Layer | 의존 가능 | 금지 |
|-------|-----------|------|
| `domain/` | `zod`만 (스키마 정의용, 런타임 의존성 없음) | React, velite, Resend, 외부 라이브러리 일체 |
| `application/` | `domain/` | `infrastructure/`, `presentation/` |
| `infrastructure/` | `domain/`, `application/` (Port 구현) | `presentation/` |
| `presentation/` | `domain/`, `application/` | `infrastructure/` (DI를 통해 loader context로만 주입) |

## Layer Responsibilities

| Layer | 역할 | 주요 파일 |
|-------|------|-----------|
| `domain/` | 비즈니스 엔티티, 값 객체, Zod 스키마, 도메인 에러 | `*.entity.ts`, `*.vo.ts`, `*.schema.ts`, `*.errors.ts` |
| `application/` | 유스케이스 서비스 + Port 인터페이스 (외부 시스템 추상화) | `*.service.ts`, `*.port.ts`, `*.mapper.ts` |
| `infrastructure/` | Port 구현체 (velite repo, Resend, Turnstile, Satori, Workers KV 등) | `*.repository.ts`, `*-sender.ts`, `*-verifier.ts`, `container.ts` |
| `presentation/` | React Router 라우트, 컴포넌트, 훅, 레이아웃 | `routes/*.tsx`, `components/**`, `hooks/*`, `layouts/*` |

## Path Aliases

`tsconfig.cloudflare.json`에 아래 path alias가 등록되어 있다:

```ts
import { Project } from "~/domain/project";
import { listProjects } from "~/application/content/services/list-projects.service";
import { veliteProjectRepository } from "~/infrastructure/content/velite-project.repository";
import { ProjectRow } from "~/presentation/components/project/ProjectRow";
```

`~/*` → `./app/*` 일반 alias도 동작하지만, 명시적인 layer alias를 우선 사용해 의존성 방향이 한눈에 드러나게 한다.

## Test Colocation

각 layer의 단위 테스트는 모듈 옆에 colocate 한다 (`__tests__/` 폴더 또는 `*.test.ts`). 레이어 간 공유 fixture/util은 저장소 루트의 `test/{fixtures,utils}/`에 위치한다.

> **상세 구조**: [docs/PROJECT-STRUCTURE.md](../docs/PROJECT-STRUCTURE.md) 참조.
