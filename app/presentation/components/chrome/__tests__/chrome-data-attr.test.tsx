import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

// Footer는 useRouteLoaderData("root") 를 호출하므로 data router 컨텍스트가 필요.
// MemoryRouter는 data router 가 아니므로 hook 을 vi.mock 으로 모킹해 회피.
vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return { ...actual, useRouteLoaderData: vi.fn().mockReturnValue({ appCount: 0 }) };
});

import Footer from "../Footer";
import ThemeToggle from "../ThemeToggle";
import Topbar from "../Topbar";

describe("chrome data-chrome attributes (for @media print hide hook)", () => {
	it("Topbar의 <header>에 data-chrome='topbar'가 부착된다", () => {
		// Arrange + Act
		const { container } = render(
			<MemoryRouter>
				<Topbar />
			</MemoryRouter>,
		);

		// Assert
		const header = container.querySelector("[data-chrome='topbar']");
		expect(header).not.toBeNull();
	});

	it("Topbar 내 검색 트리거 버튼에 data-chrome='search-trigger'가 부착된다", () => {
		// Arrange + Act
		const { container } = render(
			<MemoryRouter>
				<Topbar />
			</MemoryRouter>,
		);

		// Assert
		const searchTrigger = container.querySelector("[data-chrome='search-trigger']");
		expect(searchTrigger).not.toBeNull();
	});

	it("Footer에 data-chrome='footer'가 부착된다", () => {
		// Arrange + Act
		const { container } = render(
			<MemoryRouter>
				<Footer />
			</MemoryRouter>,
		);

		// Assert
		const footer = container.querySelector("[data-chrome='footer']");
		expect(footer).not.toBeNull();
	});

	it("ThemeToggle 버튼에 data-chrome='theme-toggle'가 부착된다", () => {
		// Arrange + Act
		const { container } = render(
			<MemoryRouter>
				<ThemeToggle />
			</MemoryRouter>,
		);

		// Assert
		const toggle = container.querySelector("[data-chrome='theme-toggle']");
		expect(toggle).not.toBeNull();
	});
});
