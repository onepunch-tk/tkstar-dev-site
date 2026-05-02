import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// T014b RED — ShareTools 컴포넌트 (아직 없으므로 import 자체 실패 → RED)
// ---------------------------------------------------------------------------

import ShareTools from "../ShareTools";

describe("ShareTools", () => {
	const TITLE = "Test Post Title";
	const CANONICAL_URL = "https://tkstar.dev/blog/test-post";

	beforeEach(() => {
		vi.useFakeTimers();
		// jsdom 환경에서 navigator.clipboard 가 없으므로 직접 주입
		Object.assign(navigator, {
			clipboard: {
				writeText: vi.fn().mockResolvedValue(undefined),
			},
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("Copy link 버튼 클릭 시 navigator.clipboard.writeText 가 canonicalUrl 로 호출된다", async () => {
		// Arrange
		render(<ShareTools title={TITLE} canonicalUrl={CANONICAL_URL} />);

		// Act
		const copyButton = screen.getByRole("button", { name: /copy link/i });
		await act(async () => {
			fireEvent.click(copyButton);
		});

		// Assert
		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(CANONICAL_URL);
	});

	it("클릭 직후 'copied' 라벨이 노출되고 1500ms 후 사라진다", async () => {
		// Arrange
		render(<ShareTools title={TITLE} canonicalUrl={CANONICAL_URL} />);
		const copyButton = screen.getByRole("button", { name: /copy link/i });

		// Act — 클릭 직후 (clipboard.writeText resolve 까지 microtask 소진)
		await act(async () => {
			fireEvent.click(copyButton);
		});

		// Assert — 'copied' 라벨 표시
		expect(screen.getByText(/copied/i)).toBeInTheDocument();

		// Act — 1500ms 경과
		act(() => {
			vi.advanceTimersByTime(1500);
		});

		// Assert — 'copied' 라벨 사라짐
		expect(screen.queryByText(/copied/i)).toBeNull();
	});

	it("X 공유 링크의 href / target / rel 이 올바르다", () => {
		// Arrange
		render(<ShareTools title={TITLE} canonicalUrl={CANONICAL_URL} />);

		// Act
		const link = screen.getByRole("link", { name: /share on x/i });

		// Assert
		const expectedHref = `https://x.com/intent/post?text=${encodeURIComponent(TITLE)}&url=${encodeURIComponent(CANONICAL_URL)}`;
		expect(link.getAttribute("href")).toBe(expectedHref);
		expect(link.getAttribute("target")).toBe("_blank");
		expect(link.getAttribute("rel")).toContain("noopener");
		expect(link.getAttribute("rel")).toContain("noreferrer");
	});

	it("aria-live='polite' 영역이 존재한다 ('copied' 알림용)", () => {
		// Arrange
		render(<ShareTools title={TITLE} canonicalUrl={CANONICAL_URL} />);

		// Act & Assert
		// aria-live="polite" 는 role="status" 와 동일 ARIA 역할
		const liveRegion = document.querySelector("[aria-live='polite']");
		expect(liveRegion).toBeTruthy();
	});
});
