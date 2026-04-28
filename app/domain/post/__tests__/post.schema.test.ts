import { describe, expect, it } from "vitest";
import { postSchema } from "../post.schema";

const validFrontmatter = {
	slug: "rr7-ssr-edge",
	title: "RR7 SSR on Cloudflare Workers",
	lede: "Edge-rendering React Router 7 with bindings",
	date: "2026-04-28",
	tags: ["rr7", "cloudflare"],
	read: 7,
};

describe("postSchema", () => {
	it("정상 frontmatter 통과", () => {
		const result = postSchema.safeParse(validFrontmatter);
		expect(result.success).toBe(true);
	});

	it("read가 number가 아니면 reject", () => {
		const result = postSchema.safeParse({ ...validFrontmatter, read: "7" });
		expect(result.success).toBe(false);
	});

	it("date가 ISO 8601 위반 시 reject", () => {
		const result = postSchema.safeParse({
			...validFrontmatter,
			date: "April 28, 2026",
		});
		expect(result.success).toBe(false);
	});

	it("필수 필드(title) 누락 시 reject", () => {
		const { title: _t, ...rest } = validFrontmatter;
		const result = postSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});
});
