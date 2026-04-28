import { describe, expect, it, vi } from "vitest";

vi.mock("#content", () => ({
	legal: [
		{
			app_slug: "moai",
			doc_type: "terms",
			version: "1.0.0",
			effective_date: "2026-01-01",
			body: "",
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
			const result = await veliteLegalRepository.findAppDoc("jagi", "privacy");

			expect(result).toBeNull();
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
