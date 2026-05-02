import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import { defineCollection, defineConfig, s } from "velite";
import { extractToc } from "./velite/transforms/extract-toc";

const projects = defineCollection({
	name: "Project",
	pattern: "projects/**/*.mdx",
	schema: s
		.object({
			slug: s.slug("projects"),
			title: s.string(),
			summary: s.string(),
			date: s.isodate(),
			tags: s.array(s.string()),
			stack: s.array(s.string()),
			metrics: s.array(s.tuple([s.string(), s.string()])),
			featured: s.boolean().optional(),
			cover: s.string().optional(),
			role: s.string().optional(),
			body: s.mdx(),
		})
		.transform((data, { meta }) => ({
			...data,
			toc: extractToc(meta.content ?? ""),
		})),
});

const posts = defineCollection({
	name: "Post",
	pattern: "posts/**/*.mdx",
	schema: s
		.object({
			slug: s.slug("posts"),
			title: s.string(),
			lede: s.string(),
			date: s.isodate(),
			tags: s.array(s.string()),
			read: s.number(),
			body: s.mdx(),
		})
		.transform((data, { meta }) => ({
			...data,
			toc: extractToc(meta.content ?? ""),
		})),
});

const legal = defineCollection({
	name: "AppLegalDoc",
	pattern: "legal/apps/**/*.mdx",
	schema: s.object({
		app_slug: s.string(),
		doc_type: s.enum(["terms", "privacy"]),
		version: s.string(),
		effective_date: s.isodate(),
		body: s.mdx(),
	}),
});

export default defineConfig({
	root: "content",
	output: { data: ".velite", clean: true },
	collections: { projects, posts, legal },
	mdx: {
		rehypePlugins: [
			rehypeSlug,
			// biome-ignore lint/suspicious/noExplicitAny: shiki rehype 플러그인 타입 incompat
			[rehypeShiki as any, { theme: "github-dark" }],
		],
	},
});
