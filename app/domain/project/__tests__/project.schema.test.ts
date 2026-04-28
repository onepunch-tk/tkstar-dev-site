import { describe, expect, it } from "vitest";
import { projectSchema } from "../project.schema";

const validFrontmatter = {
	slug: "tkstar-dev",
	title: "tkstar.dev",
	summary: "Personal brand site",
	date: "2026-04",
	tags: ["portfolio", "rr7"],
	stack: ["React Router 7", "Cloudflare Workers"],
	metrics: [
		["LCP", "1.2s"],
		["TTFB", "180ms"],
	] as [string, string][],
};

describe("projectSchema", () => {
	it("정상 frontmatter 통과 (필수 필드만)", () => {
		const result = projectSchema.safeParse(validFrontmatter);
		expect(result.success).toBe(true);
	});

	it("featured: true / cover 포함도 통과 (optional)", () => {
		const result = projectSchema.safeParse({
			...validFrontmatter,
			featured: true,
			cover: "/images/cover.png",
		});
		expect(result.success).toBe(true);
	});

	it("featured 미포함도 통과 (optional)", () => {
		const result = projectSchema.safeParse(validFrontmatter);
		expect(result.success).toBe(true);
	});

	it("slug 누락 시 reject", () => {
		const { slug: _slug, ...rest } = validFrontmatter;
		const result = projectSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it("metrics가 [string, string][] 형태 위반 시 reject", () => {
		const result = projectSchema.safeParse({
			...validFrontmatter,
			metrics: [["LCP", 1.2]],
		});
		expect(result.success).toBe(false);
	});

	it("tags가 string[]가 아닐 때 reject", () => {
		const result = projectSchema.safeParse({
			...validFrontmatter,
			tags: "portfolio",
		});
		expect(result.success).toBe(false);
	});
});
