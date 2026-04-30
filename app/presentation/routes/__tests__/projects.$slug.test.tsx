import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { Project } from "../../../domain/project/project.entity";

// MdxRenderer를 모킹해 body 함수 평가 불안정성 회피
vi.mock("../../components/content/MdxRenderer", () => ({
	default: () => <div data-testid="mdx-content">[mdx body]</div>,
}));

import ProjectDetail, { loader } from "../projects.$slug";

// ---------------------------------------------------------------------------
// Mock 데이터
// ---------------------------------------------------------------------------

const PROJECT_WITH_TOC: Project = {
	slug: "alpha",
	title: "Alpha Project",
	summary: "alpha summary",
	date: "2026-04-28T00:00:00.000Z",
	tags: ["web"],
	stack: ["TypeScript", "React Router"],
	metrics: [],
	role: "Lead Engineer",
	body: "[stub-mdx-body]",
	toc: [
		{ slug: "problem", text: "Problem" },
		{ slug: "approach", text: "Approach" },
	],
};

const PROJECT_EMPTY_TOC: Project = {
	...PROJECT_WITH_TOC,
	slug: "beta",
	role: undefined,
	toc: [],
};

const PREV: Project = { ...PROJECT_WITH_TOC, slug: "prev", title: "Prev Project" };
const NEXT: Project = { ...PROJECT_WITH_TOC, slug: "next", title: "Next Project" };

// ---------------------------------------------------------------------------
// Mock context 팩토리
// ---------------------------------------------------------------------------

const makeMockContext = (
	detail: { project: Project; prev: Project | null; next: Project | null } = {
		project: PROJECT_WITH_TOC,
		prev: null,
		next: null,
	},
) => {
	const getProjectDetail = vi.fn().mockResolvedValue(detail);
	return {
		context: {
			container: {
				getFeaturedProject: vi.fn(),
				getRecentPosts: vi.fn(),
				listProjects: vi.fn(),
				getProjectDetail,
				listPosts: vi.fn(),
				getPostDetail: vi.fn(),
			},
			cloudflare: { env: {}, ctx: {} },
		},
		spies: { getProjectDetail },
	};
};

// ---------------------------------------------------------------------------
// Group A — Loader
// ---------------------------------------------------------------------------

describe("Group A — projects.$slug loader", () => {
	it("loader 가 context.container.getProjectDetail(params.slug) 를 호출한다", async () => {
		// Arrange
		const mockReturn = { project: PROJECT_WITH_TOC, prev: null, next: null };
		const { context, spies } = makeMockContext(mockReturn);

		// Act
		const result = await loader({
			context,
			params: { slug: "alpha" },
			request: new Request("http://localhost/projects/alpha"),
		} as never);

		// Assert
		expect(spies.getProjectDetail.mock.calls[0][0]).toBe("alpha");
		expect(result).toEqual(mockReturn);
	});

	it("params.slug 가 undefined 이면 throw 한다", async () => {
		// Arrange
		const { context } = makeMockContext();

		// Act & Assert
		await expect(
			loader({
				context,
				params: {},
				request: new Request("http://localhost/projects/"),
			} as never),
		).rejects.toBeInstanceOf(Response);
	});
});

// ---------------------------------------------------------------------------
// Group B — UI
// ---------------------------------------------------------------------------

describe("Group B — projects.$slug UI", () => {
	it("본문 + sidebar + footer 모두 마운트된다 (toc 비어있지 않을 때)", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/projects/:slug",
				Component: ProjectDetail,
				loader: () => ({
					project: PROJECT_WITH_TOC,
					prev: PREV,
					next: NEXT,
				}),
			},
		]);

		// Act
		render(<Stub initialEntries={["/projects/alpha"]} />);

		// Assert
		await screen.findByTestId("mdx-content");
		expect(screen.getByTestId("project-meta-sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("on-this-page-toc")).toBeInTheDocument();
		expect(screen.getByTestId("project-footer-nav")).toBeInTheDocument();
	});

	it("toc 가 비어있을 때 OnThisPageToc 가 미렌더된다", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/projects/:slug",
				Component: ProjectDetail,
				loader: () => ({
					project: PROJECT_EMPTY_TOC,
					prev: PREV,
					next: NEXT,
				}),
			},
		]);

		// Act
		render(<Stub initialEntries={["/projects/beta"]} />);

		// Assert
		await screen.findByTestId("mdx-content");
		expect(screen.queryByTestId("on-this-page-toc")).toBeNull();
		expect(screen.getByTestId("project-meta-sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("project-footer-nav")).toBeInTheDocument();
	});

	it("role 이 없을 때 sidebar 의 role 영역이 미렌더된다", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/projects/:slug",
				Component: ProjectDetail,
				loader: () => ({
					project: PROJECT_EMPTY_TOC,
					prev: null,
					next: null,
				}),
			},
		]);

		// Act
		render(<Stub initialEntries={["/projects/beta"]} />);

		// Assert
		await screen.findByTestId("mdx-content");
		expect(screen.queryByTestId("project-meta-role")).toBeNull();
		expect(screen.getByTestId("project-meta-sidebar")).toBeInTheDocument();
	});
});
