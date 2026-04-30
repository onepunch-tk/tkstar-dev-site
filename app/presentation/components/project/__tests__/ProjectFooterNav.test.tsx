import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import ProjectFooterNav from "../ProjectFooterNav";

// ---------------------------------------------------------------------------
// 헬퍼 — createRoutesStub으로 <Link> 렌더를 위한 래퍼 생성
// ---------------------------------------------------------------------------

type Adjacent = { slug: string; title: string } | null;

const renderNav = (prev: Adjacent, next: Adjacent) => {
	const Stub = createRoutesStub([
		{
			path: "/",
			Component: () => <ProjectFooterNav prev={prev} next={next} />,
		},
	]);
	render(<Stub initialEntries={["/"]} />);
};

// ---------------------------------------------------------------------------
// ProjectFooterNav
// ---------------------------------------------------------------------------

describe("ProjectFooterNav", () => {
	it("/contact 링크가 항상 노출된다 (prev/next 둘 다 있을 때)", async () => {
		// Arrange
		const prev = { slug: "a", title: "A" };
		const next = { slug: "b", title: "B" };

		// Act
		renderNav(prev, next);

		// Assert
		const contactLink = await screen.findByRole("link", { name: /의뢰하기/ });
		expect(contactLink).toHaveAttribute("href", "/contact");
	});

	it("prev 가 null 이면 prev 슬롯에 link 가 없다", async () => {
		// Arrange
		const next = { slug: "b", title: "B" };

		// Act
		renderNav(null, next);

		// Assert
		// 의뢰하기 링크 + next 링크 = 2개
		await screen.findByRole("link", { name: /의뢰하기/ });
		const links = screen.getAllByRole("link");
		expect(links).toHaveLength(2);
		// /projects/ 로 시작하는 href 는 next 링크 하나뿐 (prev 링크 없음)
		const projectLinks = links.filter((l) =>
			(l.getAttribute("href") ?? "").startsWith("/projects/"),
		);
		expect(projectLinks).toHaveLength(1);
	});

	it("next 가 null 이면 next 슬롯에 link 가 없다", async () => {
		// Arrange
		const prev = { slug: "a", title: "A" };

		// Act
		renderNav(prev, null);

		// Assert
		// 의뢰하기 링크 + prev 링크 = 2개
		await screen.findByRole("link", { name: /의뢰하기/ });
		const links = screen.getAllByRole("link");
		expect(links).toHaveLength(2);
		// /projects/ 로 시작하는 href 는 prev 링크 하나뿐 (next 링크 없음)
		const projectLinks = links.filter((l) =>
			(l.getAttribute("href") ?? "").startsWith("/projects/"),
		);
		expect(projectLinks).toHaveLength(1);
	});

	it("prev 와 next 가 둘 다 있을 때 href 및 타이틀 텍스트 검증", async () => {
		// Arrange
		const prev = { slug: "prev-slug", title: "이전 프로젝트" };
		const next = { slug: "next-slug", title: "다음 프로젝트" };

		// Act
		renderNav(prev, next);

		// Assert
		await screen.findByRole("link", { name: /의뢰하기/ });

		const links = screen.getAllByRole("link");
		const prevLink = links.find((l) => l.getAttribute("href") === `/projects/${prev.slug}`);
		const nextLink = links.find((l) => l.getAttribute("href") === `/projects/${next.slug}`);

		expect(prevLink).toBeDefined();
		expect(prevLink).toHaveAttribute("href", `/projects/${prev.slug}`);
		expect(prevLink?.textContent).toContain(prev.title);

		expect(nextLink).toBeDefined();
		expect(nextLink).toHaveAttribute("href", `/projects/${next.slug}`);
		expect(nextLink?.textContent).toContain(next.title);
	});
});
