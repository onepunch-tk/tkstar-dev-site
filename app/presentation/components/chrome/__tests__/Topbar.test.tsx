import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return { ...actual, useRouteLoaderData: vi.fn().mockReturnValue({ appCount: 0 }) };
});

import Topbar from "../Topbar";

describe("Topbar — 원본 디자인 정렬 (카테고리 NavLink 제거)", () => {
	it("Topbar 는 about NavLink 를 렌더하지 않는다", () => {
		render(
			<MemoryRouter>
				<Topbar />
			</MemoryRouter>,
		);

		expect(screen.queryByRole("link", { name: /^about$/i })).toBeNull();
	});

	it("Topbar 는 projects NavLink 를 렌더하지 않는다", () => {
		render(
			<MemoryRouter>
				<Topbar />
			</MemoryRouter>,
		);

		expect(screen.queryByRole("link", { name: /^projects$/i })).toBeNull();
	});

	it("Topbar 는 blog NavLink 를 렌더하지 않는다", () => {
		render(
			<MemoryRouter>
				<Topbar />
			</MemoryRouter>,
		);

		expect(screen.queryByRole("link", { name: /^blog$/i })).toBeNull();
	});

	it("회귀 가드: brand 링크 / search-trigger / theme-toggle 은 그대로 노출된다", () => {
		const { container } = render(
			<MemoryRouter>
				<Topbar />
			</MemoryRouter>,
		);

		expect(screen.getByRole("link", { name: /tkstar/i })).toBeInTheDocument();
		expect(container.querySelector("[data-chrome='search-trigger']")).not.toBeNull();
		expect(container.querySelector("[data-chrome='theme-toggle']")).not.toBeNull();
	});
});
