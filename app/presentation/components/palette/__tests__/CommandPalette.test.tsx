import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SearchableItem } from "~/application/search/lib/token-search";
import CommandPalette from "../CommandPalette";

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

// Cmd+K 단축키 디스패치 헬퍼
const openWithCmdK = async () => {
	await act(async () => {
		window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
	});
};

const renderPalette = () =>
	render(
		<MemoryRouter>
			<CommandPalette />
		</MemoryRouter>,
	);

describe("CommandPalette", () => {
	beforeEach(() => {
		sessionStorage.clear();
		vi.restoreAllMocks();
		navigate.mockReset();
	});

	it("기본 상태: palette-modal이 DOM에 없다", () => {
		// Arrange
		mockFetch(makeIndexPayload());

		// Act
		renderPalette();

		// Assert
		expect(screen.queryByTestId("palette-modal")).toBeNull();
	});

	it("Cmd+K 단축키로 팔레트가 열리고 palette-modal이 DOM에 나타난다", async () => {
		// Arrange
		mockFetch(makeIndexPayload());
		renderPalette();

		// Act
		await openWithCmdK();

		// Assert
		expect(screen.getByTestId("palette-modal")).toBeInTheDocument();
	});

	it("열렸을 때 모달에 role=dialog와 aria-modal=true 속성이 있다", async () => {
		// Arrange
		mockFetch(makeIndexPayload());
		renderPalette();

		// Act
		await openWithCmdK();

		// Assert
		const modal = screen.getByTestId("palette-modal");
		expect(modal).toHaveAttribute("role", "dialog");
		expect(modal).toHaveAttribute("aria-modal", "true");
	});

	it("열렸을 때 palette-input이 존재하고 자동 포커스된다", async () => {
		// Arrange
		mockFetch(makeIndexPayload());
		renderPalette();

		// Act
		await openWithCmdK();

		// Assert
		const input = screen.getByTestId("palette-input");
		expect(input).toBeInTheDocument();
		await waitFor(() => {
			expect(document.activeElement).toBe(input);
		});
	});

	it("항목이 있는 그룹 헤더는 모두 렌더된다", async () => {
		// Arrange
		const payload = makeIndexPayload({
			pages: [{ slug: "/about", title: "About" }],
			projects: [{ slug: "my-project", title: "My Project" }],
			posts: [{ slug: "hello", title: "Hello" }],
		});
		mockFetch(payload);
		renderPalette();

		// Act
		await openWithCmdK();

		// Assert
		expect(screen.getByTestId("palette-group-pages")).toBeInTheDocument();
		expect(screen.getByTestId("palette-group-projects")).toBeInTheDocument();
		expect(screen.getByTestId("palette-group-posts")).toBeInTheDocument();
	});

	it("항목이 없는 그룹은 DOM에 렌더되지 않는다", async () => {
		// Arrange
		const payload = makeIndexPayload({
			pages: [{ slug: "/about", title: "About" }],
			projects: [],
			posts: [],
		});
		mockFetch(payload);
		renderPalette();

		// Act
		await openWithCmdK();

		// Assert
		expect(screen.getByTestId("palette-group-pages")).toBeInTheDocument();
		expect(screen.queryByTestId("palette-group-projects")).toBeNull();
		expect(screen.queryByTestId("palette-group-posts")).toBeNull();
	});

	it("sessionStorage에 recents가 있고 query가 비어 있으면 recents 그룹이 표시된다", async () => {
		// Arrange
		sessionStorage.setItem(
			"tkstar-palette-recent",
			JSON.stringify([{ slug: "/", title: "Home", group: "pages" }]),
		);
		mockFetch(makeIndexPayload());
		renderPalette();

		// Act
		await openWithCmdK();

		// Assert
		expect(screen.getByTestId("palette-group-recents")).toBeInTheDocument();
	});

	it("recents가 있어도 텍스트를 입력하면 recents 그룹이 숨겨진다", async () => {
		// Arrange
		sessionStorage.setItem(
			"tkstar-palette-recent",
			JSON.stringify([{ slug: "/", title: "Home", group: "pages" }]),
		);
		mockFetch(makeIndexPayload());
		renderPalette();
		await openWithCmdK();
		const input = screen.getByTestId("palette-input");

		// Act
		await act(async () => {
			fireEvent.change(input, { target: { value: "x" } });
		});

		// Assert
		expect(screen.queryByTestId("palette-group-recents")).toBeNull();
	});

	it("두 번째 항목에 포인터 진입 시 해당 항목의 data-active가 true, 첫 번째는 false다", async () => {
		// Arrange
		const payload = makeIndexPayload({
			pages: [
				{ slug: "/about", title: "About" },
				{ slug: "/projects", title: "Projects" },
			],
		});
		mockFetch(payload);
		renderPalette();
		await openWithCmdK();

		// Act
		const secondItem = screen.getByTestId("palette-item-pages-/projects");
		await act(async () => {
			secondItem.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
		});

		// Assert
		expect(secondItem).toHaveAttribute("data-active", "true");
		expect(screen.getByTestId("palette-item-pages-/about")).toHaveAttribute("data-active", "false");
	});

	it("Escape 키로 열려 있는 팔레트가 닫힌다", async () => {
		// Arrange
		mockFetch(makeIndexPayload());
		renderPalette();
		await openWithCmdK();
		expect(screen.getByTestId("palette-modal")).toBeInTheDocument();

		// Act
		await act(async () => {
			window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
		});

		// Assert
		expect(screen.queryByTestId("palette-modal")).toBeNull();
	});
});
