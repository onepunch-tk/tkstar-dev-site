import type { ComponentType } from "react";

// NOTE: glob keys are the literal string Vite uses at the lookup site.
// If this file moves, both the glob arg AND the route lookups (4 files) must update.
type MDXModule = { default: ComponentType };

export const projectModules = import.meta.glob<MDXModule>("../../../../content/projects/*.mdx", {
	eager: true,
});

export const postModules = import.meta.glob<MDXModule>("../../../../content/posts/*.mdx", {
	eager: true,
});

export const legalTermsModules = import.meta.glob<MDXModule>(
	"../../../../content/legal/apps/*/terms.mdx",
	{ eager: true },
);

export const legalPrivacyModules = import.meta.glob<MDXModule>(
	"../../../../content/legal/apps/*/privacy.mdx",
	{ eager: true },
);
