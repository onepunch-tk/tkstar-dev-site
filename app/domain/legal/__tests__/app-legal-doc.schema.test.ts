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

	// ---------------------------------------------------------------------------
	// T015 RED — body optional 필드 검증 (아직 schema에 없으므로 실패)
	// ---------------------------------------------------------------------------

	it("body가 string일 때 parse 통과하고 결과에 body 필드가 있다", () => {
		// Arrange
		const input = {
			app_slug: "moai",
			doc_type: "terms" as const,
			version: "1.0.0",
			effective_date: "2026-04-28",
			body: "# Hello",
		};

		// Act
		const result = appLegalDocSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(true);
		// body 필드가 parsed 결과에 존재해야 한다 (strip 모드라 추가 없이는 undefined)
		expect((result.data as Record<string, unknown>).body).toBe("# Hello");
	});

	it("body 미제공 시 parse 통과하고 결과의 body 는 undefined 이다", () => {
		// Arrange
		const input = {
			app_slug: "moai",
			doc_type: "terms" as const,
			version: "1.0.0",
			effective_date: "2026-04-28",
		};

		// Act
		const result = appLegalDocSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(true);
		expect((result.data as Record<string, unknown>).body).toBeUndefined();
	});

	it("body가 number 등 non-string 이면 reject 한다", () => {
		// Arrange
		const input = {
			app_slug: "moai",
			doc_type: "terms" as const,
			version: "1.0.0",
			effective_date: "2026-04-28",
			body: 123,
		};

		// Act
		const result = appLegalDocSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(false);
	});
});
