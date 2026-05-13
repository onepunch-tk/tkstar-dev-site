import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loader } from "../og.blog.$slug[.png]";

// ---------------------------------------------------------------------------
// 공통 상수
// ---------------------------------------------------------------------------

const SITE_ORIGIN = "https://tkstar.dev";

const fakePng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const fakeFallback = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0xff, 0xff]);

const makeContext = (overrides?: {
	renderBlogOg?: ReturnType<typeof vi.fn>;
	loadFallbackOg?: ReturnType<typeof vi.fn>;
}) => {
	const renderBlogOg = overrides?.renderBlogOg ?? vi.fn().mockResolvedValue(fakePng);
	const loadFallbackOg = overrides?.loadFallbackOg ?? vi.fn().mockResolvedValue(fakeFallback);
	return {
		context: {
			container: {
				renderBlogOg,
				loadFallbackOg,
			},
			cloudflare: {
				env: { SITE_LAUNCHED: "true", SITE_ORIGIN },
				ctx: {},
			},
		},
		spies: { renderBlogOg, loadFallbackOg },
	};
};

describe("og.blog.$slug loader", () => {
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});
	afterEach(() => {
		errorSpy.mockRestore();
	});

	it("정상 slug면 renderBlogOg 결과 PNG와 image/png + immutable cache 헤더로 응답한다 (AC-F011-1)", async () => {
		const { context, spies } = makeContext();

		const res = await loader({
			context,
			request: new Request("https://example.com/og/blog/first-post.png"),
			params: { slug: "first-post" },
		} as never);

		expect(spies.renderBlogOg).toHaveBeenCalledWith("first-post", SITE_ORIGIN);
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toMatch(/^image\/png/);
		expect(res.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
	});

	it("미존재 slug (service null)면 loadFallbackOg를 호출해 fallback PNG로 200 응답한다 (AC-F011-2)", async () => {
		const { context, spies } = makeContext({
			renderBlogOg: vi.fn().mockResolvedValue(null),
		});

		const res = await loader({
			context,
			request: new Request("https://example.com/og/blog/missing.png"),
			params: { slug: "missing" },
		} as never);

		expect(spies.loadFallbackOg).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(200);
	});

	it("renderer가 throw하면 catch 후 fallback PNG로 응답하고 console.error를 호출한다 (AC-F011-3)", async () => {
		const { context, spies } = makeContext({
			renderBlogOg: vi.fn().mockRejectedValue(new Error("satori boom")),
		});

		const res = await loader({
			context,
			request: new Request("https://example.com/og/blog/first-post.png"),
			params: { slug: "first-post" },
		} as never);

		expect(spies.loadFallbackOg).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(200);
		expect(errorSpy).toHaveBeenCalled();
	});

	it("env.SITE_ORIGIN 을 renderBlogOg 의 origin 인자로 사용 — request.url 의 호스트와 무관", async () => {
		// Arrange
		const { context, spies } = makeContext();

		// Act — 다른 호스트로 요청
		await loader({
			context,
			request: new Request("https://www.tkstar.dev/og/blog/first-post.png"),
			params: { slug: "first-post" },
		} as never);

		// Assert
		expect(spies.renderBlogOg).toHaveBeenCalledWith("first-post", SITE_ORIGIN);
	});
});
