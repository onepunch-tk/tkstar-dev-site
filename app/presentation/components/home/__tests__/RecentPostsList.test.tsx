import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Post } from "../../../../domain/post/post.entity";

import RecentPostsList from "../RecentPostsList";

// 테스트 픽스처
const mockPosts: Post[] = [
	{
		slug: "post-1",
		title: "첫 번째 글",
		lede: "lede 1",
		date: "2026-04-01T00:00:00.000Z",
		tags: ["dev"],
		read: 5,
	},
	{
		slug: "post-2",
		title: "두 번째 글",
		lede: "lede 2",
		date: "2026-03-20",
		tags: ["dev"],
		read: 8,
	},
	{
		slug: "post-3",
		title: "세 번째 글",
		lede: "lede 3",
		date: "2026-03-05",
		tags: ["dev"],
		read: 12,
	},
];

describe("RecentPostsList", () => {
	it("posts 배열 길이만큼 row가 렌더된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<RecentPostsList posts={mockPosts} />
			</MemoryRouter>,
		);

		// Act
		const rows = screen.getAllByTestId("post-row");

		// Assert
		expect(rows).toHaveLength(3);
	});

	it("첫 번째 row에 date와 title이 렌더된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<RecentPostsList posts={mockPosts} />
			</MemoryRouter>,
		);

		// Act & Assert
		expect(screen.getByText("첫 번째 글")).toBeInTheDocument();
		expect(screen.getByText("2026-04-01")).toBeInTheDocument();
	});

	it("각 row가 /blog/:slug 링크로 렌더된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<RecentPostsList posts={mockPosts} />
			</MemoryRouter>,
		);

		// Act
		const firstLink = screen.getByRole("link", { name: /첫 번째 글/ });

		// Assert
		expect(firstLink).toHaveAttribute("href", "/blog/post-1");
	});

	it('"모두 보기 →" 링크가 /blog로 렌더된다', () => {
		// Arrange
		render(
			<MemoryRouter>
				<RecentPostsList posts={mockPosts} />
			</MemoryRouter>,
		);

		// Act
		const viewAllLink = screen.getByRole("link", { name: /모두 보기/ });

		// Assert
		expect(viewAllLink).toBeInTheDocument();
		expect(viewAllLink).toHaveAttribute("href", "/blog");
	});

	it('빈 배열 전달 시 row는 0개이고 "모두 보기 →" 링크는 유지된다', () => {
		// Arrange
		render(
			<MemoryRouter>
				<RecentPostsList posts={[]} />
			</MemoryRouter>,
		);

		// Act
		const rows = screen.queryAllByTestId("post-row");
		const viewAllLink = screen.getByRole("link", { name: /모두 보기/ });

		// Assert
		expect(rows).toHaveLength(0);
		expect(viewAllLink).toBeInTheDocument();
	});
});
