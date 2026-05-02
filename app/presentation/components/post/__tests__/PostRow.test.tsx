import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Post } from "../../../../domain/post/post.entity";

import PostRow from "../PostRow";

const mockPost: Post = {
	slug: "example-post",
	title: "Example Post",
	lede: "A short lede of the post.",
	date: "2026-04-28",
	tags: ["solo", "ops"],
	read: 3,
};

describe("PostRow", () => {
	it("date(YYYY-MM-DD), title, lede, tags, read 필드를 모두 렌더한다", () => {
		// Arrange / Act
		render(
			<MemoryRouter>
				<PostRow post={mockPost} />
			</MemoryRouter>,
		);

		// Assert
		expect(screen.getAllByText("2026-04-28")).not.toHaveLength(0);
		expect(screen.getByText("Example Post")).toBeInTheDocument();
		expect(screen.getByText(/A short lede/)).toBeInTheDocument();
		expect(screen.getByText("solo")).toBeInTheDocument();
		expect(screen.getByText("ops")).toBeInTheDocument();
		expect(screen.getByText(/3\s*min/)).toBeInTheDocument();
	});

	it("행 컨테이너가 /blog/{slug}로 향하는 Link이다", () => {
		// Arrange / Act
		render(
			<MemoryRouter>
				<PostRow post={mockPost} />
			</MemoryRouter>,
		);

		// Assert
		const row = screen.getByTestId("post-row");
		expect(row.tagName).toBe("A");
		expect(row).toHaveAttribute("href", "/blog/example-post");
	});
});
