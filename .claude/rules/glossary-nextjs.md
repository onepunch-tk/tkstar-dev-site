---
framework: nextjs
applies_to: nextjs-15-app-router
---

# Glossary — Next.js (App Router)

> Read this file when `framework-detection` resolves to `nextjs`. Pair with CLAUDE.md §Ubiquitous Language.

| Term | Meaning |
|------|---------|
| **App Router** | File-based routing under `app/`. Each segment is a folder; `page.tsx` renders the route, `layout.tsx` wraps children, `loading.tsx` / `error.tsx` are auto-applied. |
| **Server Component** | The default in App Router — runs on the server, no client JS shipped. Cannot use `useState` / `useEffect`. Pulls data via `await fetch(...)` directly. |
| **Client Component** | A file beginning with `'use client'`. Hydrated in the browser; required for interactivity and browser-only APIs. |
| **Server Action** | A function with `'use server'` directive callable from client components or `<form action>`. Replaces most ad-hoc API routes for mutations. |
| **Route Handler** | `app/<segment>/route.ts` exporting `GET`/`POST`/etc. The App Router replacement for `pages/api`. |
| **`fetch` cache** | Next.js patches `fetch` with caching semantics: `cache: 'force-cache' | 'no-store'` and `next: { revalidate, tags }`. Driver of ISR/RSC freshness. |
| **`revalidatePath` / `revalidateTag`** | Imperative cache invalidation called from Server Actions/Route Handlers after mutations. |
| **Streaming / Suspense** | Server Components stream HTML; `<Suspense fallback={...}>` boundaries gate progressive flush. |
| **`generateStaticParams`** | Function exported by a dynamic route segment to enumerate static paths at build time (replaces `getStaticPaths`). |
| **Middleware** | `middleware.ts` at project root — runs on the Edge runtime before request reaches the route. Used for auth/rewrites/redirects. |
| **Parallel Routes / Intercepting Routes** | `@slot` and `(.)route` conventions for modal-overlays and multi-pane layouts. |
| **`next/font` / `next/image`** | Build-time font self-hosting and image optimization primitives. Always prefer over raw `<img>` / `<link rel="font">`. |
