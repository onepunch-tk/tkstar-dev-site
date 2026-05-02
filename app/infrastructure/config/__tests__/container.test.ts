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
			lede: "Post 1 lede",
			date: "2026-04-20T00:00:00.000Z",
			tags: ["x"],
			read: 3,
			cover: undefined,
			body: "",
		},
		{
			slug: "post-2",
			title: "Post 2",
			summary: "Post 2 요약",
			lede: "Post 2 lede",
			date: "2026-04-21T00:00:00.000Z",
			tags: ["y"],
			read: 5,
			cover: undefined,
			body: "",
		},
	],
	legal: [
		{
			app_slug: "moai",
			doc_type: "terms",
			version: "1.0.0",
			effective_date: "2026-01-01",
			body: "## moai terms",
		},
		{
			app_slug: "moai",
			doc_type: "privacy",
			version: "1.0.0",
			effective_date: "2026-01-01",
			body: "",
		},
		{
			app_slug: "jagi",
			doc_type: "terms",
			version: "1.0.0",
			effective_date: "2026-01-01",
			body: "",
		},
	],
}));

import { ProjectNotFoundError } from "~/domain/project/project.errors";
import { buildContainer, type Container } from "../container";

describe("buildContainer", () => {
	const env = {} as Env;

	it("Container에 9개 service 함수가 모두 노출된다", () => {
		const c = buildContainer(env);
		const keys: (keyof Container)[] = [
			"listProjects",
			"getProjectDetail",
			"getFeaturedProject",
			"listPosts",
			"getPostDetail",
			"getRecentPosts",
			"buildRssFeed",
		];
		for (const k of keys) {
			expect(typeof c[k]).toBe("function");
		}
		// legal 위임 — Green 단계 전에는 undefined → fail
		const legalContainer = c as Container & {
			listApps?: () => Promise<string[]>;
			findAppDoc?: (appSlug: string, docType: "terms" | "privacy") => Promise<unknown>;
		};
		expect(typeof legalContainer.listApps).toBe("function");
		expect(typeof legalContainer.findAppDoc).toBe("function");
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

	describe("feed services delegation", () => {
		it("buildRssFeed는 모든 post를 포함한 RSS 2.0 XML을 반환한다", async () => {
			const c = buildContainer(env);
			const xml = await c.buildRssFeed();
			expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
			expect(xml).toContain('<rss version="2.0"');
			const itemMatches = xml.match(/<item>/g);
			expect(itemMatches).toHaveLength(2);
			expect(xml).toContain("<link>https://tkstar.dev/blog/post-1</link>");
			expect(xml).toContain("<link>https://tkstar.dev/blog/post-2</link>");
		});
	});

	describe("legal services delegation", () => {
		// Green 단계 전에는 listApps / findAppDoc 가 Container 에 없으므로 모두 fail
		type LegalContainer = Container & {
			listApps: () => Promise<string[]>;
			findAppDoc: (appSlug: string, docType: "terms" | "privacy") => Promise<unknown>;
		};

		it("listApps()는 mock legal fixture에서 중복 제거된 app slug 목록을 반환한다", async () => {
			const c = buildContainer(env) as LegalContainer;
			const result = await c.listApps();
			// fixture: moai(terms), moai(privacy), jagi(terms) → ["moai", "jagi"] 순서 무관
			expect(result).toHaveLength(2);
			expect(result).toContain("moai");
			expect(result).toContain("jagi");
		});

		it("findAppDoc('moai', 'terms')는 해당 AppLegalDoc를 반환한다", async () => {
			const c = buildContainer(env) as LegalContainer;
			const result = await c.findAppDoc("moai", "terms");
			expect(result).not.toBeNull();
			expect((result as { app_slug: string }).app_slug).toBe("moai");
			expect((result as { doc_type: string }).doc_type).toBe("terms");
		});

		it("findAppDoc('unknown', 'terms')는 null을 반환한다", async () => {
			const c = buildContainer(env) as LegalContainer;
			const result = await c.findAppDoc("unknown", "terms");
			expect(result).toBeNull();
		});
	});
});
