# Deepening

How to deepen a cluster of shallow modules safely, given its
dependencies. Assumes the vocabulary in [LANGUAGE.md](LANGUAGE.md) —
**module**, **interface**, **seam**, **adapter**.

## Dependency categories

When assessing a candidate for deepening, classify its dependencies. The
category determines how the deepened module is tested across its seam.

### 1. In-process

Pure computation, in-memory state, no I/O. Always deepenable — merge the
modules and test through the new interface directly. No adapter needed.

### 2. Local-substitutable

Dependencies that have local test stand-ins (PGLite for Postgres,
in-memory filesystem). Deepenable if the stand-in exists. The deepened
module is tested with the stand-in running in the test suite. The seam
is internal; no port at the module's external interface.

### 3. Remote but owned (Ports & Adapters)

Your own modules deployed across a process or network seam (separate
runtimes, remote endpoints you author). Define a **port** (interface)
at the seam. The deep module owns the logic; the transport is injected
as an **adapter**. Tests use an in-memory adapter. Production uses an
HTTP/gRPC/queue adapter.

Recommendation shape: *"Define a port at the seam, implement an HTTP
adapter for production and an in-memory adapter for testing, so the
logic sits in one deep module even though it's deployed across a
process seam."*

### 4. True external (Mock)

Third-party services (Stripe, Twilio, etc.) you don't control. The
deepened module takes the external dependency as an injected port;
tests provide a mock adapter.

## CA integration

Our project's Clean Architecture (CA) already implements the
Ports & Adapters pattern (category 3). The standard CA file layout maps
1:1 to this skill's vocabulary:

| CA artifact | This skill calls it | Why it satisfies "two adapters = real seam" |
|---|---|---|
| `application/**/*.port.ts` | **Interface** at a seam | The Port is the interface |
| `infrastructure/**/*.repository.ts` (production) | **Adapter** #1 | Real DB/HTTP implementation |
| Test mock / in-memory fake (e.g., `*.mock.ts`, `*.fake.ts`) | **Adapter** #2 | Test-only stand-in |
| `application/**/*.usecase.ts` | The **deep module** behind the interface | Business logic, framework-agnostic |

So a CA Port with one production adapter is **NOT** dead indirection —
the production adapter + the test mock together justify the seam. The
"two adapters = real seam" rule is satisfied by design.

**However**: a CA Port that has neither a test mock nor any test
exercising the use case THROUGH the port *is* dead indirection. That's
the deletion-test failure mode in CA: the Port pretends to be a seam
but nothing varies across it. Flag those as deepening candidates —
either delete the Port and inline the production implementation, or
write the missing test that uses an in-memory adapter.

**Do NOT** flag CA Ports as shallow just because there's only one
production adapter. The mock is the second.

## Seam discipline

- **One adapter means a hypothetical seam. Two adapters means a real
  one.** Don't introduce a port unless at least two adapters are
  justified (typically production + test). A single-adapter seam is
  just indirection.
- **Internal seams vs external seams.** A deep module can have internal
  seams (private to its implementation, used by its own tests) as well
  as the external seam at its interface. Don't expose internal seams
  through the interface just because tests use them.

## Testing strategy: replace, don't layer

- Old unit tests on shallow modules become waste once tests at the
  deepened module's interface exist — delete them.
- Write new tests at the deepened module's interface. The **interface
  is the test surface**.
- Tests assert on observable outcomes through the interface, not
  internal state.
- Tests should survive internal refactors — they describe behavior, not
  implementation. If a test has to change when the implementation
  changes, it's testing past the interface.

### tdd skill exemption (cross-reference)

The `tdd` skill's "Must Test" patterns (`*.entity.ts`, `*.usecase.ts`,
`*.helper.ts`, …) assume **one file = one module**. When this skill
deepens a cluster of files into a single module:

- The **external interface** of the deep module is tested per the
  normal CA layer rules in `tdd` and `ca-rules`.
- The **internal parts** (formerly file-pattern-matched) are tested
  *through* the external interface, not individually. Their existing
  unit tests are deleted, not preserved.

This exemption is referenced from `.claude/skills/tdd/SKILL.md` so the
two skills stay consistent.

## Anti-patterns

- ❌ Layering interface tests *on top of* internal unit tests — pick one
  surface
- ❌ Introducing a port for a "future second adapter" that may never
  come
- ❌ Treating the deep module as a god class — depth ≠ size, it's
  leverage per unit of interface
- ❌ Breaking CA dependency direction during deepening (Domain →
  Application → Infrastructure → Presentation, inner cannot import
  outer)
