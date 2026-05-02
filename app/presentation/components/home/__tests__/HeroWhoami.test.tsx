import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const openSpy = vi.fn();
vi.mock("../../../hooks/useCommandPalette", () => ({
	openCommandPalette: () => openSpy(),
}));

import HeroWhoami from "../HeroWhoami";

describe("HeroWhoami", () => {
	beforeEach(() => {
		openSpy.mockClear();
	});

	it("h1에 'ship solo.'와 'ship fast.' 텍스트가 모두 포함된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<HeroWhoami />
			</MemoryRouter>,
		);

		// Act
		const heading = screen.getByRole("heading", { level: 1 });

		// Assert
		const normalizedText = heading.textContent?.replace(/\s+/g, " ").trim() ?? "";
		expect(normalizedText).toMatch(/ship solo\./i);
		expect(normalizedText).toMatch(/ship fast\./i);
	});

	it("부제 텍스트 '1인 개발자 김태곤'이 렌더된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<HeroWhoami />
			</MemoryRouter>,
		);

		// Act & Assert
		expect(screen.getByText(/1인 개발자 김태곤/)).toBeInTheDocument();
	});

	it("'검색해서 이동' 버튼이 type='button'이고, 클릭 시 open이 1회 호출된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<HeroWhoami />
			</MemoryRouter>,
		);
		const button = screen.getByRole("button", { name: /검색해서 이동/ });

		// Assert — 버튼 속성 확인
		expect(button).toHaveAttribute("type", "button");

		// Act
		fireEvent.click(button);

		// Assert — open spy 1회 호출
		expect(openSpy).toHaveBeenCalledTimes(1);
	});

	it("/about 링크가 존재하고 href='/about'이다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<HeroWhoami />
			</MemoryRouter>,
		);

		// Act
		const aboutLink = screen.getByRole("link", { name: "/about" });

		// Assert
		expect(aboutLink).toHaveAttribute("href", "/about");
	});

	it("/projects 링크가 존재하고 href='/projects'이다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<HeroWhoami />
			</MemoryRouter>,
		);

		// Act
		const projectsLink = screen.getByRole("link", { name: "/projects" });

		// Assert
		expect(projectsLink).toHaveAttribute("href", "/projects");
	});
});
