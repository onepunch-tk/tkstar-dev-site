import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

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
