import { describe, expect, it } from "vitest";

describe("vitest jsdom sanity", () => {
	it("evaluates basic arithmetic", () => {
		expect(1 + 1).toBe(2);
	});

	it("has access to jsdom globals", () => {
		expect(typeof window).toBe("object");
		expect(typeof document).toBe("object");
	});
});
