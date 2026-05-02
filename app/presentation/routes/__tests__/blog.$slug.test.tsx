import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

// MdxRenderer를 모킹해 body 함수 평가 불안정성 회피
vi.mock("../../components/content/MdxRenderer", () => ({
	default: () => <div data-testid="mdx-content">[mdx body]</div>,
}));

// ---------------------------------------------------------------------------
// T014b RED — blog.$slug route (loader + UI)
// 현재 blog.$slug.tsx 는 placeholder 이므로 loader export 가 없음 → RED
// ---------------------------------------------------------------------------

import BlogDetail, { loader } from "../blog.$slug";

// ---------------------------------------------------------------------------
// Mock 데이터
// ---------------------------------------------------------------------------

type PostWithBody = {
	slug: string;
	title: string;
	lede: string;
	date: string;
	tags: string[];
	read: number;
	body?: string;
	toc?: { slug: string; text: string }[];
};

const POST_WITH_TOC: PostWithBody = {
	slug: "test-post",
	title: "Test Blog Post",
	lede: "A test lede sentence",
	date: "2026-05-02",
	tags: ["rr7", "cloudflare"],
	read: 5,
	body: "[stub-mdx-body]",
	toc: [
		{ slug: "intro", text: "Introduction" },
		{ slug: "conclusion", text: "Conclusion" },
	],
};

const POST_EMPTY_TOC: PostWithBody = {
	...POST_WITH_TOC,
	slug: "no-toc-post",
	toc: [],
};

// ---------------------------------------------------------------------------
// Mock context 팩토리
// ---------------------------------------------------------------------------

const makeMockContext = (
	detail: { post: PostWithBody; prev: PostWithBody | null; next: PostWithBody | null } = {
		post: POST_WITH_TOC,
		prev: null,
		next: null,
	},
) => {
	const getPostDetail = vi.fn().mockResolvedValue(detail);
	return {
		context: {
			container: {
				getFeaturedProject: vi.fn(),
				getRecentPosts: vi.fn(),
				listProjects: vi.fn(),
				getProjectDetail: vi.fn(),
				listPosts: vi.fn(),
				getPostDetail,
			},
			cloudflare: { env: {}, ctx: {} },
		},
		spies: { getPostDetail },
	};
};

// ---------------------------------------------------------------------------
// Group A — Loader
// ---------------------------------------------------------------------------

describe("Group A — blog.$slug loader", () => {
	it("loader 가 context.container.getPostDetail(params.slug) 를 호출한다", async () => {
		// Arrange
		const { context, spies } = makeMockContext();

		// Act
		const result = await loader({
			context,
			params: { slug: "test-post" },
			request: new Request("https://example.dev/blog/test-post"),
		} as never);

		// Assert
		expect(spies.getPostDetail.mock.calls[0][0]).toBe("test-post");
		// loader 결과에 canonicalUrl 이 포함되어야 한다
		expect((result as Record<string, unknown>).canonicalUrl).toBe(
			"https://example.dev/blog/test-post",
		);
	});

	it("params.slug 가 undefined 이면 Response 404 를 throw 한다", async () => {
		// Arrange
		const { context } = makeMockContext();

		// Act & Assert
		await expect(
			loader({
				context,
				params: {},
				request: new Request("https://example.dev/blog/"),
			} as never),
		).rejects.toBeInstanceOf(Response);
	});
});

// ---------------------------------------------------------------------------
// Group B — UI
// ---------------------------------------------------------------------------

describe("Group B — blog.$slug UI", () => {
	it("본문 + ShareTools + PostFooterNav 모두 마운트된다 (toc 비어있지 않을 때)", async () => {
		// Arrange
		const CANONICAL = "https://example.dev/blog/test-post";
		const Stub = createRoutesStub([
			{
				path: "/blog/:slug",
				Component: BlogDetail,
				loader: () => ({
					post: POST_WITH_TOC,
					prev: null,
					next: null,
					canonicalUrl: CANONICAL,
				}),
			},
		]);

		// Act
		render(<Stub initialEntries={["/blog/test-post"]} />);

		// Assert
		await screen.findByTestId("mdx-content");
		expect(screen.getByText(POST_WITH_TOC.title)).toBeInTheDocument();
		// ShareTools — X 공유 링크
		expect(screen.getByRole("link", { name: /share on x/i })).toBeInTheDocument();
		// PostFooterNav — '모든 글' 링크
		expect(screen.getByText("[모든 글]")).toBeInTheDocument();
	});

	it("toc 가 비어있을 때 OnThisPageToc 가 미렌더된다", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/blog/:slug",
				Component: BlogDetail,
				loader: () => ({
					post: POST_EMPTY_TOC,
					prev: null,
					next: null,
					canonicalUrl: "https://example.dev/blog/no-toc-post",
				}),
			},
		]);

		// Act
		render(<Stub initialEntries={["/blog/no-toc-post"]} />);

		// Assert
		await screen.findByTestId("mdx-content");
		expect(screen.queryByTestId("on-this-page-toc")).toBeNull();
	});
});
