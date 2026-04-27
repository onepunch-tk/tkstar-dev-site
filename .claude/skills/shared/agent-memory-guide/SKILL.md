---
name: agent-memory-guide
description: Shared memory-management guidance for subagents. Preload via the subagent's skills frontmatter field so every agent follows the same rules about what to save, when to save, and when to retrieve.
when_to_use: Always — for any subagent defined under .claude/agents that keeps persistent notes in .claude/agent-memory/. The guide is loaded into the subagent's system prompt at startup.
user-invocable: false
disable-model-invocation: true
---

# Agent Memory Guide (Shared)

Each subagent has a persistent, file-based memory directory at `.claude/agent-memory/<agent-name>/`. Each directory already exists — write to it directly with the Write tool (do not `mkdir` or check existence).

Your goal is to build up this memory system over time so future conversations start with a complete picture of who the user is, how they like to collaborate, what behaviors to avoid or repeat, and the context behind the work the user gives you.

If the user explicitly asks you to remember something, save it immediately as whichever type fits best. If they ask you to forget something, find and remove the relevant entry.

## Types of memory

There are four discrete types of memory.

<types>
<type>
  <name>user</name>
  <description>Information about the user's role, goals, responsibilities, and knowledge. Great user memories help you tailor future behavior to the user's perspective. Avoid writing anything that reads as a negative judgement or is not relevant to the work you are doing together.</description>
  <when_to_save>When you learn details about the user's role, preferences, responsibilities, or knowledge.</when_to_save>
  <how_to_use>When your work should be informed by the user's profile — e.g. tailor explanations to their expertise level.</how_to_use>
  <examples>
  user: "I'm a data scientist looking at what logging we have in place."
  assistant: [saves user memory: user is a data scientist currently focused on observability]

  user: "I have ten years of Go but this is my first time in the React side of this repo."
  assistant: [saves user memory: deep Go expertise, new to React — frame frontend explanations via backend analogues]
  </examples>
</type>
<type>
  <name>feedback</name>
  <description>Guidance the user has given you about how to approach work — things to avoid and things to keep doing. Record from both failures AND successes so you do not drift from validated approaches.</description>
  <when_to_save>When the user corrects your approach ("no, not that", "don't", "stop doing X") OR confirms a non-obvious approach worked ("perfect, keep doing that"). Corrections are easy to notice; confirmations are quieter — watch for them.</when_to_save>
  <how_to_use>Let these memories guide your behavior so the user does not have to repeat the same guidance.</how_to_use>
  <body_structure>Lead with the rule itself, then a **Why:** line (reason the user gave) and a **How to apply:** line (when/where this applies). Knowing *why* lets you judge edge cases.</body_structure>
  <examples>
  user: "Don't mock the database in these tests — we got burned last quarter when mocked tests passed but the prod migration failed."
  assistant: [saves feedback memory: integration tests must hit a real database. Reason: prior incident where mock/prod divergence masked a broken migration.]

  user: "Yeah, a single bundled PR was the right call — splitting would have been churn."
  assistant: [saves feedback memory: for refactors in this area the user prefers one bundled PR over many small ones. Confirmed on this approach.]
  </examples>
</type>
<type>
  <name>project</name>
  <description>Information you learn about ongoing work, goals, initiatives, bugs, or incidents within the project that is not otherwise derivable from the code or git history. These memories explain the broader context and motivation behind the user's requests.</description>
  <when_to_save>When you learn who is doing what, why, or by when. Always convert relative dates in user messages to absolute dates (e.g. "Thursday" → "2026-03-05") so the memory is interpretable later.</when_to_save>
  <how_to_use>Use these memories to understand the nuance behind the current request and make better-informed suggestions.</how_to_use>
  <body_structure>Lead with the fact or decision, then a **Why:** line (motivation — often a constraint, deadline, or stakeholder ask) and a **How to apply:** line (how it should shape your suggestions). Project memories decay fast, so the *why* lets future-you judge whether the memory is still load-bearing.</body_structure>
  <examples>
  user: "We're freezing non-critical merges after Thursday — mobile team is cutting a release branch."
  assistant: [saves project memory: merge freeze begins 2026-03-05 for mobile release cut. Flag non-critical PR work scheduled after that date.]

  user: "We're ripping out the old auth middleware because legal flagged it for non-compliant session token storage."
  assistant: [saves project memory: auth middleware rewrite is driven by legal/compliance requirements, not tech-debt cleanup — scope decisions should favor compliance over ergonomics.]
  </examples>
</type>
<type>
  <name>reference</name>
  <description>Pointers to where information lives in external systems. These memories help you remember where to look outside the project directory.</description>
  <when_to_save>When you learn about resources in external systems and their purpose (Linear projects, Slack channels, Grafana boards, etc.).</when_to_save>
  <how_to_use>When the user references an external system or asks about information that lives outside the repo.</how_to_use>
  <examples>
  user: "Check the Linear project 'INGEST' for context on these tickets — that's where we track pipeline bugs."
  assistant: [saves reference memory: pipeline bugs tracked in Linear project 'INGEST'.]

  user: "The Grafana board at grafana.internal/d/api-latency is what on-call watches."
  assistant: [saves reference memory: grafana.internal/d/api-latency is the on-call latency dashboard — check it when editing request-path code.]
  </examples>
</type>
</types>

## What NOT to save in memory

- Code patterns, conventions, architecture, file paths, or project structure — these can be derived by reading the current project state.
- Git history, recent changes, or who-changed-what — `git log` / `git blame` are authoritative.
- Debugging solutions or fix recipes — the fix is in the code; the commit message has the context.
- Anything already documented in `CLAUDE.md`.
- Ephemeral task details: in-progress work, temporary state, current conversation context.

These exclusions apply even when the user explicitly asks you to save. If they ask you to save a PR list or activity summary, ask what was *surprising* or *non-obvious* — that is the part worth keeping.

## How to save memories

Saving a memory is a two-step process.

**Step 1** — write the memory to its own file (e.g. `user_role.md`, `feedback_testing.md`) using this frontmatter format:

```markdown
---
name: {{memory name}}
description: {{one-line description — used to decide relevance in future conversations; be specific}}
type: {{user | feedback | project | reference}}
---

{{memory content — for feedback/project types, structure as: rule/fact, then **Why:** and **How to apply:** lines}}
```

**Step 2** — add a pointer to that file in `MEMORY.md`. `MEMORY.md` is an index, not a memory — each entry is one line, under ~150 characters: `- [Title](file.md) — one-line hook`. It has no frontmatter. Never write memory content directly into `MEMORY.md`.

- `MEMORY.md` is always loaded into your conversation context — lines after 200 are truncated, so keep the index concise.
- Keep each memory file's `name`, `description`, and `type` fields in sync with the content.
- Organize memory semantically by topic, not chronologically.
- Update or remove memories that turn out to be wrong or outdated.
- Do not write duplicate memories. Check for an existing memory you can update before creating a new one.

## When to access memories

- When memories seem relevant, or the user references prior-conversation work.
- When the user explicitly asks you to check, recall, or remember — you MUST access memory.
- If the user says to *ignore* or *not use* memory: do not apply remembered facts, cite, compare against, or mention memory content.
- Memory records can become stale. Treat memory as context for what was true at a given point in time. Before acting on a recalled memory, verify it against the current state of the files or resources. If the current state contradicts memory, trust the current state and update or remove the stale memory.

## Before recommending from memory

A memory that names a specific function, file, or flag is a claim that it existed *when the memory was written*. It may have been renamed, removed, or never merged. Before recommending it:

- If the memory names a file path — check the file exists.
- If the memory names a function or flag — grep for it.
- If the user is about to act on your recommendation — verify first.

"The memory says X exists" is not the same as "X exists now."

A memory that summarizes repo state (activity logs, architecture snapshots) is frozen in time. If the user asks about *recent* or *current* state, prefer `git log` or reading the code over recalling the snapshot.

## Memory vs other forms of persistence

Memory is one of several persistence mechanisms. It is meant for information that will be useful in *future* conversations.

- Use a **plan** (not memory) to align with the user on an approach for a non-trivial implementation within the current conversation. Update the plan when the approach changes.
- Use **tasks** (not memory) to break the current conversation's work into discrete steps and track progress.

Because each `.claude/agent-memory/<name>/` directory is under version control for this project, tailor your memories to this project's context.
