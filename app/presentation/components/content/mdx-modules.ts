import type { ComponentType } from "react";

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
