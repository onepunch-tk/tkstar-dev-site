import { describe, expect, it } from "vitest";
import { appLegalDocSchema } from "../app-legal-doc.schema";

const validFrontmatter = {
	app_slug: "tkstar-app",
	doc_type: "terms" as const,
	version: "1.0.0",
	effective_date: "2026-04-01",
};

describe("appLegalDocSchema", () => {
	it("doc_type: terms 통과", () => {
		const result = appLegalDocSchema.safeParse(validFrontmatter);
		expect(result.success).toBe(true);
	});

	it("doc_type: privacy 통과", () => {
		const result = appLegalDocSchema.safeParse({
			...validFrontmatter,
			doc_type: "privacy",
		});
		expect(result.success).toBe(true);
	});

	it("doc_type: foo 등 임의 값 reject", () => {
		const result = appLegalDocSchema.safeParse({
			...validFrontmatter,
			doc_type: "foo",
		});
		expect(result.success).toBe(false);
	});

	it("effective_date가 ISO 8601 위반 시 reject", () => {
		const result = appLegalDocSchema.safeParse({
			...validFrontmatter,
			effective_date: "2026/04/01",
		});
		expect(result.success).toBe(false);
	});

	it("version은 free string (SemVer 강제 X)", () => {
		const result = appLegalDocSchema.safeParse({
			...validFrontmatter,
			version: "draft-2026-q2",
		});
		expect(result.success).toBe(true);
	});

	it("app_slug 누락 시 reject", () => {
		const { app_slug: _a, ...rest } = validFrontmatter;
		const result = appLegalDocSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});
});
