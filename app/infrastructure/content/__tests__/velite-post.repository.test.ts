import { describe, expect, it, vi } from "vitest";
import { fixturePosts } from "../../../__tests__/fixtures/velite-posts.fixture";

// #content 모듈을 fixture로 대체 — vi.mock hoisting으로 import 이전에 적용됨
vi.mock("#content", () => ({
	posts: [
		{
			slug: "alpha",
			title: "Alpha Post",
			lede: "Alpha 포스트 요약입니다.",
			date: "2026-04-23T00:00:00.000Z",
			tags: ["typescript"],
			read: 3,
			body: "",
		},
		{
			slug: "bravo",
			title: "Bravo Post",
			lede: "Bravo 포스트 요약입니다.",
			date: "2026-04-24T00:00:00.000Z",
			tags: ["node"],
			read: 5,
			body: "",
		},
		{
			slug: "charlie",
			title: "Charlie Post",
			lede: "Charlie 포스트 요약입니다.",
			date: "2026-04-25T00:00:00.000Z",
			tags: ["vitest"],
			read: 7,
			body: "",
		},
		{
			slug: "delta",
			title: "Delta Post",
			lede: "Delta 포스트 요약입니다.",
			date: "2026-04-26T00:00:00.000Z",
			tags: ["react"],
			read: 4,
			body: "",
		},
	],
}));

import { velitePostRepository } from "../velite-post.repository";

describe("velitePostRepository", () => {
	// date desc 정렬: delta(2026-04-26) > charlie(2026-04-25) > bravo(2026-04-24) > alpha(2026-04-23)
	// 인덱스 0=delta, 1=charlie, 2=bravo, 3=alpha

	describe("findAll", () => {
		it("fixture 길이만큼 매핑 결과를 반환한다", async () => {
			// Arrange & Act
			const result = await velitePostRepository.findAll();

			// Assert
			expect(result).toHaveLength(fixturePosts.length);
		});

		it("매핑 결과에 slug 핵심 필드가 포함된다", async () => {
			// Arrange & Act
			const result = await velitePostRepository.findAll();

			// Assert
			const slugs = result.map((p) => p.slug);
			expect(slugs).toContain("alpha");
			expect(slugs).toContain("bravo");
			expect(slugs).toContain("charlie");
			expect(slugs).toContain("delta");
		});
	});

	describe("findBySlug", () => {
		it("존재하는 slug로 조회하면 해당 항목을 반환한다", async () => {
			// Arrange & Act
			const result = await velitePostRepository.findBySlug("alpha");

			// Assert
			expect(result).not.toBeNull();
			expect(result?.slug).toBe("alpha");
		});

		it("존재하지 않는 slug로 조회하면 null을 반환한다", async () => {
			// Arrange & Act
			const result = await velitePostRepository.findBySlug("nonexistent");

			// Assert
			expect(result).toBeNull();
		});
	});

	describe("findRecent", () => {
		it("findRecent(2) 는 date desc 기준 최신 2건(delta, charlie)을 반환한다", async () => {
			// Arrange & Act
			const result = await velitePostRepository.findRecent(2);

			// Assert
			expect(result).toHaveLength(2);
			expect(result[0].slug).toBe("delta");
			expect(result[1].slug).toBe("charlie");
		});

		it("findRecent(0) 은 빈 배열을 반환한다", async () => {
			// Arrange & Act
			const result = await velitePostRepository.findRecent(0);

			// Assert
			expect(result).toHaveLength(0);
		});
	});

	describe("findByTag", () => {
		it('"react" 태그 조회 시 delta만 반환한다', async () => {
			// Arrange & Act
			const result = await velitePostRepository.findByTag("react");

			// Assert
			expect(result).toHaveLength(1);
			expect(result[0].slug).toBe("delta");
		});

		it("존재하지 않는 태그 조회 시 빈 배열을 반환한다", async () => {
			// Arrange & Act
			const result = await velitePostRepository.findByTag("unknown-tag");

			// Assert
			expect(result).toHaveLength(0);
		});
	});

	describe("findRelated", () => {
		it("중간 항목(charlie) 조회 시 prev=delta, next=bravo를 반환한다", async () => {
			// Arrange & Act
			// date desc: delta(0) > charlie(1) > bravo(2) > alpha(3)
			// charlie의 prev = 더 최신인 delta, next = 더 오래된 bravo
			const result = await velitePostRepository.findRelated("charlie");

			// Assert
			expect(result.prev?.slug).toBe("delta");
			expect(result.next?.slug).toBe("bravo");
		});

		it("가장 최신 항목(delta) 조회 시 prev=null을 반환한다", async () => {
			// Arrange & Act
			const result = await velitePostRepository.findRelated("delta");

			// Assert
			expect(result.prev).toBeNull();
			expect(result.next?.slug).toBe("charlie");
		});

		it("가장 오래된 항목(alpha) 조회 시 next=null을 반환한다", async () => {
			// Arrange & Act
			const result = await velitePostRepository.findRelated("alpha");

			// Assert
			expect(result.prev?.slug).toBe("bravo");
			expect(result.next).toBeNull();
		});
	});
});
