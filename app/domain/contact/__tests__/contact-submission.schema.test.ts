import { describe, expect, it } from "vitest";
import { contactSubmissionSchema } from "../contact-submission.schema";

const valid = {
	name: "Taekyung Ha",
	company: "Acme Inc.",
	email: "foo@bar.com",
	inquiry_type: "B2B" as const,
	message: "a".repeat(50),
	turnstile_token: "tk_test_token",
};

describe("contactSubmissionSchema (AC-F008-2/3)", () => {
	it("정상 입력 통과", () => {
		const result = contactSubmissionSchema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it("AC-F008-2: foo@bar.com 통과", () => {
		const result = contactSubmissionSchema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it("AC-F008-2: foo@ reject", () => {
		const result = contactSubmissionSchema.safeParse({ ...valid, email: "foo@" });
		expect(result.success).toBe(false);
	});

	it("AC-F008-2: bar.com reject", () => {
		const result = contactSubmissionSchema.safeParse({
			...valid,
			email: "bar.com",
		});
		expect(result.success).toBe(false);
	});

	it("AC-F008-3: 메시지 9자 reject", () => {
		const result = contactSubmissionSchema.safeParse({
			...valid,
			message: "a".repeat(9),
		});
		expect(result.success).toBe(false);
	});

	it("AC-F008-3: 메시지 10자 통과", () => {
		const result = contactSubmissionSchema.safeParse({
			...valid,
			message: "a".repeat(10),
		});
		expect(result.success).toBe(true);
	});

	it("AC-F008-3: 메시지 5000자 통과", () => {
		const result = contactSubmissionSchema.safeParse({
			...valid,
			message: "a".repeat(5000),
		});
		expect(result.success).toBe(true);
	});

	it("AC-F008-3: 메시지 5001자 reject", () => {
		const result = contactSubmissionSchema.safeParse({
			...valid,
			message: "a".repeat(5001),
		});
		expect(result.success).toBe(false);
	});

	it("inquiry_type: B2C / etc 통과", () => {
		const r1 = contactSubmissionSchema.safeParse({ ...valid, inquiry_type: "B2C" });
		const r2 = contactSubmissionSchema.safeParse({ ...valid, inquiry_type: "etc" });
		expect(r1.success).toBe(true);
		expect(r2.success).toBe(true);
	});

	it("inquiry_type 외 값 reject", () => {
		const result = contactSubmissionSchema.safeParse({
			...valid,
			inquiry_type: "consulting",
		});
		expect(result.success).toBe(false);
	});

	it("company는 optional (undefined 통과)", () => {
		const { company: _c, ...rest } = valid;
		const result = contactSubmissionSchema.safeParse(rest);
		expect(result.success).toBe(true);
	});

	it("turnstile_token 누락 시 reject", () => {
		const { turnstile_token: _t, ...rest } = valid;
		const result = contactSubmissionSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});
});
