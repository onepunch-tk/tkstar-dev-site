import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

// triggerPrint mock (헤더의 PDF 버튼이 의존)
vi.mock("../../lib/print", () => ({
	triggerPrint: vi.fn(),
}));

import About from "../about";

describe("About route", () => {
	const renderAbout = () =>
		render(
			<MemoryRouter>
				<About />
			</MemoryRouter>,
		);

	it("h1에 이름 '김태곤'이 포함된다 (헤더 영역)", () => {
		// Arrange + Act
		renderAbout();

		// Assert
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading.textContent).toContain("김태곤");
	});

	it("Print as PDF 버튼이 존재한다", () => {
		// Arrange + Act
		renderAbout();

		// Assert
		expect(screen.getByRole("button", { name: /Print as PDF/i })).toBeInTheDocument();
	});

	it("스택 영역 heading이 렌더된다 (예: /기술 스택|stack/i 매칭)", () => {
		// Arrange + Act
		renderAbout();

		// Assert
		expect(
			screen.getByRole("heading", { name: /기술\s*스택|stack/i, level: 2 }),
		).toBeInTheDocument();
	});

	it("경력 영역 heading이 렌더된다 (예: /경력|career|experience/i)", () => {
		// Arrange + Act
		renderAbout();

		// Assert
		expect(
			screen.getByRole("heading", { name: /경력|career|experience/i, level: 2 }),
		).toBeInTheDocument();
	});

	it("학력 영역 heading이 렌더된다 (예: /학력|education/i)", () => {
		// Arrange + Act
		renderAbout();

		// Assert
		expect(screen.getByRole("heading", { name: /학력|education/i, level: 2 })).toBeInTheDocument();
	});

	it("수상 영역 heading이 렌더된다 (예: /수상|award/i)", () => {
		// Arrange + Act
		renderAbout();

		// Assert
		expect(screen.getByRole("heading", { name: /수상|award/i, level: 2 })).toBeInTheDocument();
	});
});
