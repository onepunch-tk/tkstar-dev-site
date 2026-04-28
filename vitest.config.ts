import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		include: ["app/**/*.{test,spec}.{ts,tsx}"],
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
			],
		},
	},
});
