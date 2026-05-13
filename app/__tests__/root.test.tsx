import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return {
		...actual,
		useRouteLoaderData: vi.fn(),
		Meta: () => null,
		Links: () => null,
		ScrollRestoration: () => null,
		Scripts: () => null,
	};
});

import { useRouteLoaderData } from "react-router";
// root.tsx 에 loader 가 없으므로 loader 는 undefined — Red phase 정상
import { Layout, loader } from "../root";

// ---------------------------------------------------------------------------
// Mock context 팩토리
// ---------------------------------------------------------------------------

const makeMockContext = (
	apps: string[],
	env: Record<string, string> = { SITE_LAUNCHED: "false", SITE_ORIGIN: "https://tkstar.dev" },
) => {
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
			cloudflare: { env, ctx: {} },
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

		// Assert — appCount 외 신규 키는 빈 문자열 default
		expect(result).toEqual({
			appCount: 2,
			googleVerification: "",
			naverVerification: "",
			analyticsToken: "",
			siteLaunched: false,
			siteOrigin: "https://tkstar.dev",
		});
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
		expect(result).toEqual({
			appCount: 0,
			googleVerification: "",
			naverVerification: "",
			analyticsToken: "",
			siteLaunched: false,
			siteOrigin: "https://tkstar.dev",
		});
	});

	it("env 의 GOOGLE_SITE_VERIFICATION / NAVER_SITE_VERIFICATION / CLOUDFLARE_ANALYTICS_TOKEN 을 forward한다", async () => {
		// Arrange
		const { context } = makeMockContext([], {
			GOOGLE_SITE_VERIFICATION: "google-abc",
			NAVER_SITE_VERIFICATION: "naver-xyz",
			CLOUDFLARE_ANALYTICS_TOKEN: "cf-token-123",
			SITE_LAUNCHED: "true",
			SITE_ORIGIN: "https://example.com",
		});

		// Act
		const result = await loader({
			context,
			params: {},
			request: new Request("http://localhost/"),
		} as never);

		// Assert
		expect(result).toEqual({
			appCount: 0,
			googleVerification: "google-abc",
			naverVerification: "naver-xyz",
			analyticsToken: "cf-token-123",
			siteLaunched: true,
			siteOrigin: "https://example.com",
		});
	});

	it("env.SITE_LAUNCHED='true' 시 siteLaunched=true 반환", async () => {
		// Arrange
		const { context } = makeMockContext([], {
			SITE_LAUNCHED: "true",
			SITE_ORIGIN: "https://tkstar.dev",
		});

		// Act
		const result = await loader({
			context,
			params: {},
			request: new Request("http://localhost/"),
		} as never);

		// Assert
		expect(result).toMatchObject({ siteLaunched: true, siteOrigin: "https://tkstar.dev" });
	});
});

// ---------------------------------------------------------------------------
// Layout — verification meta + analytics script 조건부 렌더
// ---------------------------------------------------------------------------

const useRouteLoaderDataMock = vi.mocked(useRouteLoaderData);

describe("Layout — verification meta / analytics script 조건부 렌더", () => {
	beforeEach(() => {
		useRouteLoaderDataMock.mockReset();
	});

	it("3-key truthy → google/naver meta + cloudflare beacon script 모두 렌더", () => {
		useRouteLoaderDataMock.mockReturnValue({
			appCount: 0,
			googleVerification: "google-abc",
			naverVerification: "naver-xyz",
			analyticsToken: "cf-token-123",
			siteLaunched: true,
			siteOrigin: "https://tkstar.dev",
		});

		render(
			<Layout>
				<div data-testid="children" />
			</Layout>,
		);

		expect(
			document.querySelector('meta[name="google-site-verification"]')?.getAttribute("content"),
		).toBe("google-abc");
		expect(
			document.querySelector('meta[name="naver-site-verification"]')?.getAttribute("content"),
		).toBe("naver-xyz");
		const beacon = document.querySelector(
			'script[src="https://static.cloudflareinsights.com/beacon.min.js"]',
		);
		expect(beacon).not.toBeNull();
		expect(beacon?.getAttribute("data-cf-beacon")).toBe('{"token":"cf-token-123"}');
	});

	it("3-key 빈 문자열 → meta / beacon script 미렌더", () => {
		useRouteLoaderDataMock.mockReturnValue({
			appCount: 0,
			googleVerification: "",
			naverVerification: "",
			analyticsToken: "",
			siteLaunched: false,
			siteOrigin: "https://tkstar.dev",
		});

		render(
			<Layout>
				<div data-testid="children" />
			</Layout>,
		);

		expect(document.querySelector('meta[name="google-site-verification"]')).toBeNull();
		expect(document.querySelector('meta[name="naver-site-verification"]')).toBeNull();
		expect(
			document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]'),
		).toBeNull();
	});

	it("useRouteLoaderData undefined (ErrorBoundary 케이스) → meta / beacon 미렌더, 크래시 X", () => {
		useRouteLoaderDataMock.mockReturnValue(undefined);

		render(
			<Layout>
				<div data-testid="children" />
			</Layout>,
		);

		expect(document.querySelector('meta[name="google-site-verification"]')).toBeNull();
		expect(document.querySelector('meta[name="naver-site-verification"]')).toBeNull();
		expect(
			document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]'),
		).toBeNull();
	});

	it("일부만 truthy (google 만 설정) → google meta 만 렌더, 나머지 미렌더 — 점진 롤아웃 회귀 가드", () => {
		useRouteLoaderDataMock.mockReturnValue({
			appCount: 0,
			googleVerification: "google-only",
			naverVerification: "",
			analyticsToken: "",
			siteLaunched: true,
			siteOrigin: "https://tkstar.dev",
		});

		render(
			<Layout>
				<div data-testid="children" />
			</Layout>,
		);

		expect(
			document.querySelector('meta[name="google-site-verification"]')?.getAttribute("content"),
		).toBe("google-only");
		expect(document.querySelector('meta[name="naver-site-verification"]')).toBeNull();
		expect(
			document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]'),
		).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// Layout — robots noindex meta
// ---------------------------------------------------------------------------

describe("Layout — robots noindex meta", () => {
	beforeEach(() => {
		useRouteLoaderDataMock.mockReset();
	});

	it("siteLaunched: false → noindex,nofollow meta 렌더", () => {
		// Arrange
		useRouteLoaderDataMock.mockReturnValue({
			appCount: 0,
			googleVerification: "",
			naverVerification: "",
			analyticsToken: "",
			siteLaunched: false,
			siteOrigin: "https://tkstar.dev",
		});

		// Act
		render(
			<Layout>
				<div data-testid="children" />
			</Layout>,
		);

		// Assert
		expect(
			document.querySelector('meta[name="robots"][content="noindex,nofollow"]'),
		).not.toBeNull();
	});

	it("siteLaunched: true → noindex meta 미렌더", () => {
		// Arrange
		useRouteLoaderDataMock.mockReturnValue({
			appCount: 0,
			googleVerification: "",
			naverVerification: "",
			analyticsToken: "",
			siteLaunched: true,
			siteOrigin: "https://tkstar.dev",
		});

		// Act
		render(
			<Layout>
				<div data-testid="children" />
			</Layout>,
		);

		// Assert
		expect(document.querySelector('meta[name="robots"][content="noindex,nofollow"]')).toBeNull();
	});

	it("useRouteLoaderData undefined (ErrorBoundary 케이스) → 런치 상태 미확인 시 방어적 noindex 렌더 (defense-in-depth: unknown launch state → noindex)", () => {
		// Arrange
		useRouteLoaderDataMock.mockReturnValue(undefined);

		// Act
		render(
			<Layout>
				<div data-testid="children" />
			</Layout>,
		);

		// Assert
		expect(
			document.querySelector('meta[name="robots"][content="noindex,nofollow"]'),
		).not.toBeNull();
	});
});
