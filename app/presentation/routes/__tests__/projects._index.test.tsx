import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { Project } from "../../../domain/project/project.entity";

import ProjectsIndex, { loader } from "../projects._index";

const mockProjects: Project[] = [
	{
		slug: "alpha",
		title: "Alpha Project",
		summary: "alpha summary",
		date: "2026-04-01",
		tags: ["web", "react"],
		stack: ["ts"],
		metrics: [],
	},
	{
		slug: "beta",
		title: "Beta Project",
		summary: "beta summary",
		date: "2026-03-01",
		tags: ["web", "node"],
		stack: ["ts", "node"],
		metrics: [],
	},
	{
		slug: "gamma",
		title: "Gamma Project",
		summary: "gamma summary",
		date: "2026-02-01",
		tags: ["cli"],
		stack: ["go"],
		metrics: [],
	},
];

const makeMockContext = (filtered: Project[] = mockProjects, all: Project[] = mockProjects) => {
	const listProjects = vi
		.fn()
		.mockImplementation((opts?: { tag?: string }) =>
			Promise.resolve(opts?.tag !== undefined ? filtered : all),
		);
	return {
		context: {
			container: {
				getFeaturedProject: vi.fn(),
				getRecentPosts: vi.fn(),
				listProjects,
				getProjectDetail: vi.fn(),
				listPosts: vi.fn(),
				getPostDetail: vi.fn(),
			},
			cloudflare: { env: {}, ctx: {} },
		},
		spies: { listProjects },
	};
};

// ---------------------------------------------------------------------------
// Group A — Loader
// ---------------------------------------------------------------------------

describe("Group A — projects._index loader", () => {
	it("?tag=foo → listProjects가 두 번 호출, 첫 호출 {tag:'foo'}, 두 번째 인자 없음", async () => {
		// Arrange
		const { context, spies } = makeMockContext([mockProjects[0]], mockProjects);

		// Act
		await loader({
			context,
			request: new Request("http://localhost/projects?tag=foo"),
		} as never);

		// Assert
		expect(spies.listProjects).toHaveBeenCalledTimes(2);
		expect(spies.listProjects).toHaveBeenNthCalledWith(1, { tag: "foo" });
		expect(spies.listProjects).toHaveBeenNthCalledWith(2);
	});

	it("반환 객체는 {projects, allTags(unique sorted), activeTag}", async () => {
		// Arrange
		const { context } = makeMockContext();

		// Act
		const result = await loader({
			context,
			request: new Request("http://localhost/projects?tag=web"),
		} as never);

		// Assert
		expect(result.activeTag).toBe("web");
		expect(result.allTags).toEqual(["cli", "node", "react", "web"]);
		expect(result.projects).toHaveLength(3);
	});

	it("tag 파라미터 없으면 activeTag는 null", async () => {
		// Arrange
		const { context } = makeMockContext();

		// Act
		const result = await loader({
			context,
			request: new Request("http://localhost/projects"),
		} as never);

		// Assert
		expect(result.activeTag).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// Group B — UI
// ---------------------------------------------------------------------------

describe("Group B — projects._index UI", () => {
	it("project-row가 mockProjects 길이만큼 렌더된다", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/projects",
				Component: ProjectsIndex,
				loader: () => ({ projects: mockProjects, allTags: ["a", "b"], activeTag: null }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/projects"]} />);

		// Assert
		await screen.findByText("Alpha Project");
		expect(screen.getAllByTestId("project-row")).toHaveLength(3);
	});

	it("allTags 길이만큼 칩이 렌더되고 activeTag 칩만 data-active=true", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/projects",
				Component: ProjectsIndex,
				loader: () => ({ projects: mockProjects, allTags: ["a", "b"], activeTag: "a" }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/projects?tag=a"]} />);

		// Assert
		await screen.findByText("Alpha Project");
		const chips = screen.getAllByTestId("tag-chip");
		expect(chips).toHaveLength(2);
		expect(screen.getByRole("button", { name: "a" })).toHaveAttribute("data-active", "true");
		expect(screen.getByRole("button", { name: "b" })).toHaveAttribute("data-active", "false");
	});

	it("빈 결과 + activeTag 'x' → empty-state + 'No matches.' 텍스트", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/projects",
				Component: ProjectsIndex,
				loader: () => ({ projects: [], allTags: ["a"], activeTag: "x" }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/projects?tag=x"]} />);

		// Assert
		await screen.findByTestId("empty-state");
		expect(screen.getByText(/No matches\./)).toBeInTheDocument();
	});

	it("페이지 헤더에 '$ ls -la projects/' 라인이 1번 노출", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/projects",
				Component: ProjectsIndex,
				loader: () => ({ projects: mockProjects, allTags: [], activeTag: null }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/projects"]} />);

		// Assert
		await screen.findByText("Alpha Project");
		expect(screen.getAllByText(/\$ ls -la projects\//)).toHaveLength(1);
	});
});
