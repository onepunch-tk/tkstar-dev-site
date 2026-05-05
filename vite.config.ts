import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import rehypeShiki from "@shikijs/rehype";
import tailwindcss from "@tailwindcss/vite";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tailwindcss(),
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
		reactRouter(),
	],
	resolve: {
		tsconfigPaths: true,
	},
});
