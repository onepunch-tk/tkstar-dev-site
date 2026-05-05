import { describe, expect, it, vi, afterEach } from "vitest";
import { triggerPrint } from "../print";

describe("triggerPrint", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("AC-F003-1: window.print를 정확히 1회 호출한다", () => {
		// Arrange
		const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

		// Act
		triggerPrint();

		// Assert
		expect(printSpy).toHaveBeenCalledTimes(1);
	});
});
