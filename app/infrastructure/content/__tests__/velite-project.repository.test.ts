import { describe, expect, it, vi } from "vitest";
import { fixtureProjects } from "../../../__tests__/fixtures/velite-projects.fixture";

// #content 모듈을 fixture로 대체 — vi.mock hoisting으로 import 이전에 적용됨
vi.mock("#content", () => ({
	projects: [
		{
			slug: "alpha",
			title: "Alpha Project",
			summary: "Alpha 프로젝트 요약입니다.",
			date: "2026-04-25T00:00:00.000Z",
			tags: ["frontend", "react"],
			stack: ["React", "TypeScript"],
			metrics: [
				["성능", "95점"],
				["접근성", "100점"],
			],
			featured: undefined,
			cover: undefined,
			body: "",
		},
		{
			slug: "beta",
			title: "Beta Project",
			summary: "Beta 프로젝트 요약입니다.",
			date: "2026-04-26T00:00:00.000Z",
			tags: ["backend", "node"],
			stack: ["Node.js", "TypeScript"],
			metrics: [
				["응답속도", "120ms"],
				["가용성", "99.9%"],
			],
			featured: true,
			cover: "/images/beta-cover.png",
			body: "",
		},
		{
			slug: "gamma",
			title: "Gamma Project",
			summary: "Gamma 프로젝트 요약입니다.",
			date: "2026-04-27T00:00:00.000Z",
			tags: ["infra", "devops"],
			stack: ["Cloudflare Workers", "TypeScript"],
			metrics: [
				["배포시간", "30s"],
				["에러율", "0%"],
			],
			featured: undefined,
			cover: undefined,
			body: "",
		},
	],
}));

import { veliteProjectRepository } from "../velite-project.repository";

describe("veliteProjectRepository", () => {
	// date desc 정렬: gamma(2026-04-27) > beta(2026-04-26) > alpha(2026-04-25)
	// 인덱스 0=gamma, 1=beta, 2=alpha

	describe("findAll", () => {
		it("fixture 길이만큼 매핑 결과를 반환한다", async () => {
			// Arrange & Act
			const result = await veliteProjectRepository.findAll();

			// Assert
			expect(result).toHaveLength(fixtureProjects.length);
		});

		it("매핑 결과에 slug 핵심 필드가 포함된다", async () => {
			// Arrange & Act
			const result = await veliteProjectRepository.findAll();

			// Assert
			const slugs = result.map((p) => p.slug);
			expect(slugs).toContain("alpha");
			expect(slugs).toContain("beta");
			expect(slugs).toContain("gamma");
		});
	});

	describe("findFeatured", () => {
		it("featured: true인 항목(beta)을 반환한다", async () => {
			// Arrange & Act
			const result = await veliteProjectRepository.findFeatured();

			// Assert
			expect(result).not.toBeNull();
			expect(result?.slug).toBe("beta");
		});
	});

	describe("findBySlug", () => {
		it("존재하는 slug로 조회하면 해당 항목을 반환한다", async () => {
			// Arrange & Act
			const result = await veliteProjectRepository.findBySlug("alpha");

			// Assert
			expect(result).not.toBeNull();
			expect(result?.slug).toBe("alpha");
		});

		it("존재하지 않는 slug로 조회하면 null을 반환한다", async () => {
			// Arrange & Act
			const result = await veliteProjectRepository.findBySlug("nonexistent");

			// Assert
			expect(result).toBeNull();
		});
	});

	describe("findRelated", () => {
		it("중간 항목(beta) 조회 시 prev=gamma, next=alpha를 반환한다", async () => {
			// Arrange & Act
			// date desc: gamma(0) > beta(1) > alpha(2)
			// beta의 prev = 더 최신인 gamma, next = 더 오래된 alpha
			const result = await veliteProjectRepository.findRelated("beta");

			// Assert
			expect(result.prev?.slug).toBe("gamma");
			expect(result.next?.slug).toBe("alpha");
		});

		it("가장 최신 항목(gamma) 조회 시 prev=null을 반환한다", async () => {
			// Arrange & Act
			const result = await veliteProjectRepository.findRelated("gamma");

			// Assert
			expect(result.prev).toBeNull();
			expect(result.next?.slug).toBe("beta");
		});

		it("가장 오래된 항목(alpha) 조회 시 next=null을 반환한다", async () => {
			// Arrange & Act
			const result = await veliteProjectRepository.findRelated("alpha");

			// Assert
			expect(result.prev?.slug).toBe("beta");
			expect(result.next).toBeNull();
		});
	});

	describe("findByTag", () => {
		it('"infra" 태그 조회 시 gamma만 반환한다', async () => {
			// Arrange & Act
			const result = await veliteProjectRepository.findByTag("infra");

			// Assert
			expect(result).toHaveLength(1);
			expect(result[0].slug).toBe("gamma");
		});

		it("존재하지 않는 태그 조회 시 빈 배열을 반환한다", async () => {
			// Arrange & Act
			const result = await veliteProjectRepository.findByTag("unknown-tag");

			// Assert
			expect(result).toHaveLength(0);
		});
	});
});
