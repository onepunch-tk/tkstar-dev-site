import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Post } from "../../../../domain/post/post.entity";

import RecentPostsList from "../RecentPostsList";

const T = 1714291200;

const mockPosts: Post[] = [
	{
		slug: "post-1",
		title: "첫 번째 글",
		summary: "summary 1",
		datePublished: "2026-04-01",
		tags: ["dev"],
		status: "published",
		createdAt: T,
		updatedAt: T,
	},
	{
		slug: "post-2",
		title: "두 번째 글",
		summary: "summary 2",
		datePublished: "2026-03-20",
		tags: ["dev"],
		status: "published",
		createdAt: T - 86400 * 12,
		updatedAt: T - 86400 * 12,
	},
	{
		slug: "post-3",
		title: "세 번째 글",
		summary: "summary 3",
		datePublished: "2026-03-05",
		tags: ["dev"],
		status: "published",
		createdAt: T - 86400 * 27,
		updatedAt: T - 86400 * 27,
	},
];

describe("RecentPostsList", () => {
	it("posts 배열 길이만큼 row가 렌더된다", () => {
		render(
			<MemoryRouter>
				<RecentPostsList posts={mockPosts} />
			</MemoryRouter>,
		);
		const rows = screen.getAllByTestId("post-row");
		expect(rows).toHaveLength(3);
	});

	it("첫 번째 row에 datePublished와 title이 렌더된다", () => {
		render(
			<MemoryRouter>
				<RecentPostsList posts={mockPosts} />
			</MemoryRouter>,
		);
		expect(screen.getByText("첫 번째 글")).toBeInTheDocument();
		expect(screen.getByText("2026-04-01")).toBeInTheDocument();
	});

	it("각 row가 /blog/:slug 링크로 렌더된다", () => {
		render(
			<MemoryRouter>
				<RecentPostsList posts={mockPosts} />
			</MemoryRouter>,
		);
		const firstLink = screen.getByRole("link", { name: /첫 번째 글/ });
		expect(firstLink).toHaveAttribute("href", "/blog/post-1");
	});

	it('"모두 보기 →" 링크가 /blog로 렌더된다', () => {
		render(
			<MemoryRouter>
				<RecentPostsList posts={mockPosts} />
			</MemoryRouter>,
		);
		const viewAllLink = screen.getByRole("link", { name: /모두 보기/ });
		expect(viewAllLink).toBeInTheDocument();
		expect(viewAllLink).toHaveAttribute("href", "/blog");
	});

	it('빈 배열 전달 시 row는 0개이고 "모두 보기 →" 링크는 유지된다', () => {
		render(
			<MemoryRouter>
				<RecentPostsList posts={[]} />
			</MemoryRouter>,
		);
		const rows = screen.queryAllByTestId("post-row");
		const viewAllLink = screen.getByRole("link", { name: /모두 보기/ });
		expect(rows).toHaveLength(0);
		expect(viewAllLink).toBeInTheDocument();
	});
});
