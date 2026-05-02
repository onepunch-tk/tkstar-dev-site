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

	// ---------------------------------------------------------------------------
	// T014b RED — body / toc optional 필드 검증 (아직 schema에 없으므로 실패)
	// ---------------------------------------------------------------------------

	it("body + toc 포함 시 parse 통과하고 결과에 body 필드가 있다", () => {
		// Arrange
		const input = {
			...validFrontmatter,
			body: "mdx-fn-body",
			toc: [{ slug: "intro", text: "Intro" }],
		};

		// Act
		const result = postSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(true);
		// body 필드가 parsed 결과에 존재해야 한다 (strip 모드라 추가 없이는 undefined)
		expect((result.data as Record<string, unknown>).body).toBe("mdx-fn-body");
	});

	it("toc 미제공 시 parse 통과하고 결과의 toc 는 undefined 이다", () => {
		// Arrange
		const input = { ...validFrontmatter };

		// Act
		const result = postSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(true);
		expect((result.data as Record<string, unknown>).toc).toBeUndefined();
	});

	it("toc 항목이 {slug,text} shape 위반이면 reject 한다", () => {
		// Arrange — text 없이 slug만 있는 toc 항목
		const input = {
			...validFrontmatter,
			toc: [{ slug: "intro" }], // text 누락 → shape 위반
		};

		// Act
		const result = postSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(false);
	});
});
