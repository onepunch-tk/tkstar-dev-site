import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTheme } from "../useTheme";

// matchMedia 모킹 헬퍼 — 각 테스트에서 시스템 다크모드 선호도를 제어한다
const mockMatchMedia = (matches: boolean) => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches,
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
};

describe("useTheme", () => {
	beforeEach(() => {
		// localStorage와 document.documentElement.dataset.theme을 초기화한다
		localStorage.clear();
		delete document.documentElement.dataset.theme;
	});

	it("시스템 선호도가 다크일 때 theme은 dark이고 isSystem은 true이다", () => {
		// Arrange
		mockMatchMedia(true);

		// Act
		const { result } = renderHook(() => useTheme());

		// Assert
		expect(result.current.theme).toBe("dark");
		expect(result.current.isSystem).toBe(true);
	});

	it("setTheme 호출 시 localStorage와 dataset.theme이 갱신되고 isSystem은 false가 된다", () => {
		// Arrange — 시스템은 다크를 선호하지만 강제로 라이트로 전환한다
		mockMatchMedia(true);
		const { result } = renderHook(() => useTheme());

		// Act
		act(() => {
			result.current.setTheme("light");
		});

		// Assert
		expect(localStorage.getItem("proto-theme")).toBe("light");
		expect(document.documentElement.dataset.theme).toBe("light");
		expect(result.current.theme).toBe("light");
		expect(result.current.isSystem).toBe(false);
	});

	it("localStorage에 값이 있으면 시스템 선호도와 무관하게 저장된 theme을 사용하고 isSystem은 false이다", () => {
		// Arrange — localStorage에 dark가 저장된 상태, 시스템은 라이트를 선호한다
		localStorage.setItem("proto-theme", "dark");
		mockMatchMedia(false);

		// Act
		const { result } = renderHook(() => useTheme());

		// Assert
		expect(result.current.theme).toBe("dark");
		expect(result.current.isSystem).toBe(false);
	});
});
