import { describe, expect, it } from "vitest";
import { postSchema } from "../post.schema";

const validPost = {
	slug: "rr7-ssr-edge",
	title: "RR7 SSR on Cloudflare Workers",
	summary: "Edge-rendering React Router 7 with bindings",
	datePublished: "2026-04-28",
	tags: ["rr7", "cloudflare"],
	status: "published" as const,
	createdAt: 1714291200,
	updatedAt: 1714291200,
};

describe("postSchema", () => {
	it("정상 published Post 통과", () => {
		const result = postSchema.safeParse(validPost);
		expect(result.success).toBe(true);
	});

	it("draft status 통과", () => {
		const result = postSchema.safeParse({ ...validPost, status: "draft" });
		expect(result.success).toBe(true);
	});

	it("status enum 외 값 reject", () => {
		const result = postSchema.safeParse({ ...validPost, status: "archived" });
		expect(result.success).toBe(false);
	});

	it("datePublished ISO 8601 위반 시 reject", () => {
		const result = postSchema.safeParse({
			...validPost,
			datePublished: "April 28, 2026",
		});
		expect(result.success).toBe(false);
	});

	it("datePublished null 허용 (draft 시점)", () => {
		const result = postSchema.safeParse({ ...validPost, datePublished: null });
		expect(result.success).toBe(true);
	});

	it("summary null 허용", () => {
		const result = postSchema.safeParse({ ...validPost, summary: null });
		expect(result.success).toBe(true);
	});

	it("필수 필드(title) 누락 시 reject", () => {
		const { title: _t, ...rest } = validPost;
		const result = postSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it("createdAt / updatedAt 은 unix epoch number", () => {
		const result = postSchema.safeParse({
			...validPost,
			createdAt: "2026-04-28",
		});
		expect(result.success).toBe(false);
	});

	it("tags 는 string array", () => {
		const result = postSchema.safeParse({ ...validPost, tags: "rr7" });
		expect(result.success).toBe(false);
	});

	it("read 필드 노출 안 함 (passthrough 비활성)", () => {
		const result = postSchema.safeParse({ ...validPost, read: 7 });
		expect(result.success).toBe(true);
		const data = result.data as Record<string, unknown>;
		expect(data.read).toBeUndefined();
	});

	it("toc 필드 노출 안 함 (entity 외부에 분리)", () => {
		const result = postSchema.safeParse({
			...validPost,
			toc: [{ slug: "intro", text: "Intro" }],
		});
		expect(result.success).toBe(true);
		const data = result.data as Record<string, unknown>;
		expect(data.toc).toBeUndefined();
	});
});
