import { describe, expect, it } from "vitest";
import { formatYearMonth } from "../format";

describe("formatYearMonth", () => {
	it("2026-04-28을 2026-04로 변환한다", () => {
		// Arrange
		const input = "2026-04-28";

		// Act
		const result = formatYearMonth(input);

		// Assert
		expect(result).toBe("2026-04");
	});

	it("2024-09-01을 2024-09로 변환한다", () => {
		// Arrange
		const input = "2024-09-01";

		// Act
		const result = formatYearMonth(input);

		// Assert
		expect(result).toBe("2024-09");
	});

	it("빈 문자열 입력 시 throw한다", () => {
		// Arrange
		const input = "";

		// Act & Assert
		expect(() => formatYearMonth(input)).toThrow();
	});

	it("유효하지 않은 날짜 문자열 입력 시 throw한다", () => {
		// Arrange
		const input = "not-a-date";

		// Act & Assert
		expect(() => formatYearMonth(input)).toThrow();
	});
});
