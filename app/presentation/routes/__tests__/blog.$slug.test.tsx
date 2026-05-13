import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

// build-time MDX 모듈 맵을 mock — 실제 콘텐츠 파일과 무관하게 testid 매칭 컴포넌트 반환
vi.mock("../../components/content/mdx-modules", () => ({
	postModules: new Proxy(
		{},
		{
			get: () => ({
				default: () => <div data-testid="mdx-content">[mdx body]</div>,
			}),
		},
	),
}));

// ---------------------------------------------------------------------------
// T014b RED — blog.$slug route (loader + UI)
// 현재 blog.$slug.tsx 는 placeholder 이므로 loader export 가 없음 → RED
// ---------------------------------------------------------------------------

import BlogDetail, { loader } from "../blog.$slug";

// ---------------------------------------------------------------------------
// 공통 상수
// ---------------------------------------------------------------------------

const SITE_ORIGIN = "https://tkstar.dev";

// ---------------------------------------------------------------------------
// Mock 데이터
// ---------------------------------------------------------------------------

type PostFixture = {
	slug: string;
	title: string;
	summary: string | null;
	datePublished: string | null;
	tags: string[];
	status: "draft" | "published";
	createdAt: number;
	updatedAt: number;
};

type DetailFixture = {
	post: PostFixture;
	toc: { slug: string; text: string }[];
	prev: PostFixture | null;
	next: PostFixture | null;
};

const POST_BASE: PostFixture = {
	slug: "test-post",
	title: "Test Blog Post",
	summary: "A test summary sentence",
	datePublished: "2026-05-02",
	tags: ["rr7", "cloudflare"],
	status: "published",
	createdAt: 1714291200,
	updatedAt: 1714291200,
};

const DETAIL_WITH_TOC: DetailFixture = {
	post: POST_BASE,
	toc: [
		{ slug: "intro", text: "Introduction" },
		{ slug: "conclusion", text: "Conclusion" },
	],
	prev: null,
	next: null,
};

const DETAIL_EMPTY_TOC: DetailFixture = {
	post: { ...POST_BASE, slug: "no-toc-post" },
	toc: [],
	prev: null,
	next: null,
};

// ---------------------------------------------------------------------------
// Mock context 팩토리
// ---------------------------------------------------------------------------

const makeMockContext = (detail: DetailFixture = DETAIL_WITH_TOC) => {
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
			cloudflare: {
				env: { SITE_LAUNCHED: "true", SITE_ORIGIN },
				ctx: {},
			},
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
		// loader 결과에 canonicalUrl 이 포함되어야 한다 (origin 은 env.SITE_ORIGIN 기반)
		expect((result as Record<string, unknown>).canonicalUrl).toBe(
			"https://tkstar.dev/blog/test-post",
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
					...DETAIL_WITH_TOC,
					canonicalUrl: CANONICAL,
				}),
			},
		]);

		// Act
		render(<Stub initialEntries={["/blog/test-post"]} />);

		// Assert
		await screen.findByTestId("mdx-content");
		expect(screen.getByText(DETAIL_WITH_TOC.post.title)).toBeInTheDocument();
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
					...DETAIL_EMPTY_TOC,
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

// ---------------------------------------------------------------------------
// Group C — env.SITE_ORIGIN 기반 origin 고정 (Launch Gate)
// ---------------------------------------------------------------------------

describe("Group C — env.SITE_ORIGIN 기반 origin 고정", () => {
	it("env.SITE_ORIGIN 을 canonical origin 으로 사용 — request.url 의 호스트와 무관", async () => {
		// Arrange
		const { context } = makeMockContext();

		// Act — 다른 호스트로 요청
		const result = await loader({
			context,
			params: { slug: "test-post" },
			request: new Request("https://www.tkstar.dev/blog/test-post"),
		} as never);

		// Assert
		expect((result as Record<string, unknown>).origin).toBe(SITE_ORIGIN);
		expect((result as Record<string, unknown>).canonicalUrl).toBe(`${SITE_ORIGIN}/blog/test-post`);
	});
});
