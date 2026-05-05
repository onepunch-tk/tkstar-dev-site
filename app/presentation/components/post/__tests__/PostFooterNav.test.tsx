import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// T014b RED — PostFooterNav 컴포넌트 (아직 없으므로 import 자체 실패 → RED)
// ---------------------------------------------------------------------------

import PostFooterNav from "../PostFooterNav";

// ---------------------------------------------------------------------------
// 헬퍼 — createRoutesStub으로 <Link> 렌더를 위한 래퍼 생성
// ---------------------------------------------------------------------------

type Adjacent = { slug: string; title: string } | null;

const renderNav = (prev: Adjacent, next: Adjacent) => {
	const Stub = createRoutesStub([
		{
			path: "/",
			Component: () => <PostFooterNav prev={prev} next={next} />,
		},
	]);
	render(<Stub initialEntries={["/"]} />);
};

// ---------------------------------------------------------------------------
// PostFooterNav
// ---------------------------------------------------------------------------

describe("PostFooterNav", () => {
	it("center 셀에 항상 '[모든 글]' 텍스트와 /blog href 링크가 있다 (prev/next 둘 다 있을 때)", async () => {
		// Arrange
		const prev = { slug: "a", title: "A" };
		const next = { slug: "b", title: "B" };

		// Act
		renderNav(prev, next);

		// Assert
		const centerLink = await screen.findByRole("link", { name: /모든 글/i });
		expect(centerLink).toHaveAttribute("href", "/blog");
		expect(centerLink.textContent).toContain("[모든 글]");
	});

	it("prev 가 null 이면 좌측 셀에 link 가 없다", async () => {
		// Arrange
		const next = { slug: "b", title: "Title B" };

		// Act
		renderNav(null, next);

		// Assert — /blog 로 시작하는 href 는 next 링크와 center(/blog) 뿐
		await screen.findByRole("link", { name: /모든 글/i });
		const blogLinks = screen
			.getAllByRole("link")
			.filter((l) => (l.getAttribute("href") ?? "").startsWith("/blog/"));
		// prev 링크 없으므로 /blog/ 시작 링크는 next 하나뿐
		expect(blogLinks).toHaveLength(1);
		expect(blogLinks[0].getAttribute("href")).toBe("/blog/b");
	});

	it("prev 가 있으면 좌측 셀에 /blog/{slug} href 링크와 title 텍스트가 있다", async () => {
		// Arrange
		const prev = { slug: "prev-slug", title: "이전 글 제목" };

		// Act
		renderNav(prev, null);

		// Assert
		const prevLink = await screen.findByRole("link", { name: /이전 글 제목/ });
		expect(prevLink).toHaveAttribute("href", "/blog/prev-slug");
	});

	it("next 가 null 이면 우측 셀에 link 가 없다", async () => {
		// Arrange
		const prev = { slug: "a", title: "Title A" };

		// Act
		renderNav(prev, null);

		// Assert — /blog/ 로 시작하는 href 는 prev 하나뿐
		await screen.findByRole("link", { name: /모든 글/i });
		const blogLinks = screen
			.getAllByRole("link")
			.filter((l) => (l.getAttribute("href") ?? "").startsWith("/blog/"));
		expect(blogLinks).toHaveLength(1);
		expect(blogLinks[0].getAttribute("href")).toBe("/blog/a");
	});

	it("next 가 있으면 우측 셀에 /blog/{slug} href 링크와 title 텍스트가 있다", async () => {
		// Arrange
		const next = { slug: "next-slug", title: "다음 글 제목" };

		// Act
		renderNav(null, next);

		// Assert
		const nextLink = await screen.findByRole("link", { name: /다음 글 제목/ });
		expect(nextLink).toHaveAttribute("href", "/blog/next-slug");
	});
});
