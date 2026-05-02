import { describe, expect, it, vi } from "vitest";

vi.mock("#content", () => ({
	legal: [
		{
			app_slug: "moai",
			doc_type: "terms",
			version: "1.0.0",
			effective_date: "2026-01-01",
			body: "## Terms body content",
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
			version: "1.2.0",
			effective_date: "2026-02-15",
			body: "",
		},
		{
			app_slug: "jagi",
			doc_type: "privacy",
			version: "2.0.0",
			effective_date: "2026-03-01",
			// body 필드 없음 — undefined 매핑 검증용
		},
	],
}));

import { veliteLegalRepository } from "../velite-legal.repository";

describe("veliteLegalRepository", () => {
	describe("findAppDoc", () => {
		it("app_slug + doc_type 조합으로 매핑 결과를 반환한다", async () => {
			const result = await veliteLegalRepository.findAppDoc("moai", "terms");

			expect(result).not.toBeNull();
			expect(result?.app_slug).toBe("moai");
			expect(result?.doc_type).toBe("terms");
			expect(result?.version).toBe("1.0.0");
		});

		it("같은 app_slug 다른 doc_type을 정확히 구분한다", async () => {
			const result = await veliteLegalRepository.findAppDoc("moai", "privacy");

			expect(result).not.toBeNull();
			expect(result?.doc_type).toBe("privacy");
		});

		it("존재하지 않는 조합이면 null을 반환한다", async () => {
			const result = await veliteLegalRepository.findAppDoc("nonexistent", "terms");

			expect(result).toBeNull();
		});

		it("같은 app이라도 정의되지 않은 doc_type은 null", async () => {
			// Arrange: mock에 존재하지 않는 app_slug + doc_type 조합
			const result = await veliteLegalRepository.findAppDoc("unknown-app", "privacy");

			expect(result).toBeNull();
		});

		it("velite raw body 를 entity.body 로 그대로 mapping 한다", async () => {
			// Arrange: mock의 moai/terms는 body: "## Terms body content"

			// Act
			const result = await veliteLegalRepository.findAppDoc("moai", "terms");

			// Assert
			expect(result).not.toBeNull();
			expect(result?.body).toBe("## Terms body content");
		});

		it("raw 에 body 가 없으면 entity.body 는 undefined", async () => {
			// Arrange: mock의 jagi/privacy는 body 필드 없음

			// Act
			const result = await veliteLegalRepository.findAppDoc("jagi", "privacy");

			// Assert
			expect(result).not.toBeNull();
			expect(result?.body).toBeUndefined();
		});
	});

	describe("listApps", () => {
		it("중복 제거된 app_slug 배열을 반환한다", async () => {
			const result = await veliteLegalRepository.listApps();

			expect(result).toHaveLength(2);
			expect(result).toContain("moai");
			expect(result).toContain("jagi");
		});
	});
});
