import { describe, expect, it } from "vitest";
import { formatDate } from "../format";

describe("formatDate", () => {
	it("ISO 날짜 문자열을 YYYY-MM-DD로 변환한다", () => {
		// Arrange
		const input = "2026-04-28T00:00:00.000Z";

		// Act
		const result = formatDate(input);

		// Assert
		expect(result).toBe("2026-04-28");
	});

	it("이미 YYYY-MM-DD 형식인 입력에 대해 동일한 값을 반환한다", () => {
		// Arrange
		const input = "2026-04-28";

		// Act
		const result = formatDate(input);

		// Assert
		expect(result).toBe("2026-04-28");
	});

	it("유효하지 않은 날짜 문자열 입력 시 Invalid date 메시지와 함께 throw한다", () => {
		// Arrange
		const input = "invalid";

		// Act & Assert
		expect(() => formatDate(input)).toThrow("Invalid date");
	});

	it("빈 문자열 입력 시 Invalid date 메시지와 함께 throw한다", () => {
		// Arrange
		const input = "";

		// Act & Assert
		expect(() => formatDate(input)).toThrow("Invalid date");
	});
});
