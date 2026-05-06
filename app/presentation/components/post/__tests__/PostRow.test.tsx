import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Post } from "../../../../domain/post/post.entity";

import PostRow from "../PostRow";

const mockPost: Post = {
	slug: "example-post",
	title: "Example Post",
	summary: "A short summary of the post.",
	datePublished: "2026-04-28",
	tags: ["solo", "ops"],
	status: "published",
	createdAt: 1714291200,
	updatedAt: 1714291200,
};

describe("PostRow", () => {
	it("datePublished, title, summary, tags, updated relative 필드를 모두 렌더한다", () => {
		render(
			<MemoryRouter>
				<PostRow post={mockPost} />
			</MemoryRouter>,
		);

		expect(screen.getAllByText("2026-04-28")).not.toHaveLength(0);
		expect(screen.getByText("Example Post")).toBeInTheDocument();
		expect(screen.getByText(/A short summary/)).toBeInTheDocument();
		expect(screen.getByText("solo")).toBeInTheDocument();
		expect(screen.getByText("ops")).toBeInTheDocument();
		expect(
			screen.getByText(/ago|just now|y ago|mo ago|w ago|d ago|h ago|m ago/),
		).toBeInTheDocument();
	});

	it("행 컨테이너가 /blog/{slug}로 향하는 Link이다", () => {
		render(
			<MemoryRouter>
				<PostRow post={mockPost} />
			</MemoryRouter>,
		);

		const row = screen.getByTestId("post-row");
		expect(row.tagName).toBe("A");
		expect(row).toHaveAttribute("href", "/blog/example-post");
	});
});
