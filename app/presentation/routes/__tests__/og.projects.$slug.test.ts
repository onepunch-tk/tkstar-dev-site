import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loader } from "../og.projects.$slug[.png]";

const fakePng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const fakeFallback = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0xff, 0xff]);

const makeContext = (overrides?: {
	renderProjectOg?: ReturnType<typeof vi.fn>;
	loadFallbackOg?: ReturnType<typeof vi.fn>;
}) => {
	const renderProjectOg = overrides?.renderProjectOg ?? vi.fn().mockResolvedValue(fakePng);
	const loadFallbackOg = overrides?.loadFallbackOg ?? vi.fn().mockResolvedValue(fakeFallback);
	return {
		context: {
			container: {
				renderProjectOg,
				loadFallbackOg,
			},
			cloudflare: { env: {}, ctx: {} },
		},
		spies: { renderProjectOg, loadFallbackOg },
	};
};

describe("og.projects.$slug loader", () => {
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});
	afterEach(() => {
		errorSpy.mockRestore();
	});

	it("정상 slug면 renderProjectOg 결과 PNG와 image/png + immutable cache 헤더로 응답한다 (AC-F011-1)", async () => {
		const { context, spies } = makeContext();

		const res = await loader({
			context,
			request: new Request("https://example.com/og/projects/alpha.png"),
			params: { slug: "alpha" },
		} as never);

		expect(spies.renderProjectOg).toHaveBeenCalledWith("alpha", "https://example.com");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toMatch(/^image\/png/);
		expect(res.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
		const body = new Uint8Array(await res.arrayBuffer());
		expect(Array.from(body.slice(0, 8))).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
	});

	it("미존재 slug (service null)면 loadFallbackOg를 호출해 fallback PNG로 200 응답한다 (AC-F011-2)", async () => {
		const { context, spies } = makeContext({
			renderProjectOg: vi.fn().mockResolvedValue(null),
		});

		const res = await loader({
			context,
			request: new Request("https://example.com/og/projects/missing.png"),
			params: { slug: "missing" },
		} as never);

		expect(spies.renderProjectOg).toHaveBeenCalledWith("missing", "https://example.com");
		expect(spies.loadFallbackOg).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toMatch(/^image\/png/);
		const body = new Uint8Array(await res.arrayBuffer());
		expect(Array.from(body)).toEqual(Array.from(fakeFallback));
	});

	it("renderer가 throw하면 catch 후 fallback PNG로 응답하고 console.error를 호출한다 (AC-F011-3)", async () => {
		const { context, spies } = makeContext({
			renderProjectOg: vi.fn().mockRejectedValue(new Error("satori boom")),
		});

		const res = await loader({
			context,
			request: new Request("https://example.com/og/projects/alpha.png"),
			params: { slug: "alpha" },
		} as never);

		expect(spies.loadFallbackOg).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(200);
		expect(errorSpy).toHaveBeenCalled();
	});

	it("params.slug가 없으면 fallback PNG로 응답한다 (방어적 처리)", async () => {
		const { context, spies } = makeContext();

		const res = await loader({
			context,
			request: new Request("https://example.com/og/projects/.png"),
			params: {},
		} as never);

		expect(spies.renderProjectOg).not.toHaveBeenCalled();
		expect(spies.loadFallbackOg).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(200);
	});
});
