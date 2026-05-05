import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const triggerPrintSpy = vi.fn();
vi.mock("../../../lib/print", () => ({
	triggerPrint: () => triggerPrintSpy(),
}));

import AboutHeader from "../AboutHeader";

describe("AboutHeader", () => {
	beforeEach(() => {
		triggerPrintSpy.mockClear();
	});

	it("h1에 이름 '김태곤'이 포함된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<AboutHeader />
			</MemoryRouter>,
		);

		// Act
		const heading = screen.getByRole("heading", { level: 1 });

		// Assert
		expect(heading.textContent).toContain("김태곤");
	});

	it("포지셔닝 텍스트 '1인 개발자 · 풀스택 · 제품 설계부터 운영까지'가 document에 존재한다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<AboutHeader />
			</MemoryRouter>,
		);

		// Act & Assert
		expect(screen.getByText(/1인 개발자.+풀스택.+제품 설계부터 운영까지/)).toBeInTheDocument();
	});

	it("이메일 링크가 존재하고 href가 mailto:hello@tkstar.dev이다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<AboutHeader />
			</MemoryRouter>,
		);

		// Act
		const emailLink = screen.getByRole("link", { name: /hello@tkstar\.dev/ });

		// Assert
		expect(emailLink).toHaveAttribute("href", "mailto:hello@tkstar.dev");
	});

	it("'Print as PDF' 버튼이 type='button'이고 클릭 시 triggerPrint가 1회 호출된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<AboutHeader />
			</MemoryRouter>,
		);
		const button = screen.getByRole("button", { name: /Print as PDF/i });

		// Assert — 버튼 속성 확인
		expect(button).toHaveAttribute("type", "button");

		// Act
		fireEvent.click(button);

		// Assert — triggerPrint spy 1회 호출
		expect(triggerPrintSpy).toHaveBeenCalledTimes(1);
	});
});
