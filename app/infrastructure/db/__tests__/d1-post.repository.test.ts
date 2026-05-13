import { beforeEach, describe, expect, it } from "vitest";
import { createD1PostRepository } from "../d1-post.repository";
import { posts } from "../schema/posts";
import { createInMemoryD1, type InMemoryDb } from "./_helpers/in-memory-d1";

const NOW = 1714291200;

const seed = async (db: InMemoryDb) => {
	await db.insert(posts).values([
		{
			slug: "alpha",
			title: "Alpha Post",
			summary: "Alpha summary",
			raw_markdown: "## Intro\nbody alpha",
			tags: JSON.stringify(["rr7", "edge"]),
			date_published: "2026-04-26",
			status: "published",
			created_at: NOW - 86400 * 3,
			updated_at: NOW - 86400 * 3,
		},
		{
			slug: "beta",
			title: "Beta Post",
			summary: "Beta summary",
			raw_markdown: "## Section\nbody beta",
			tags: JSON.stringify(["edge"]),
			date_published: "2026-04-27",
			status: "published",
			created_at: NOW - 86400 * 2,
			updated_at: NOW - 86400 * 2,
		},
		{
			slug: "gamma",
			title: "Gamma Post",
			summary: "Gamma summary",
			raw_markdown: "## Hello\n## World\nbody gamma",
			tags: JSON.stringify(["rr7"]),
			date_published: "2026-04-28",
			status: "published",
			created_at: NOW - 86400,
			updated_at: NOW - 86400,
		},
		{
			slug: "delta-draft",
			title: "Delta Draft",
			summary: null,
			raw_markdown: "## WIP\ndraft body",
			tags: JSON.stringify([]),
			date_published: null,
			status: "draft",
			created_at: NOW,
			updated_at: NOW,
		},
	]);
};

describe("D1PostRepository", () => {
	let db: InMemoryDb;

	beforeEach(async () => {
		db = createInMemoryD1();
		await seed(db);
	});

	describe("findAll", () => {
		it("default published 만 반환", async () => {
			const repo = createD1PostRepository(db);
			const all = await repo.findAll();
			expect(all.map((p) => p.slug)).toEqual(["gamma", "beta", "alpha"]);
		});

		it("status='all' 시 draft 포함", async () => {
			const repo = createD1PostRepository(db);
			const all = await repo.findAll({ status: "all" });
			expect(all.map((p) => p.slug)).toContain("delta-draft");
			expect(all).toHaveLength(4);
		});

		it("status='draft' 만 필터", async () => {
			const repo = createD1PostRepository(db);
			const all = await repo.findAll({ status: "draft" });
			expect(all.map((p) => p.slug)).toEqual(["delta-draft"]);
		});

		it("DB row → Post entity 매핑 (snake → camel + tags JSON.parse)", async () => {
			const repo = createD1PostRepository(db);
			const all = await repo.findAll();
			const beta = all.find((p) => p.slug === "beta");
			expect(beta).toMatchObject({
				slug: "beta",
				title: "Beta Post",
				summary: "Beta summary",
				datePublished: "2026-04-27",
				tags: ["edge"],
				status: "published",
			});
			expect(typeof beta?.createdAt).toBe("number");
			expect(typeof beta?.updatedAt).toBe("number");
		});
	});

	describe("findBySlug", () => {
		it("published slug 조회", async () => {
			const repo = createD1PostRepository(db);
			const post = await repo.findBySlug("alpha");
			expect(post?.slug).toBe("alpha");
		});

		it("draft slug + default published → null", async () => {
			const repo = createD1PostRepository(db);
			const post = await repo.findBySlug("delta-draft");
			expect(post).toBeNull();
		});

		it("draft slug + status='all' → 반환", async () => {
			const repo = createD1PostRepository(db);
			const post = await repo.findBySlug("delta-draft", { status: "all" });
			expect(post?.slug).toBe("delta-draft");
		});

		it("미존재 slug → null", async () => {
			const repo = createD1PostRepository(db);
			const post = await repo.findBySlug("nope");
			expect(post).toBeNull();
		});
	});

	describe("findRecent", () => {
		it("최신 순 N 개 (published)", async () => {
			const repo = createD1PostRepository(db);
			const recent = await repo.findRecent(2);
			expect(recent.map((p) => p.slug)).toEqual(["gamma", "beta"]);
		});
	});

	describe("findByTag", () => {
		it("tag 포함하는 published 만", async () => {
			const repo = createD1PostRepository(db);
			const result = await repo.findByTag("edge");
			expect(result.map((p) => p.slug).sort()).toEqual(["alpha", "beta"]);
		});

		it("미매칭 tag → empty", async () => {
			const repo = createD1PostRepository(db);
			const result = await repo.findByTag("none");
			expect(result).toEqual([]);
		});
	});

	describe("findRelated", () => {
		it("published 기준 prev/next", async () => {
			const repo = createD1PostRepository(db);
			const { prev, next } = await repo.findRelated("beta");
			expect(prev?.slug).toBe("gamma");
			expect(next?.slug).toBe("alpha");
		});

		it("최신 글의 prev 는 null", async () => {
			const repo = createD1PostRepository(db);
			const { prev, next } = await repo.findRelated("gamma");
			expect(prev).toBeNull();
			expect(next?.slug).toBe("beta");
		});

		it("미존재 slug → 둘 다 null", async () => {
			const repo = createD1PostRepository(db);
			const { prev, next } = await repo.findRelated("nope");
			expect(prev).toBeNull();
			expect(next).toBeNull();
		});
	});

	describe("findBodyBySlug", () => {
		it("published slug → { body, toc } 반환", async () => {
			const repo = createD1PostRepository(db);
			const result = await repo.findBodyBySlug("gamma");
			expect(result?.body).toContain("body gamma");
			expect(result?.toc).toEqual([
				{ slug: "hello", text: "Hello" },
				{ slug: "world", text: "World" },
			]);
		});

		it("draft + default published → null", async () => {
			const repo = createD1PostRepository(db);
			const result = await repo.findBodyBySlug("delta-draft");
			expect(result).toBeNull();
		});

		it("draft + status='all' → 반환", async () => {
			const repo = createD1PostRepository(db);
			const result = await repo.findBodyBySlug("delta-draft", { status: "all" });
			expect(result?.toc).toEqual([{ slug: "wip", text: "WIP" }]);
		});

		it("미존재 slug → null", async () => {
			const repo = createD1PostRepository(db);
			const result = await repo.findBodyBySlug("nope");
			expect(result).toBeNull();
		});
	});
});
