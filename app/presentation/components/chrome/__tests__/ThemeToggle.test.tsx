import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setThemeSpy = vi.fn();
vi.mock("../../../hooks/useTheme", () => ({
	useTheme: () => ({ theme: "dark", setTheme: setThemeSpy, isSystem: false }),
}));

import ThemeToggle from "../ThemeToggle";

describe("ThemeToggle", () => {
	beforeEach(() => {
		setThemeSpy.mockClear();
	});

	it("클릭 시 setTheme이 반대 모드로 1회 호출되고 aria-pressed가 dark 상태를 반영한다", () => {
		// Arrange
		render(<ThemeToggle />);
		const button = screen.getByRole("button", { name: /toggle theme/i });

		// Assert before click — dark 모드이므로 aria-pressed는 "true"
		expect(button).toHaveAttribute("aria-pressed", "true");
		expect(button).toHaveAttribute("type", "button");

		// Act
		fireEvent.click(button);

		// Assert after click — dark → light 전환, spy 1회 호출
		expect(setThemeSpy).toHaveBeenCalledTimes(1);
		expect(setThemeSpy).toHaveBeenCalledWith("light");
	});
});
