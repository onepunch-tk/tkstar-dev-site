import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ThemeProvider from "../../providers/ThemeProvider";
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
		localStorage.clear();
		delete document.documentElement.dataset.theme;
	});

	it("시스템 선호도가 다크일 때 theme은 dark이다", () => {
		mockMatchMedia(true);

		const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

		expect(result.current.theme).toBe("dark");
	});

	it("setTheme 호출 시 localStorage와 dataset.theme이 갱신되고 theme state가 동기화된다", () => {
		mockMatchMedia(true);
		const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

		act(() => {
			result.current.setTheme("light");
		});

		expect(localStorage.getItem("proto-theme")).toBe("light");
		expect(document.documentElement.dataset.theme).toBe("light");
		expect(result.current.theme).toBe("light");
	});

	it("localStorage에 값이 있으면 시스템 선호도와 무관하게 저장된 theme을 사용한다", () => {
		localStorage.setItem("proto-theme", "dark");
		mockMatchMedia(false);

		const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

		expect(result.current.theme).toBe("dark");
	});
});
