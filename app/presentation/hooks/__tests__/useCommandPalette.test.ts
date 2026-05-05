import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SearchableItem } from "~/application/search/lib/token-search";
import { useCommandPalette } from "../useCommandPalette";

// react-router의 useNavigate를 모킹한다
const navigate = vi.fn();
vi.mock("react-router", async (orig) => {
	const actual = await orig<typeof import("react-router")>();
	return { ...actual, useNavigate: () => navigate };
});

// 검색 인덱스 페이로드 헬퍼
const makeIndexPayload = (overrides?: {
	pages?: SearchableItem[];
	projects?: SearchableItem[];
	posts?: SearchableItem[];
}) => ({
	pages: overrides?.pages ?? [],
	projects: overrides?.projects ?? [],
	posts: overrides?.posts ?? [],
});

// fetch 모킹 헬퍼
const mockFetch = (payload: ReturnType<typeof makeIndexPayload>) => {
	globalThis.fetch = vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 }));
};

// renderHook을 MemoryRouter로 감싸는 래퍼
const wrapper = ({ children }: { children: React.ReactNode }) =>
	createElement(MemoryRouter, null, children);

// 키다운 이벤트 디스패치 헬퍼
const fireKey = (key: string, opts: { metaKey?: boolean; ctrlKey?: boolean } = {}) => {
	window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...opts }));
};

describe("useCommandPalette", () => {
	beforeEach(() => {
		sessionStorage.clear();
		vi.restoreAllMocks();
		navigate.mockReset();
	});

	describe("초기 상태", () => {
		it("초기 상태: isOpen=false, query='', activeIndex=0이다", () => {
			// Arrange
			mockFetch(makeIndexPayload());

			// Act
			const { result } = renderHook(() => useCommandPalette(), { wrapper });

			// Assert
			expect(result.current.isOpen).toBe(false);
			expect(result.current.query).toBe("");
			expect(result.current.activeIndex).toBe(0);
		});
	});

	describe("키보드 단축키", () => {
		it("macOS 단축키(metaKey+k)로 팔레트가 열린다", async () => {
			// Arrange
			mockFetch(makeIndexPayload());
			const { result } = renderHook(() => useCommandPalette(), { wrapper });

			// Act
			await act(async () => {
				fireKey("k", { metaKey: true });
			});

			// Assert
			expect(result.current.isOpen).toBe(true);
		});

		it("Win/Linux 단축키(ctrlKey+k)로 팔레트가 열린다", async () => {
			// Arrange
			mockFetch(makeIndexPayload());
			const { result } = renderHook(() => useCommandPalette(), { wrapper });

			// Act
			await act(async () => {
				fireKey("k", { ctrlKey: true });
			});

			// Assert
			expect(result.current.isOpen).toBe(true);
		});

		it("슬래시('/') 단축키로 팔레트가 열린다", async () => {
			// Arrange
			mockFetch(makeIndexPayload());
			const { result } = renderHook(() => useCommandPalette(), { wrapper });

			// Act
			await act(async () => {
				fireKey("/");
			});

			// Assert
			expect(result.current.isOpen).toBe(true);
		});

		it("Escape 키로 열린 팔레트가 닫힌다", async () => {
			// Arrange
			mockFetch(makeIndexPayload());
			const { result } = renderHook(() => useCommandPalette(), { wrapper });
			await act(async () => {
				result.current.open();
			});
			expect(result.current.isOpen).toBe(true);

			// Act
			await act(async () => {
				fireKey("Escape");
			});

			// Assert
			expect(result.current.isOpen).toBe(false);
		});
	});

	describe("포커스 가드", () => {
		it("<input>에 포커스가 있으면 단축키로 팔레트가 열리지 않는다", async () => {
			// Arrange
			mockFetch(makeIndexPayload());
			const input = document.createElement("input");
			document.body.appendChild(input);
			input.focus();
			const { result } = renderHook(() => useCommandPalette(), { wrapper });

			// Act
			await act(async () => {
				fireKey("k", { metaKey: true });
				fireKey("k", { ctrlKey: true });
				fireKey("/");
			});

			// Assert
			expect(result.current.isOpen).toBe(false);
			document.body.removeChild(input);
		});

		it("<textarea>에 포커스가 있으면 단축키로 팔레트가 열리지 않는다", async () => {
			// Arrange
			mockFetch(makeIndexPayload());
			const textarea = document.createElement("textarea");
			document.body.appendChild(textarea);
			textarea.focus();
			const { result } = renderHook(() => useCommandPalette(), { wrapper });

			// Act
			await act(async () => {
				fireKey("k", { metaKey: true });
				fireKey("k", { ctrlKey: true });
				fireKey("/");
			});

			// Assert
			expect(result.current.isOpen).toBe(false);
			document.body.removeChild(textarea);
		});

		it("[contenteditable]에 포커스가 있으면 단축키로 팔레트가 열리지 않는다", async () => {
			// Arrange
			mockFetch(makeIndexPayload());
			const div = document.createElement("div");
			div.setAttribute("contenteditable", "true");
			document.body.appendChild(div);
			div.focus();
			const { result } = renderHook(() => useCommandPalette(), { wrapper });

			// Act
			await act(async () => {
				fireKey("k", { metaKey: true });
				fireKey("k", { ctrlKey: true });
				fireKey("/");
			});

			// Assert
			expect(result.current.isOpen).toBe(false);
			document.body.removeChild(div);
		});
	});

	describe("lazy fetch", () => {
		it("팔레트를 열고 닫고 다시 열어도 fetch('/search-index.json')는 정확히 1회만 호출된다", async () => {
			// Arrange
			const pages: SearchableItem[] = [{ slug: "/about", title: "About" }];
			mockFetch(makeIndexPayload({ pages }));
			const { result } = renderHook(() => useCommandPalette(), { wrapper });

			// Act
			await act(async () => {
				result.current.open();
			});
			await act(async () => {
				result.current.close();
			});
			await act(async () => {
				result.current.open();
			});

			// Assert
			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
			expect(globalThis.fetch).toHaveBeenCalledWith("/search-index.json");
			expect(result.current.groups.pages.length).toBe(1);
		});
	});

	describe("키보드 네비게이션", () => {
		it("ArrowDown으로 activeIndex가 증가하고 마지막 항목에서 클램핑된다", async () => {
			// Arrange
			const pages: SearchableItem[] = [
				{ slug: "/", title: "Home" },
				{ slug: "/about", title: "About" },
			];
			mockFetch(makeIndexPayload({ pages }));
			const { result } = renderHook(() => useCommandPalette(), { wrapper });
			await act(async () => {
				result.current.open();
			});
			expect(result.current.flatItems.length).toBeGreaterThan(1);

			// Act & Assert — 아래로 이동
			await act(async () => {
				fireKey("ArrowDown");
			});
			expect(result.current.activeIndex).toBe(1);

			// 마지막 항목에서 클램핑
			await act(async () => {
				fireKey("ArrowDown");
			});
			expect(result.current.activeIndex).toBe(result.current.flatItems.length - 1);
		});

		it("ArrowUp으로 activeIndex가 감소하고 0에서 클램핑된다", async () => {
			// Arrange
			const pages: SearchableItem[] = [
				{ slug: "/", title: "Home" },
				{ slug: "/about", title: "About" },
			];
			mockFetch(makeIndexPayload({ pages }));
			const { result } = renderHook(() => useCommandPalette(), { wrapper });
			await act(async () => {
				result.current.open();
			});

			// Act & Assert — 위로 이동 시 0에서 클램핑
			await act(async () => {
				fireKey("ArrowUp");
			});
			expect(result.current.activeIndex).toBe(0);
		});
	});

	describe("선택 동작", () => {
		it("Enter 키로 active 항목을 선택하면 navigate 호출, recent 저장, isOpen=false가 된다", async () => {
			// Arrange
			const pages: SearchableItem[] = [
				{ slug: "/about", title: "About" },
				{ slug: "/projects", title: "Projects" },
			];
			mockFetch(makeIndexPayload({ pages }));
			const { result } = renderHook(() => useCommandPalette(), { wrapper });
			await act(async () => {
				result.current.open();
			});
			expect(result.current.flatItems.length).toBeGreaterThan(0);

			// Act
			await act(async () => {
				fireKey("Enter");
			});

			// Assert
			const firstItem = result.current.flatItems[0] ?? {
				href: "/about",
				slug: "/about",
				title: "About",
				group: "pages",
			};
			expect(navigate).toHaveBeenCalledTimes(1);
			expect(navigate).toHaveBeenCalledWith(firstItem.href);
			const storedRaw = sessionStorage.getItem("tkstar-palette-recent");
			expect(storedRaw).not.toBeNull();
			const stored = JSON.parse(storedRaw as string) as Array<{
				slug: string;
				title: string;
				group: string;
			}>;
			expect(stored.length).toBeGreaterThanOrEqual(1);
			expect(result.current.isOpen).toBe(false);
		});

		it("query가 비어 있고 recents가 있으면 recents가 flatItems에 노출된다", async () => {
			// Arrange
			sessionStorage.setItem(
				"tkstar-palette-recent",
				JSON.stringify([{ slug: "/", title: "Home", group: "pages" }]),
			);
			mockFetch(makeIndexPayload());
			const { result } = renderHook(() => useCommandPalette(), { wrapper });

			// Act
			await act(async () => {
				result.current.open();
			});

			// Assert
			expect(result.current.recents.length).toBe(1);
			expect(result.current.flatItems[0]?.slug).toBe("/");
		});

		it("query가 비어 있지 않으면 recents가 숨겨진다", async () => {
			// Arrange
			sessionStorage.setItem(
				"tkstar-palette-recent",
				JSON.stringify([{ slug: "/", title: "Home", group: "pages" }]),
			);
			mockFetch(makeIndexPayload());
			const { result } = renderHook(() => useCommandPalette(), { wrapper });
			await act(async () => {
				result.current.open();
			});

			// Act
			await act(async () => {
				result.current.setQuery("about");
			});

			// Assert
			expect(result.current.recents.length).toBe(0);
		});

		it("query 입력 시 tokenSearch로 groups가 필터링된다", async () => {
			// Arrange
			const pages: SearchableItem[] = [
				{ slug: "/about", title: "About" },
				{ slug: "/blog", title: "Blog" },
			];
			mockFetch(makeIndexPayload({ pages }));
			const { result } = renderHook(() => useCommandPalette(), { wrapper });
			await act(async () => {
				result.current.open();
			});

			// Act
			await act(async () => {
				result.current.setQuery("about");
			});

			// Assert
			expect(result.current.groups.pages.length).toBe(1);
			expect(result.current.groups.pages[0]?.slug).toBe("/about");
		});
	});
});
