---
framework: react-router
applies_to: react-router-v7
---

# Glossary — React Router (Framework Mode v7)

> Read this file when `framework-detection` resolves to `react-router`. Pair with CLAUDE.md §Ubiquitous Language.

| Term | Meaning |
|------|---------|
| **Route Module** | A file under `app/routes/**` that exports `loader` / `action` / `default` (component) / `meta` / `links` / `headers`. The unit of routing in Framework Mode. |
| **Loader** | `export async function loader({ request, params, context })` — runs server-side (and client-side after navigation) to produce route data. Read via `useLoaderData()`. |
| **Action** | `export async function action({ request, params, context })` — handles non-GET form submissions. Read via `useActionData()`. |
| **`<Form>` (RR Form)** | The `react-router` component that posts to the matching route's `action` and triggers a revalidation; **not** a generic HTML form. |
| **Outlet** | `<Outlet />` is the slot in a parent route that renders the matched child route. Layout routes always render an Outlet. |
| **Nested Routes** | File-based nesting under `app/routes/` (`parent.tsx` + `parent.child.tsx` or `parent/`+`child.tsx`). Determines layout composition + loader sequencing. |
| **`clientLoader` / `clientAction`** | Client-only counterparts to `loader` / `action`. Useful for browser-only data (e.g., IndexedDB). |
| **`useFetcher`** | Hook for triggering `action` / `loader` calls without navigating. The harness uses it for inline mutations (favorite, delete, vote). |
| **Route Manifest** | Generated build artifact mapping URL → route file. Do not edit by hand. |
| **`HydrateFallback`** | Component rendered during SSR-streaming hydration. Required when a `clientLoader` runs without a server `loader`. |
| **`shouldRevalidate`** | Per-route function deciding whether the loader should re-run after mutations. Default is conservative; declare explicitly when you need to skip. |
| **Resource Route** | A route module that exports only `loader` / `action` (no default component) — used for JSON/file endpoints inside the same routing tree. |
