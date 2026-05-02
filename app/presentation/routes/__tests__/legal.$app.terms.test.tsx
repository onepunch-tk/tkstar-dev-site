import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { AppLegalDoc } from "../../../domain/legal/app-legal-doc.entity";

// MdxRenderer를 모킹해 body 함수 평가 불안정성 회피 (projects.$slug 패턴)
vi.mock("../../components/content/MdxRenderer", () => ({
	default: () => <div data-testid="mdx-content">[mdx body]</div>,
}));

import AppTerms, { loader } from "../legal.$app.terms";

// ---------------------------------------------------------------------------
// Mock 데이터
// ---------------------------------------------------------------------------

const moaiTerms: AppLegalDoc = {
	app_slug: "moai",
	doc_type: "terms",
	version: "1.0.0",
	effective_date: "2026-04-28",
	body: "## moai terms",
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
			cloudflare: { env: {}, ctx: {} },
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
		expect(result).toEqual({ doc: moaiTerms });
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
	it("LegalDocLayout 안에 MdxRenderer 가 렌더된다 (title/version/effectiveDate 노출)", async () => {
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
		expect(screen.getByText(/2026-04-28/)).toBeInTheDocument();
		expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
	});
});
