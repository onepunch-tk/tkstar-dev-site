import { describe, expect, it, vi } from "vitest";

vi.mock("#content", () => ({
	projects: [
		{
			slug: "alpha",
			title: "Alpha",
			summary: "Alpha 요약",
			date: "2026-04-25T00:00:00.000Z",
			tags: ["frontend"],
			stack: ["TypeScript"],
			metrics: [],
			featured: undefined,
			cover: undefined,
			body: "",
		},
		{
			slug: "beta",
			title: "Beta",
			summary: "Beta 요약",
			date: "2026-04-26T00:00:00.000Z",
			tags: ["backend"],
			stack: ["TypeScript"],
			metrics: [],
			featured: true,
			cover: undefined,
			body: "",
		},
	],
	posts: [
		{
			slug: "post-1",
			title: "Post 1",
			summary: "Post 1 요약",
			date: "2026-04-20T00:00:00.000Z",
			tags: ["x"],
			cover: undefined,
			body: "",
		},
		{
			slug: "post-2",
			title: "Post 2",
			summary: "Post 2 요약",
			date: "2026-04-21T00:00:00.000Z",
			tags: ["y"],
			cover: undefined,
			body: "",
		},
	],
	legal: [],
}));

import { ProjectNotFoundError } from "~/domain/project/project.errors";
import { buildContainer, type Container } from "../container";

describe("buildContainer", () => {
	const env = {} as Env;

	it("Container에 6개 service 함수가 모두 노출된다", () => {
		const c = buildContainer(env);
		const keys: (keyof Container)[] = [
			"listProjects",
			"getProjectDetail",
			"getFeaturedProject",
			"listPosts",
			"getPostDetail",
			"getRecentPosts",
		];
		for (const k of keys) {
			expect(typeof c[k]).toBe("function");
		}
	});

	describe("project services delegation", () => {
		it("listProjects는 fixture 길이만큼 반환한다", async () => {
			const c = buildContainer(env);
			const result = await c.listProjects();
			expect(result).toHaveLength(2);
		});

		it("listProjects({ tag })는 tag 필터링된 결과를 반환한다", async () => {
			const c = buildContainer(env);
			const result = await c.listProjects({ tag: "backend" });
			expect(result).toHaveLength(1);
			expect(result[0].slug).toBe("beta");
		});

		it("getFeaturedProject는 featured: true인 fixture(beta)를 반환한다", async () => {
			const c = buildContainer(env);
			const result = await c.getFeaturedProject();
			expect(result?.slug).toBe("beta");
		});

		it("getProjectDetail은 slug에 해당하는 project + prev/next를 반환한다", async () => {
			const c = buildContainer(env);
			// date desc: beta(0) > alpha(1)
			const result = await c.getProjectDetail("beta");
			expect(result.project.slug).toBe("beta");
			expect(result.prev).toBeNull();
			expect(result.next?.slug).toBe("alpha");
		});

		it("getProjectDetail은 존재하지 않는 slug에 ProjectNotFoundError를 throw한다", async () => {
			const c = buildContainer(env);
			await expect(c.getProjectDetail("nonexistent")).rejects.toBeInstanceOf(ProjectNotFoundError);
		});
	});

	describe("post services delegation", () => {
		it("listPosts는 fixture 길이만큼 반환한다", async () => {
			const c = buildContainer(env);
			const result = await c.listPosts();
			expect(result).toHaveLength(2);
		});

		it("getRecentPosts(n)은 n개의 post를 date desc로 반환한다", async () => {
			const c = buildContainer(env);
			const result = await c.getRecentPosts(1);
			expect(result).toHaveLength(1);
			// date desc: post-2(2026-04-21) > post-1(2026-04-20)
			expect(result[0].slug).toBe("post-2");
		});

		it("getPostDetail은 slug에 해당하는 post + prev/next를 반환한다", async () => {
			const c = buildContainer(env);
			const result = await c.getPostDetail("post-2");
			expect(result.post.slug).toBe("post-2");
			expect(result.prev).toBeNull();
			expect(result.next?.slug).toBe("post-1");
		});
	});
});
