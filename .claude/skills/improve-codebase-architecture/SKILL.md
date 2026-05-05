---
name: improve-codebase-architecture
description: |
  Find deepening opportunities in the codebase, informed by the domain
  language in `docs/glossary.md`. Use when the user wants to improve
  architecture, find refactoring opportunities, consolidate tightly-
  coupled shallow modules, or make code more testable and AI-navigable.

  Adapted from Matt Pocock's original (https://github.com/mattpocock).
  ADR support and /setup-matt-pocock-skills pointer removed — our harness
  uses `docs/glossary.md` as the single source of truth for domain
  vocabulary.
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities** —
refactors that turn shallow modules into deep ones. The aim is
**testability** (interface as test surface) and **AI-navigability** (one
deep place to look, not a maze of shallow files).

> **Root principle (Ousterhout)**: *"The best modules are deep. They allow
> a lot of functionality to be accessed through a simple interface."*
>
> Deep = lots of behavior behind a small interface. Shallow = interface
> nearly as complex as the implementation.

## Glossary

Use these terms exactly. Consistent language is the point — don't drift
into "component," "service," "API," or "boundary." Full definitions in
[LANGUAGE.md](LANGUAGE.md).

- **Module** — anything with an interface and an implementation (function,
  class, package, slice).
- **Interface** — everything a caller must know to use the module: types,
  invariants, error modes, ordering, config. Not just the type signature.
- **Implementation** — the code inside.
- **Depth** — leverage at the interface: a lot of behavior behind a small
  interface. **Deep** = high leverage. **Shallow** = interface nearly as
  complex as the implementation.
- **Seam** — where an interface lives; a place behavior can be altered
  without editing in place. (Use this, not "boundary.")
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth.
- **Locality** — what maintainers get from depth: change, bugs, knowledge
  concentrated in one place.

Key principles (full list in [LANGUAGE.md](LANGUAGE.md)):

- **Deletion test**: imagine deleting the module. If complexity vanishes,
  it was a pass-through. If complexity reappears across N callers, it was
  earning its keep.
- **The interface is the test surface.**
- **One adapter = hypothetical seam. Two adapters = real seam.**

This skill is *informed* by the project's domain model. The domain
language gives names to good seams.

## Harness integration — read first

Three points where this skill couples to the rest of the harness:

### 1. Clean Architecture (CA) compatibility

CA's `*.port.ts` (Application) + `*.adapter.ts`/`*.repository.ts`
(Infrastructure) pattern **already satisfies** the "two adapters = real
seam" rule:
- Production adapter (e.g., Drizzle repository)
- Test adapter (in-memory fake or mock)

Do **NOT** flag CA Ports as shallow indirection just because there's a
single production adapter. The test mock is the second. See
[DEEPENING.md](DEEPENING.md) §"CA integration" for the full mapping.

### 2. Glossary (Ubiquitous Language) is the seam-naming authority

`docs/glossary.md` is the project's domain vocabulary SoT. When you
suggest deepening, **name the deepened module after a glossary entity**
(e.g., "the Order intake module" — not "the OrderHandlerService").
Missing entry → run `/glossary-sync` or trigger
`project-structure-analyzer`'s missing-entry interview, then come back.

### 3. tdd skill exemption for internals of deep modules

The `tdd` skill's "Must Test" patterns assume one file = one module. When
a deep module merges multiple files, the **internal parts** of the
implementation are tested through the external interface — individual
file-pattern tests for those internals are no longer required. See
[DEEPENING.md](DEEPENING.md) §"Testing strategy: replace, don't layer."

## Process

### 1. Explore

**Read first**: `docs/glossary.md` (domain vocabulary), `docs/PROJECT-STRUCTURE.md`
(layer map), `CLAUDE.md` (project conventions).

Then use the Agent tool with `subagent_type=Explore` to walk the codebase.
Don't follow rigid heuristics — explore organically and note where you
experience friction:

- Where does understanding one concept require bouncing between many small
  modules?
- Where are modules **shallow** — interface nearly as complex as the
  implementation?
- Where have pure functions been extracted just for testability, but the
  real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts are untested, or hard to test through their current
  interface?

Apply the **deletion test** to anything you suspect is shallow: would
deleting it concentrate complexity, or just move it? "Concentrates" is
the signal you want.

### 2. Present candidates

Present a numbered list of deepening opportunities. For each:

- **Files** — which files/modules are involved
- **Problem** — why the current architecture is causing friction
- **Solution** — plain English description of what would change
- **Benefits** — explained in terms of locality and leverage, and how
  tests would improve

**Use `docs/glossary.md` vocabulary for the domain, and
[LANGUAGE.md](LANGUAGE.md) vocabulary for the architecture.** If the
glossary defines `Order`, talk about "the Order intake module" — not
"the FooBarHandler," not "the Order service."

Do NOT propose interfaces yet. Ask the user: "Which of these would you
like to explore?"

### 3. Grilling loop

Once the user picks a candidate, drop into a grilling conversation. Walk
the design tree with them — constraints, dependencies, the shape of the
deepened module, what sits behind the seam, what tests survive.

Side effects happen inline as decisions crystallize:

- **Naming a deepened module after a concept not in `docs/glossary.md`?**
  Run `/glossary-sync` or trigger an interview to add the term to the
  glossary before proceeding. Don't invent vocabulary in passing.
- **Sharpening a fuzzy term during the conversation?** Update the
  glossary entry inline (with `AskUserQuestion` confirmation per the
  glossary system rules).
- **Want to explore alternative interfaces for the deepened module?**
  See [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md) for the parallel
  sub-agent ("Design It Twice") pattern.

> **Note on rejected candidates**: When the user rejects a candidate
> with a load-bearing reason, capture it in the chat — there is no ADR
> system in this harness. If the same candidate keeps resurfacing across
> sessions, consider promoting the rejection rationale to a
> project-memory entry or a CLAUDE.md note. Do not invent a `docs/adr/`
> convention.

## Anti-patterns

- ❌ Calling a CA Port "shallow indirection" just because production has
  one adapter — the test mock is the second adapter
- ❌ Deepening that breaks CA dependency direction (Domain → Application
  → Infrastructure → Presentation, inner cannot import outer)
- ❌ Inventing module names that conflict with `docs/glossary.md`
- ❌ Surfacing dozens of theoretical refactors — present 3-7 high-friction
  candidates, ranked
- ❌ Implementing without grilling: the design tree must be walked
  before a single line is written
