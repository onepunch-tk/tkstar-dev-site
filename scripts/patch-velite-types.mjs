import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const content = `// Patched by scripts/patch-velite-types.mjs after \`velite build\`.
// Reason: velite 0.3.1 native typegen does \`import type __vc from '../velite.config.ts'\`
// which transitively exposes Zod 3 internal private names (TS4082) and explodes
// when any consumer in tsconfig.cloudflare imports from "#content".
// This patch replaces the typegen with explicit minimal types mirroring
// the schema in velite.config.ts.

export type Project = {
\tslug: string;
\ttitle: string;
\tsummary: string;
\tdate: string;
\ttags: string[];
\tstack: string[];
\tmetrics: [string, string][];
\tfeatured?: boolean;
\tcover?: string;
\tbody: string;
};
export declare const projects: Project[];

export type Post = {
\tslug: string;
\ttitle: string;
\tlede: string;
\tdate: string;
\ttags: string[];
\tread: number;
\tbody: string;
};
export declare const posts: Post[];

export type AppLegalDoc = {
\tapp_slug: string;
\tdoc_type: "terms" | "privacy";
\tversion: string;
\teffective_date: string;
\tbody: string;
};
export declare const legal: AppLegalDoc[];
`;

const target = resolve(import.meta.dirname, "../.velite/index.d.ts");
writeFileSync(target, content);
console.log(`✓ Patched ${target}`);
