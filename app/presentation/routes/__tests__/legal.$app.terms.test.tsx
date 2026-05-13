import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { AppLegalDoc } from "../../../domain/legal/app-legal-doc.entity";

// ---------------------------------------------------------------------------
// 공통 상수
// ---------------------------------------------------------------------------

const SITE_ORIGIN = "https://tkstar.dev";

// build-time MDX 모듈 맵을 mock — 실제 콘텐츠 파일과 무관하게 testid 매칭 컴포넌트 반환
vi.mock("../../components/content/mdx-modules", () => ({
	legalTermsModules: new Proxy(
		{},
		{
			get: () => ({
				default: () => <div data-testid="mdx-content">[mdx body]</div>,
			}),
		},
	),
}));

import AppTerms, { loader } from "../legal.$app.terms";

// ---------------------------------------------------------------------------
// Mock 데이터
// ---------------------------------------------------------------------------

const moaiTerms: AppLegalDoc = {
	app_slug: "moai",
	doc_type: "terms",
	version: "1.0.0",
	effective_date: "2026-04-28T00:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Mock context 팩토리
// ---------------------------------------------------------------------------

const makeMockContext = (doc: AppLegalDoc | null) => {
	const findAppDoc = vi.fn().mockResolvedValue(doc);
	return {
		context: {
			container: {
				findAppDoc,
				listApps: vi.fn(),
				listProjects: vi.fn(),
				getProjectDetail: vi.fn(),
				getFeaturedProject: vi.fn(),
				listPosts: vi.fn(),
				getPostDetail: vi.fn(),
				getRecentPosts: vi.fn(),
				buildRssFeed: vi.fn(),
			},
			cloudflare: {
				env: { SITE_LAUNCHED: "true", SITE_ORIGIN },
				ctx: {},
			},
		},
		spies: { findAppDoc },
	};
};

// ---------------------------------------------------------------------------
// Group A — Loader
// ---------------------------------------------------------------------------

describe("Group A — legal.$app.terms loader", () => {
	it("loader 가 context.container.findAppDoc(params.app, 'terms') 를 호출하고 { doc } 를 반환한다", async () => {
		// Arrange
		const { context, spies } = makeMockContext(moaiTerms);

		// Act
		const result = await loader({
			context,
			params: { app: "moai" },
			request: new Request("http://localhost/legal/moai/terms"),
		} as never);

		// Assert
		expect(spies.findAppDoc).toHaveBeenCalledWith("moai", "terms");
		expect(result).toMatchObject({ doc: moaiTerms });
	});

	it("params.app 이 미정의이면 Response 404 를 throw 한다", async () => {
		// Arrange
		const { context } = makeMockContext(moaiTerms);

		// Act & Assert
		await expect(
			loader({
				context,
				params: {},
				request: new Request("http://localhost/legal//terms"),
			} as never),
		).rejects.toBeInstanceOf(Response);
	});

	it("findAppDoc 결과가 null 이면 Response 404 를 throw 한다", async () => {
		// Arrange
		const { context } = makeMockContext(null);

		// Act & Assert
		await expect(
			loader({
				context,
				params: { app: "unknown" },
				request: new Request("http://localhost/legal/unknown/terms"),
			} as never),
		).rejects.toBeInstanceOf(Response);
	});
});

// ---------------------------------------------------------------------------
// Group B — 컴포넌트
// ---------------------------------------------------------------------------

describe("Group B — legal.$app.terms 컴포넌트", () => {
	it("LegalDocLayout 안에 MDX content 가 렌더된다 (title/version/effectiveDate 노출)", async () => {
		// Arrange
		const Stub = createRoutesStub([
			{
				path: "/legal/:app/terms",
				Component: AppTerms,
				loader: () => ({ doc: moaiTerms }),
			},
		]);

		// Act
		render(<Stub initialEntries={["/legal/moai/terms"]} />);

		// Assert
		expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
		expect(screen.getByText(/moai/i)).toBeInTheDocument();
		expect(screen.getByText(/1\.0\.0/)).toBeInTheDocument();
		expect(screen.getByText("시행 2026-04-28")).toBeInTheDocument();
		expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
	});
});

// ---------------------------------------------------------------------------
// Group C — env.SITE_ORIGIN 기반 origin 고정 (Launch Gate)
// ---------------------------------------------------------------------------

describe("Group C — env.SITE_ORIGIN 기반 origin 고정", () => {
	it("env.SITE_ORIGIN 을 canonical origin 으로 사용 — request.url 의 호스트와 무관", async () => {
		// Arrange
		const { context } = makeMockContext(moaiTerms);

		// Act — 다른 호스트로 요청
		const result = await loader({
			context,
			params: { app: "moai" },
			request: new Request("https://www.tkstar.dev/legal/moai/terms"),
		} as never);

		// Assert
		expect((result as Record<string, unknown>).origin).toBe(SITE_ORIGIN);
		expect((result as Record<string, unknown>).canonicalUrl).toBe(
			`${SITE_ORIGIN}/legal/moai/terms`,
		);
	});
});
