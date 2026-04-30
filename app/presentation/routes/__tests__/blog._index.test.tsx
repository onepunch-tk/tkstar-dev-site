import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { Post } from "../../../domain/post/post.entity";

import BlogIndex, { loader } from "../blog._index";

const mockPosts: Post[] = [
	{
		slug: "alpha",
		title: "Alpha Post",
		lede: "alpha lede",
		date: "2026-04-28",
		tags: ["solo", "ops"],
		read: 3,
	},
	{
		slug: "beta",
		title: "Beta Post",
		lede: "beta lede",
		date: "2026-04-20",
		tags: ["solo"],
		read: 5,
	},
	{
		slug: "gamma",
		title: "Gamma Post",
		lede: "gamma lede",
		date: "2026-04-10",
		tags: ["ops"],
		read: 2,
	},
];

const makeMockContext = (filtered: Post[] = mockPosts, all: Post[] = mockPosts) => {
	const listPosts = vi
		.fn()
		.mockImplementation((opts?: { tag?: string }) =>
			Promise.resolve(opts?.tag !== undefined ? filtered : all),
		);
	return {
		context: {
			container: {
				listProjects: vi.fn(),
				getProjectDetail: vi.fn(),
				getFeaturedProject: vi.fn(),
				listPosts,
				getPostDetail: vi.fn(),
				getRecentPosts: vi.fn(),
				buildRssFeed: vi.fn(),
			},
			cloudflare: { env: {}, ctx: {} },
		},
		spies: { listPosts },
	};
};

// ---------------------------------------------------------------------------
// Group A — Loader
// ---------------------------------------------------------------------------

describe("Group A — blog._index loader", () => {
	it("?tag=foo → listPosts가 두 번 호출, 첫 호출 {tag:'foo'}, 두 번째 인자 없음", async () => {
		// Arrange
		const { context, spies } = makeMockContext([mockPosts[0]], mockPosts);

		// Act
		await loader({
			context,
			request: new Request("http://localhost/blog?tag=foo"),
		} as never);

		// Assert
		expect(spies.listPosts).toHaveBeenCalledTimes(2);
		expect(spies.listPosts).toHaveBeenNthCalledWith(1, { tag: "foo" });
		expect(spies.listPosts).toHaveBeenNthCalledWith(2);
	});

	it("반환 객체는 {posts, allTags(unique sorted), activeTag}", async () => {
		// Arrange
		const { context } = makeMockContext();

		// Act
		const result = await loader({
			context,
			request: new Request("http://localhost/blog?tag=solo"),
		} as never);

		// Assert
		expect(result.activeTag).toBe("solo");
		expect(result.allTags).toEqual(["ops", "solo"]);
		expect(result.posts).toHaveLength(3);
	});

	it("tag 파라미터 없으면 activeTag는 null", async () => {
		// Arrange
		const { context } = makeMockContext();

		// Act
		const result = await loader({
			context,
			request: new Request("http://localhost/blog"),
		} as never);

		// Assert
		expect(result.activeTag).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// Group B — UI
// ---------------------------------------------------------------------------

describe("Group B — blog._index UI", () => {
	it("post-row가 mockPosts 길이만큼 렌더된다", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/blog",
				Component: BlogIndex,
				loader: () => ({ posts: mockPosts, allTags: ["a", "b"], activeTag: null }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/blog"]} />);

		// Assert
		await screen.findByText("Alpha Post");
		expect(screen.getAllByTestId("post-row")).toHaveLength(3);
	});

	it("빈 결과 + activeTag 'x' → empty-state + 'No matches.' 텍스트", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/blog",
				Component: BlogIndex,
				loader: () => ({ posts: [], allTags: ["a"], activeTag: "x" }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/blog?tag=x"]} />);

		// Assert
		await screen.findByTestId("empty-state");
		expect(screen.getByText(/No matches\./)).toBeInTheDocument();
	});

	it("페이지 헤더에 '$ ls -la blog/' 라인이 1번 노출", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/blog",
				Component: BlogIndex,
				loader: () => ({ posts: mockPosts, allTags: [], activeTag: null }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/blog"]} />);

		// Assert
		await screen.findByText("Alpha Post");
		const headers = screen
			.getAllByRole("heading", { level: 1 })
			.filter((el) => /\$\s*ls -la blog\//.test(el.textContent ?? ""));
		expect(headers).toHaveLength(1);
	});
});
