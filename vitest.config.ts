import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		{
			enforce: "pre",
			...mdx({
				jsxImportSource: "react",
				remarkPlugins: [remarkFrontmatter],
				rehypePlugins: [
					rehypeSlug,
					// biome-ignore lint/suspicious/noExplicitAny: shiki rehype 플러그인 타입 incompat
					[rehypeShiki as any, { theme: "github-dark" }],
				],
			}),
		},
		react(),
	],
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		include: [
			"app/**/*.{test,spec}.{ts,tsx}",
			"velite/**/*.{test,spec}.{ts,tsx}",
			"scripts/**/*.{test,spec}.{ts,tsx}",
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			thresholds: {
				lines: 80,
				branches: 75,
				functions: 80,
				statements: 80,
			},
			exclude: [
				"**/*.config.*",
				"**/__tests__/**",
				"**/*.d.ts",
				"workers/app.ts",
				"app/entry.{server,client}.tsx",
				"app/root.tsx",
				".react-router/**",
				"coverage/**",
				"scripts/**",
			],
		},
	},
});
