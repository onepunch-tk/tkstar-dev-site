import { describe, expect, it, vi } from "vitest";

// root.tsx 에 loader 가 없으므로 loader 는 undefined — Red phase 정상
import { loader } from "../root";

// ---------------------------------------------------------------------------
// Mock context 팩토리
// ---------------------------------------------------------------------------

const makeMockContext = (apps: string[]) => {
	const listApps = vi.fn().mockResolvedValue(apps);
	return {
		context: {
			container: {
				listApps,
				// root loader 는 listApps 만 사용 — 나머지는 vi.fn() 으로 채움
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
// root loader
// ---------------------------------------------------------------------------

describe("root loader", () => {
	it("context.container.listApps() 길이를 appCount 로 반환한다", async () => {
		// Arrange
		const { context } = makeMockContext(["moai", "jagi"]);

		// Act
		const result = await loader({
			context,
			params: {},
			request: new Request("http://localhost/"),
		} as never);

		// Assert
		expect(result).toEqual({ appCount: 2 });
	});

	it("listApps() 가 빈 배열이면 appCount: 0", async () => {
		// Arrange
		const { context } = makeMockContext([]);

		// Act
		const result = await loader({
			context,
			params: {},
			request: new Request("http://localhost/"),
		} as never);

		// Assert
		expect(result).toEqual({ appCount: 0 });
	});
});
