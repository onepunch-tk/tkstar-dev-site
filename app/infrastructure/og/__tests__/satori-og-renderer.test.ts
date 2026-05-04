import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const satoriMock = vi.fn();
const initSatoriMock = vi.fn();
const initResvgWasmMock = vi.fn();
const resvgRenderMock = vi.fn();
const ResvgMock = vi.fn();

vi.mock("satori/standalone", () => ({
	default: satoriMock,
	init: initSatoriMock,
}));
vi.mock("@resvg/resvg-wasm", () => ({
	Resvg: ResvgMock,
	initWasm: initResvgWasmMock,
}));

const fakePng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const buildAssetsFetcher = () => {
	return {
		fetch: vi.fn(async (url: string) => {
			const buf = new Uint8Array([0xaa, 0xbb]).buffer;
			return new Response(buf, {
				headers: {
					"x-asset-url": url,
					"content-type": url.endsWith(".wasm") ? "application/wasm" : "font/ttf",
				},
			});
		}),
	};
};

describe("createSatoriOgRenderer", () => {
	beforeEach(async () => {
		vi.resetModules();
		satoriMock.mockReset().mockResolvedValue("<svg>ok</svg>");
		initSatoriMock.mockReset().mockResolvedValue(undefined);
		initResvgWasmMock.mockReset().mockResolvedValue(undefined);
		// biome-ignore lint/complexity/useArrowFunction: Resvg is invoked with `new`; arrow fns lack [[Construct]]
		ResvgMock.mockReset().mockImplementation(function () {
			return { render: resvgRenderMock };
		});
		resvgRenderMock.mockReset().mockReturnValue({ asPng: () => fakePng });
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("project kind 호출 시 4개 asset (ttf 2 + yoga.wasm + resvg.wasm)을 env.ASSETS에서 fetch한 뒤 satori → Resvg 파이프라인으로 PNG 바이트를 반환한다", async () => {
		const { createSatoriOgRenderer } = await import("../satori-og-renderer");
		const assets = buildAssetsFetcher();
		const renderer = createSatoriOgRenderer({ ASSETS: assets as unknown as Fetcher });

		const out = await renderer.render({
			kind: "project",
			title: "Demo Project",
			date: "2026-04-25T00:00:00.000Z",
			tags: ["frontend", "react"],
		});

		const fetchedUrls = assets.fetch.mock.calls.map((c) => String(c[0]));
		expect(fetchedUrls).toEqual(
			expect.arrayContaining([
				expect.stringContaining("/fonts/JetBrainsMono-Regular.ttf"),
				expect.stringContaining("/fonts/JetBrainsMono-Bold.ttf"),
				expect.stringContaining("/wasm/yoga.wasm"),
				expect.stringContaining("/wasm/resvg.wasm"),
			]),
		);
		expect(initSatoriMock).toHaveBeenCalledTimes(1);
		expect(initResvgWasmMock).toHaveBeenCalledTimes(1);

		const [, satoriOpts] = satoriMock.mock.calls[0];
		expect(satoriOpts).toMatchObject({ width: 1200, height: 630 });
		const fontWeights = satoriOpts.fonts.map((f: { weight: number }) => f.weight).sort();
		expect(fontWeights).toEqual([400, 700]);

		expect(ResvgMock).toHaveBeenCalledWith("<svg>ok</svg>", expect.any(Object));
		expect(out).toBe(fakePng);
	});

	it("연속 호출 시 asset fetch 및 init 함수는 한 번만 실행된다 (factory 내부 캐시)", async () => {
		const { createSatoriOgRenderer } = await import("../satori-og-renderer");
		const assets = buildAssetsFetcher();
		const renderer = createSatoriOgRenderer({ ASSETS: assets as unknown as Fetcher });

		await renderer.render({ kind: "project", title: "A", date: "2026-04-25", tags: [] });
		await renderer.render({ kind: "post", title: "B", date: "2026-04-26", tags: ["x"] });

		expect(assets.fetch).toHaveBeenCalledTimes(4);
		expect(initSatoriMock).toHaveBeenCalledTimes(1);
		expect(initResvgWasmMock).toHaveBeenCalledTimes(1);
		expect(satoriMock).toHaveBeenCalledTimes(2);
	});

	it("post kind 호출 시에도 동일 PNG 파이프라인이 동작한다 (템플릿 dispatch)", async () => {
		const { createSatoriOgRenderer } = await import("../satori-og-renderer");
		const assets = buildAssetsFetcher();
		const renderer = createSatoriOgRenderer({ ASSETS: assets as unknown as Fetcher });

		const out = await renderer.render({
			kind: "post",
			title: "Post Demo",
			date: "2026-04-26T00:00:00.000Z",
			tags: ["typescript"],
		});

		expect(out).toBe(fakePng);
		expect(satoriMock).toHaveBeenCalledTimes(1);
	});

	it("asset fetch 실패 시 명시적으로 throw한다 (loader가 fallback 분기 가능)", async () => {
		const { createSatoriOgRenderer } = await import("../satori-og-renderer");
		const assets = {
			fetch: vi.fn(async (url: string) => {
				if (String(url).endsWith("yoga.wasm")) {
					return new Response("not found", { status: 404 });
				}
				return new Response(new Uint8Array([0]).buffer, { status: 200 });
			}),
		};
		const renderer = createSatoriOgRenderer({ ASSETS: assets as unknown as Fetcher });

		await expect(
			renderer.render({ kind: "project", title: "x", date: "2026", tags: [] }),
		).rejects.toThrow();
	});
});
