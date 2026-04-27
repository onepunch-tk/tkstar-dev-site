---
name: project-structure
description: |
  Analyze and document project structure using framework-specific Clean Architecture templates.
  Supports: React Router Framework, Expo Router, NestJS.
  Auto-detects project type from config files or accepts explicit argument.
argument-hint: "[react-router|expo|nestjs]"
---

# Project Structure Skill

Analyze the project's directory structure and generate/update `docs/PROJECT-STRUCTURE.md` using a framework-specific Clean Architecture template.

---

## Step 1: Determine Project Type

### If argument provided

Use the specified type directly:

| Argument | Project Type |
|----------|-------------|
| `react-router` | React Router Framework |
| `expo` | Expo Router |
| `nestjs` | NestJS |

### If no argument provided

Run framework detection via [`shared/framework-detection`](../shared/framework-detection/SKILL.md) and map the result to this skill's template set:

| Detected framework | Template used by this skill |
|---|---|
| `react-router` | React Router Framework |
| `expo` | Expo Router |
| `nestjs` | NestJS |
| `nextjs` / `remix` / `vite-react` / `unknown` | Ask the user — this skill currently supplies templates only for the three supported stacks. |

If the detection returns a monorepo, run it inside the target sub-package per [`shared/monorepo-detection`](../shared/monorepo-detection/SKILL.md) and generate the structure doc at that package's root.

Fallback when detection is ambiguous or unsupported: call `AskUserQuestion` with the three supported options (React Router Framework, Expo Router, NestJS).

---

## Step 2: Load Template

Load the matching template from `.claude/skills/project-structure/references/`:

| Project Type | Template File |
|-------------|---------------|
| react-router | [references/react-router.template.md](./references/react-router.template.md) |
| expo | [references/expo.template.md](./references/expo.template.md) |
| nestjs | [references/nestjs.template.md](./references/nestjs.template.md) |

---

## Step 3: Invoke Agent

Launch the `project-structure-analyzer` agent with the loaded template:

```
Task({
  subagent_type: 'project-structure-analyzer',
  prompt: `Analyze the current project structure and generate docs/PROJECT-STRUCTURE.md.

Use this template as a skeleton — fill each section with actual findings from codebase analysis:

${templateContent}

Requirements:
- Replace all {PLACEHOLDER} markers with real directory trees and examples
- Add extra sections for directories not covered by the template
- Ensure no placeholder text remains in the final document
- Match the template's language style (Korean-friendly)`,
  description: 'Analyze project structure'
});
```

---

## Output

The agent will:
1. Scan the entire project directory tree
2. Identify architectural patterns and layer boundaries
3. Fill template placeholders with actual project information
4. Generate or update `docs/PROJECT-STRUCTURE.md`
5. Report completion

---

## Notes

- Templates are designed for Clean Architecture projects but adapt to actual findings
- Each template includes framework-specific conventions and patterns
- The agent has full tool access (Glob, Grep, Read) for thorough exploration
