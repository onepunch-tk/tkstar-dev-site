import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

// triggerPrint mock (헤더의 PDF 버튼이 의존)
vi.mock("../../lib/print", () => ({
	triggerPrint: vi.fn(),
}));

import About, { loader } from "../about";

// ---------------------------------------------------------------------------
// 공통 상수 / 팩토리
// ---------------------------------------------------------------------------

const SITE_ORIGIN = "https://tkstar.dev";

const makeMockContext = () => ({
	context: {
		container: {},
		cloudflare: {
			env: { SITE_LAUNCHED: "true", SITE_ORIGIN },
			ctx: {},
		},
	},
});

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

// ---------------------------------------------------------------------------
// env.SITE_ORIGIN 기반 origin 고정 (Launch Gate)
// ---------------------------------------------------------------------------

describe("About loader — env.SITE_ORIGIN 기반 origin 고정", () => {
	it("env.SITE_ORIGIN 을 canonical origin 으로 사용 — request.url 의 호스트와 무관", () => {
		// Arrange
		const { context } = makeMockContext();

		// Act — 다른 호스트로 요청
		const result = loader({
			context,
			params: {},
			request: new Request("https://www.tkstar.dev/about"),
		} as never);

		// Assert
		expect(result.origin).toBe(SITE_ORIGIN);
		expect(result.canonicalUrl).toBe(`${SITE_ORIGIN}/about`);
	});
});
