import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import LegalIndex, { loader } from "../legal._index";

// ---------------------------------------------------------------------------
// 테스트 헬퍼 — mock context 생성
// ---------------------------------------------------------------------------

const makeMockContext = (apps: string[]) => {
	const listApps = vi.fn().mockResolvedValue(apps);
	return {
		context: {
			container: {
				listApps,
				listProjects: vi.fn(),
				getProjectDetail: vi.fn(),
				getFeaturedProject: vi.fn(),
				listPosts: vi.fn(),
				getPostDetail: vi.fn(),
				getRecentPosts: vi.fn(),
				buildRssFeed: vi.fn(),
				findAppDoc: vi.fn(),
			},
			cloudflare: { env: {}, ctx: {} },
		},
		spies: { listApps },
	};
};

// ---------------------------------------------------------------------------
// Group A — Loader
// ---------------------------------------------------------------------------

describe("Group A — legal._index loader", () => {
	it("loader 가 context.container.listApps() 를 호출하고 결과를 {apps} 형태로 반환한다", async () => {
		// Arrange
		const { context, spies } = makeMockContext(["moai", "jagi"]);

		// Act
		const result = await loader({
			context,
			request: new Request("http://localhost/legal"),
		} as never);

		// Assert
		expect(result).toEqual({ apps: ["moai", "jagi"] });
		expect(spies.listApps).toHaveBeenCalledOnce();
	});

	it("listApps() 가 빈 배열이면 {apps: []} 반환", async () => {
		// Arrange
		const { context } = makeMockContext([]);

		// Act
		const result = await loader({
			context,
			request: new Request("http://localhost/legal"),
		} as never);

		// Assert
		expect(result).toEqual({ apps: [] });
	});
});

// ---------------------------------------------------------------------------
// Group B — 컴포넌트
// ---------------------------------------------------------------------------

describe("Group B — legal._index 컴포넌트", () => {
	it("loaderData.apps 길이만큼 AppCard 가 렌더된다", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/legal",
				Component: LegalIndex,
				loader: () => ({ apps: ["moai", "jagi"] }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/legal"]} />);

		// Assert
		expect(await screen.findByText(/moai/)).toBeInTheDocument();
		expect(screen.getByText(/jagi/)).toBeInTheDocument();
	});

	it("apps 가 빈 배열이면 empty state 가 노출된다", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/legal",
				Component: LegalIndex,
				loader: () => ({ apps: [] }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/legal"]} />);

		// Assert
		expect(await screen.findByText(/등록된 앱이 없/)).toBeInTheDocument();
	});
});
