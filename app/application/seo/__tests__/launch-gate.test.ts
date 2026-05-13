import { describe, expect, it } from "vitest";
import { getSiteOrigin, isLaunched } from "../launch-gate";

describe("isLaunched", () => {
	it('"true" 문자열일 때 true를 반환한다', () => {
		// Arrange & Act
		const result = isLaunched({ SITE_LAUNCHED: "true", SITE_ORIGIN: "https://tkstar.dev" });

		// Assert
		expect(result).toBe(true);
	});

	it('"false" 문자열일 때 false를 반환한다', () => {
		// Arrange & Act
		const result = isLaunched({ SITE_LAUNCHED: "false", SITE_ORIGIN: "https://tkstar.dev" });

		// Assert
		expect(result).toBe(false);
	});

	it("빈 문자열일 때 false를 반환한다", () => {
		// Arrange & Act
		const result = isLaunched({ SITE_LAUNCHED: "", SITE_ORIGIN: "https://tkstar.dev" });

		// Assert
		expect(result).toBe(false);
	});

	it('대문자 "TRUE"일 때 false를 반환한다', () => {
		// Arrange & Act
		const result = isLaunched({ SITE_LAUNCHED: "TRUE", SITE_ORIGIN: "https://tkstar.dev" });

		// Assert
		expect(result).toBe(false);
	});

	it('숫자 문자열 "1"일 때 false를 반환한다', () => {
		// Arrange & Act
		const result = isLaunched({ SITE_LAUNCHED: "1", SITE_ORIGIN: "https://tkstar.dev" });

		// Assert
		expect(result).toBe(false);
	});

	it('"yes" 문자열일 때 false를 반환한다', () => {
		// Arrange & Act
		const result = isLaunched({ SITE_LAUNCHED: "yes", SITE_ORIGIN: "https://tkstar.dev" });

		// Assert
		expect(result).toBe(false);
	});

	it('앞뒤 공백이 포함된 " true "일 때 false를 반환한다', () => {
		// Arrange & Act
		const result = isLaunched({ SITE_LAUNCHED: " true ", SITE_ORIGIN: "https://tkstar.dev" });

		// Assert
		expect(result).toBe(false);
	});
});

describe("getSiteOrigin", () => {
	it('SITE_ORIGIN 값을 그대로 반환한다 — "https://tkstar.dev"', () => {
		// Arrange & Act
		const result = getSiteOrigin({ SITE_LAUNCHED: "true", SITE_ORIGIN: "https://tkstar.dev" });

		// Assert
		expect(result).toBe("https://tkstar.dev");
	});

	it('SITE_ORIGIN 값을 그대로 반환한다 — "https://staging.example.com"', () => {
		// Arrange & Act
		const result = getSiteOrigin({
			SITE_LAUNCHED: "false",
			SITE_ORIGIN: "https://staging.example.com",
		});

		// Assert
		expect(result).toBe("https://staging.example.com");
	});
});
