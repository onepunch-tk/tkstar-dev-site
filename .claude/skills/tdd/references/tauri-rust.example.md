# TDD Examples — Tauri 2 / Rust

> **Stack**: `cargo test` (Cargo built-in) + `mockall` (port mocking) + `tauri::test::MockRuntime` (IPC command tests) + `rstest` (parameterized cases / fixtures).
>
> **File placement**: see `tdd/SKILL.md` §"Rust naming convention" — unit tests live inline via `#[cfg(test)] mod tests { ... }`, integration tests live under `src-tauri/tests/`.
>
> **CA layers**: see `ca-rules` §"Rust file patterns (Tauri backend)". Examples below cover all four layers.

---

## Cargo.toml dev-dependencies

```toml
[dev-dependencies]
mockall = "0.13"
rstest = "0.26"
tokio = { version = "1", features = ["macros", "rt"] }
tauri = { version = "2", features = ["test"] }   # enables tauri::test module
```

`cargo test` runs unit + integration + doc tests in one command. For speed, install `cargo-nextest` and run `cargo nextest run`.

---

## Layer 1 — Domain (pure, no mocks, inline `#[cfg(test)]`)

`src-tauri/src/domain/user_entity.rs`:

```rust
use thiserror::Error;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UserId(pub String);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct User {
    pub id: UserId,
    pub email: String,
}

#[derive(Error, Debug, PartialEq, Eq)]
pub enum UserError {
    #[error("invalid email format")]
    InvalidEmail,
    #[error("user id must not be empty")]
    EmptyId,
}

impl User {
    /// 새 User 인스턴스를 생성한다. 이메일 형식과 ID 비어있음을 검증.
    pub fn new(id: UserId, email: String) -> Result<Self, UserError> {
        if id.0.is_empty() {
            return Err(UserError::EmptyId);
        }
        if !email.contains('@') {
            return Err(UserError::InvalidEmail);
        }
        Ok(Self { id, email })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rstest::rstest;

    /// 이메일이 유효하고 ID가 비어있지 않으면 User가 생성된다.
    #[test]
    fn creates_user_when_inputs_are_valid() {
        // Arrange
        let id = UserId("u-1".to_string());
        let email = "alice@example.com".to_string();

        // Act
        let result = User::new(id.clone(), email.clone());

        // Assert
        assert_eq!(result, Ok(User { id, email }));
    }

    /// ID가 빈 문자열이면 EmptyId 에러를 반환한다.
    #[test]
    fn rejects_empty_id() {
        let result = User::new(UserId(String::new()), "a@b.com".into());
        assert_eq!(result, Err(UserError::EmptyId));
    }

    /// 이메일에 @ 가 없는 다양한 케이스는 모두 InvalidEmail 을 반환한다.
    #[rstest]
    #[case::no_at_sign("plainstring")]
    #[case::empty_string("")]
    #[case::only_local("local.only")]
    fn rejects_invalid_email(#[case] email: &str) {
        let result = User::new(UserId("u-1".into()), email.into());
        assert_eq!(result, Err(UserError::InvalidEmail));
    }
}
```

**Notes**:
- `mod tests` is compiled only under `cargo test` thanks to `#[cfg(test)]`. Zero release binary cost.
- `use super::*;` pulls every parent-module item into scope, including `pub(crate)` items — that is *why* unit tests live inline (integration tests in `tests/` cannot reach them).
- `rstest` provides parameterized cases — each `#[case]` becomes a separately reported test.
- AAA pattern is explicit in the first test; condensed when noise hurts readability (the `rstest` parameterized case is *all* arrange-act-assert collapsed).

---

## Layer 2 — Application (use case + mocked port via `mockall`)

`src-tauri/src/application/user_repository_port.rs`:

```rust
use crate::domain::user_entity::{User, UserId, UserError};

#[cfg_attr(test, mockall::automock)]
pub trait UserRepository: Send + Sync {
    fn find_by_id(&self, id: &UserId) -> Result<Option<User>, UserError>;
    fn save(&self, user: &User) -> Result<(), UserError>;
}
```

`src-tauri/src/application/create_user_use_case.rs`:

```rust
use std::sync::Arc;
use crate::domain::user_entity::{User, UserId, UserError};
use super::user_repository_port::UserRepository;

pub struct CreateUserUseCase {
    repo: Arc<dyn UserRepository>,
}

impl CreateUserUseCase {
    pub fn new(repo: Arc<dyn UserRepository>) -> Self {
        Self { repo }
    }

    /// id 가 충돌하지 않으면 User를 만들어 저장한다.
    pub fn execute(&self, id: UserId, email: String) -> Result<User, UserError> {
        if self.repo.find_by_id(&id)?.is_some() {
            return Err(UserError::EmptyId); // 도메인 에러 enum에 Duplicate 추가하는 게 자연스럽지만, 예제 단순화를 위해 재사용
        }
        let user = User::new(id, email)?;
        self.repo.save(&user)?;
        Ok(user)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::application::user_repository_port::MockUserRepository;
    use mockall::predicate::*;

    /// 신규 ID로 호출하면 repo.save 가 한 번 호출되고 User가 반환된다.
    #[test]
    fn saves_user_when_id_is_new() {
        // Arrange
        let mut mock = MockUserRepository::new();
        let id = UserId("u-1".to_string());
        let email = "alice@example.com".to_string();
        let expected = User::new(id.clone(), email.clone()).unwrap();

        mock.expect_find_by_id()
            .with(eq(id.clone()))
            .times(1)
            .returning(|_| Ok(None));
        mock.expect_save()
            .with(eq(expected.clone()))
            .times(1)
            .returning(|_| Ok(()));

        let use_case = CreateUserUseCase::new(Arc::new(mock));

        // Act
        let actual = use_case.execute(id, email);

        // Assert
        assert_eq!(actual, Ok(expected));
    }

    /// 이미 존재하는 ID로 호출하면 save 는 호출되지 않는다.
    #[test]
    fn rejects_when_id_already_exists() {
        // Arrange
        let mut mock = MockUserRepository::new();
        let id = UserId("u-1".to_string());
        let existing = User::new(id.clone(), "a@b.com".into()).unwrap();

        mock.expect_find_by_id()
            .with(eq(id.clone()))
            .times(1)
            .returning(move |_| Ok(Some(existing.clone())));
        mock.expect_save().times(0); // save 호출되지 않음을 명시

        let use_case = CreateUserUseCase::new(Arc::new(mock));

        // Act
        let result = use_case.execute(id, "x@y.com".into());

        // Assert
        assert!(result.is_err());
    }
}
```

**Notes**:
- `#[cfg_attr(test, mockall::automock)]` on the trait generates `MockUserRepository` only in test builds — production binaries do not include the mock machinery.
- `Arc<dyn UserRepository>` is the canonical DI pattern; the use case never depends on a concrete repository.
- `mock.expect_save().times(0)` enforces the negative assertion — failing to call `save` is part of the contract.
- All test bindings use `mut` — `expect_*` mutates the mock builder.

---

## Layer 3 — Infrastructure (integration test in `src-tauri/tests/`)

Sometimes you want a real backing store (SQLite, file system, HTTP). Place these in `src-tauri/tests/` so they run as separate binaries and exercise only the public crate API.

`src-tauri/src/infrastructure/sqlite_user_repository.rs`:

```rust
use std::sync::Mutex;
use rusqlite::Connection;
use crate::application::user_repository_port::UserRepository;
use crate::domain::user_entity::{User, UserId, UserError};

pub struct SqliteUserRepository {
    conn: Mutex<Connection>,
}

impl SqliteUserRepository {
    pub fn new(conn: Connection) -> Self {
        Self { conn: Mutex::new(conn) }
    }

    pub fn migrate(&self) -> rusqlite::Result<()> {
        self.conn.lock().unwrap().execute(
            "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL)",
            [],
        )?;
        Ok(())
    }
}

impl UserRepository for SqliteUserRepository {
    fn find_by_id(&self, _id: &UserId) -> Result<Option<User>, UserError> {
        // implementation elided
        todo!()
    }
    fn save(&self, _user: &User) -> Result<(), UserError> { todo!() }
}
```

`src-tauri/tests/sqlite_user_repository_integration.rs`:

```rust
use my_tauri_app_lib::domain::user_entity::{User, UserId};
use my_tauri_app_lib::application::user_repository_port::UserRepository;
use my_tauri_app_lib::infrastructure::sqlite_user_repository::SqliteUserRepository;
use rusqlite::Connection;

/// in-memory SQLite 로 save/find 라운드트립을 검증한다.
#[test]
fn save_then_find_returns_same_user() {
    // Arrange
    let conn = Connection::open_in_memory().unwrap();
    let repo = SqliteUserRepository::new(conn);
    repo.migrate().unwrap();
    let user = User::new(UserId("u-1".into()), "a@b.com".into()).unwrap();

    // Act
    repo.save(&user).unwrap();
    let found = repo.find_by_id(&user.id).unwrap();

    // Assert
    assert_eq!(found, Some(user));
}
```

**Notes**:
- Integration test imports use the **crate name** (`my_tauri_app_lib::...`) defined in `src-tauri/Cargo.toml` `[package].name`. Replace with your actual crate name.
- Each `tests/*.rs` file is compiled into a separate binary — one process per file. Slow tests do not delay unrelated tests.
- For shared integration helpers, put them in `src-tauri/tests/common/mod.rs` — Cargo treats the `common` directory specially and does not run it as its own integration binary.
- Real SQLite (in-memory) is preferred over mocking the repository — Infrastructure layer tests prove the adapter speaks the underlying technology correctly. If hitting a real external service is infeasible (e.g. paid 3rd-party API), drop to a contract test with a recorded fixture.

---

## Layer 4 — Presentation (`#[tauri::command]` via `MockRuntime`)

`src-tauri/src/presentation/commands/user.rs`:

```rust
use tauri::State;
use std::sync::Arc;
use crate::application::create_user_use_case::CreateUserUseCase;
use crate::domain::user_entity::{UserId, User};

#[tauri::command]
pub async fn create_user(
    use_case: State<'_, Arc<CreateUserUseCase>>,
    id: String,
    email: String,
) -> Result<User, String> {
    use_case
        .execute(UserId(id), email)
        .map_err(|e| e.to_string())
}
```

Inline test using `tauri::test::mock_builder()`:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use tauri::test::{mock_builder, MockRuntime};
    use tauri::Manager;
    use crate::application::user_repository_port::MockUserRepository;

    fn build_test_app() -> tauri::App<MockRuntime> {
        // Arrange — DI 컨테이너 같은 역할
        let mut mock_repo = MockUserRepository::new();
        mock_repo.expect_find_by_id().returning(|_| Ok(None));
        mock_repo.expect_save().returning(|_| Ok(()));
        let use_case = Arc::new(CreateUserUseCase::new(Arc::new(mock_repo)));

        // `manage()` is a method on `Builder`, not `App` — `build()` consumes the builder.
        // Use the `setup()` hook to register managed state *before* build, so the
        // command's `tauri::State<'_, Arc<CreateUserUseCase>>` extractor finds it.
        mock_builder()
            .invoke_handler(tauri::generate_handler![create_user])
            .setup(move |app| {
                app.manage(use_case.clone());
                Ok(())
            })
            .build(tauri::generate_context!("tauri.conf.json"))
            .expect("failed to build mock app")
    }

    /// invoke("create_user", {id, email}) 가 새 User를 반환한다.
    #[tokio::test]
    async fn create_user_command_returns_user() {
        // Arrange
        let app = build_test_app();
        let handle = app.handle().clone();

        // Act — invoke 는 frontend 가 호출하는 IPC 와 동일한 경로
        let result: Result<User, String> = tauri::test::get_ipc_response(
            &handle,
            tauri::webview::InvokeRequest {
                cmd: "create_user".to_string(),
                callback: tauri::ipc::CallbackFn(0),
                error: tauri::ipc::CallbackFn(1),
                url: "http://tauri.localhost".parse().unwrap(),
                body: tauri::ipc::InvokeBody::Json(serde_json::json!({
                    "id": "u-1",
                    "email": "alice@example.com"
                })),
                headers: Default::default(),
                invoke_key: Default::default(),
            },
        )
        .await
        .map(|v| serde_json::from_value(v).unwrap())
        .map_err(|e| e.to_string());

        // Assert
        assert!(result.is_ok());
        let user = result.unwrap();
        assert_eq!(user.id.0, "u-1");
    }
}
```

> **Caveat**: the exact `InvokeRequest` field set evolves with Tauri 2 minor versions. Verify against the installed `tauri::test` API (`cargo doc --open -p tauri --document-private-items` or context7) before relying on field-by-field construction. The principle is stable — build app via `mock_builder`, drive commands through `tauri::test::get_ipc_response` or by acquiring the handle and invoking via `tauri::Manager`.

**Notes**:
- `MockRuntime` is a fake `tauri::Runtime` impl shipped with Tauri 2 when the `test` feature is enabled. It replaces the platform-specific runtime so tests run on any OS.
- `mock_builder()` returns a `tauri::Builder<MockRuntime>` — wire it like the production builder.
- For commands that touch external services, inject mocks at the use-case layer (the example does this with `MockUserRepository`). The Presentation test then only verifies the JSON-in/JSON-out contract and capability scoping.
- The `frontend` mocks (`mockIPC` etc. from `@tauri-apps/api/mocks`) are the **opposite direction** — they let Vitest test the JS side without a Rust backend. Useful in `src/` tests, out of scope for `#[tauri::command]` Rust tests.

---

## Red → Green checklist (Rust addendum)

1. **Red**: write the test referencing a stub of the target item (`pub fn create_user(...) -> Result<...> { unimplemented!() }`). Run `cargo test` — the test fails at the assertion / `unimplemented!()` panic.
2. **Green**: replace the stub with the real implementation. Re-run `cargo test` — the test passes. No other test regresses.
3. **Refactor**: simplify the implementation, run `cargo clippy -- -D warnings` and `cargo fmt` (or rely on the harness hooks). Tests stay green.

If the assertion can be satisfied by an even simpler implementation than what the test seemed to demand, that is the implementation — TDD's Green phase mandates the minimum.

---

## Output Language reminder

- `#[test]` function names: English `snake_case` (`creates_user_when_inputs_are_valid`).
- `///` doc comment above each test: Korean (`이메일이 유효하고 ID가 비어있지 않으면 User가 생성된다.`).
- Inline `// ...` comments: Korean.
- Bindings / variable names: English `snake_case`.

Rationale: cargo, IDE "go to test", CI parsers all assume ASCII test identifiers. Korean lives in the doc comment, which surfaces in `cargo doc` output and IDE hover.
