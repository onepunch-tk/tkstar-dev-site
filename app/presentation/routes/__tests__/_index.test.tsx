import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import type { Project } from "../../../domain/project/project.entity";
import type { Post } from "../../../domain/post/post.entity";
import IndexRoute, { loader } from "../_index";

// ---------------------------------------------------------------------------
// 테스트 픽스처
// ---------------------------------------------------------------------------

const mockFeatured: Project = {
	slug: "whiteboard-rt",
	title: "Realtime Whiteboard",
	summary: "다인원 실시간 화이트보드.",
	date: "2026-03-01",
	tags: ["b2c"],
	stack: ["ts", "react"],
	metrics: [],
	featured: true,
	cover: undefined,
};

const mockPosts: Post[] = [
	{ slug: "p1", title: "글 1", lede: "lede 1", date: "2026-04-01", tags: [], read: 5 },
	{ slug: "p2", title: "글 2", lede: "lede 2", date: "2026-03-20", tags: [], read: 8 },
	{ slug: "p3", title: "글 3", lede: "lede 3", date: "2026-03-05", tags: [], read: 12 },
];

// ---------------------------------------------------------------------------
// mock context 팩토리
// ---------------------------------------------------------------------------

const makeMockContext = (overrides: Partial<{ featured: Project | null; posts: Post[] }> = {}) => {
	const featured = overrides.featured !== undefined ? overrides.featured : mockFeatured;
	const posts = overrides.posts ?? mockPosts;
	const getFeaturedProject = vi.fn().mockResolvedValue(featured);
	const getRecentPosts = vi.fn().mockResolvedValue(posts);
	return {
		context: {
			container: {
				getFeaturedProject,
				getRecentPosts,
				listProjects: vi.fn(),
				getProjectDetail: vi.fn(),
				listPosts: vi.fn(),
				getPostDetail: vi.fn(),
			},
			cloudflare: { env: {}, ctx: {} },
		},
		spies: { getFeaturedProject, getRecentPosts },
	};
};

// ---------------------------------------------------------------------------
// Group A — Loader 행동 (loader 직접 호출)
// ---------------------------------------------------------------------------

describe("Group A — loader 행동", () => {
	it("getFeaturedProject 1회 호출 + getRecentPosts(3) 호출", async () => {
		// Arrange
		const { context, spies } = makeMockContext();

		// Act
		await loader({ context, request: new Request("http://localhost/") } as never);

		// Assert
		expect(spies.getFeaturedProject).toHaveBeenCalledTimes(1);
		expect(spies.getRecentPosts).toHaveBeenCalledTimes(1);
		expect(spies.getRecentPosts).toHaveBeenCalledWith(3);
	});

	it("반환 객체에 featured와 posts 키가 존재하고 posts 길이가 3", async () => {
		// Arrange
		const { context } = makeMockContext();

		// Act
		const result = await loader({
			context,
			request: new Request("http://localhost/"),
		} as never);

		// Assert
		expect(result).toHaveProperty("featured");
		expect(result).toHaveProperty("posts");
		expect(result.posts).toHaveLength(3);
	});

	it("featured가 null인 경우 null이 그대로 전파되고 posts는 유지", async () => {
		// Arrange
		const { context } = makeMockContext({ featured: null });

		// Act
		const result = await loader({
			context,
			request: new Request("http://localhost/"),
		} as never);

		// Assert
		expect(result.featured).toBeNull();
		expect(result.posts).toHaveLength(3);
	});
});

// ---------------------------------------------------------------------------
// Group B — UI 통합 (createRoutesStub 사용)
// ---------------------------------------------------------------------------

describe("Group B — UI 통합 렌더", () => {
	it("HeroWhoami 렌더 — h1에 'ship solo' 텍스트 포함", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/",
				Component: IndexRoute,
				loader: () => ({ featured: mockFeatured, posts: mockPosts }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/"]} />);

		// Assert
		await screen.findByRole("heading", { level: 1 });
		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/ship solo/i);
	});

	it("FeaturedProjectCard 렌더 — mockFeatured.title 노출", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/",
				Component: IndexRoute,
				loader: () => ({ featured: mockFeatured, posts: mockPosts }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/"]} />);

		// Assert
		await screen.findByText("Realtime Whiteboard");
		expect(screen.getByText("Realtime Whiteboard")).toBeInTheDocument();
	});

	it("RecentPostsList 렌더 — post-row 3개 노출", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/",
				Component: IndexRoute,
				loader: () => ({ featured: mockFeatured, posts: mockPosts }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/"]} />);

		// Assert
		await screen.findByText("글 1");
		expect(screen.getAllByTestId("post-row")).toHaveLength(3);
	});

	it("Hero → Featured → Recent 순서로 DOM에 배치", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/",
				Component: IndexRoute,
				loader: () => ({ featured: mockFeatured, posts: mockPosts }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/"]} />);
		await screen.findByRole("heading", { level: 1 });

		// Assert
		const hero = screen.getByRole("heading", { level: 1 });
		const featured = screen.getByText("Realtime Whiteboard");
		const recent = screen.getAllByTestId("post-row")[0];

		expect(hero.compareDocumentPosition(featured) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(
			featured.compareDocumentPosition(recent) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});
});

// ---------------------------------------------------------------------------
// Group C — Featured null conditional
// ---------------------------------------------------------------------------

describe("Group C — featured null conditional", () => {
	it("featured가 null일 때 FeaturedProjectCard 미렌더, posts는 유지", async () => {
		// Arrange
		const StubNullFeatured = createRoutesStub([
			{
				path: "/",
				Component: IndexRoute,
				loader: () => ({ featured: null, posts: mockPosts }),
			},
		]);

		// Act
		render(<StubNullFeatured initialEntries={["/"]} />);
		await screen.findByRole("heading", { level: 1 });

		// Assert — FeaturedProjectCard의 타이틀이 렌더되지 않아야 함
		expect(screen.queryByText("Realtime Whiteboard")).not.toBeInTheDocument();
		// posts는 여전히 렌더
		expect(screen.getAllByTestId("post-row")).toHaveLength(3);
	});
});
