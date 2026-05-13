import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

// workers/app.ts 가 import 하는 virtual:react-router/server-build 는 React Router
// Vite 플러그인이 제공하는 가상 모듈. 테스트 환경엔 그 플러그인이 없으므로 빈
// 스텁으로 resolve 한다 (Workers fetch 핸들러 단위 테스트용).
const virtualReactRouterServerBuild = (): Plugin => {
	const virtualId = "virtual:react-router/server-build";
	const resolved = `\0${virtualId}`;
	return {
		name: "virtual-react-router-server-build",
		resolveId(id) {
			if (id === virtualId) return resolved;
		},
		load(id) {
			if (id === resolved) return "export default {};";
		},
	};
};

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
		virtualReactRouterServerBuild(),
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
			"workers/**/*.{test,spec}.{ts,tsx}",
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
				"app/entry.{server,client}.tsx",
				"app/root.tsx",
				".react-router/**",
				"coverage/**",
				"scripts/**",
			],
		},
	},
});
