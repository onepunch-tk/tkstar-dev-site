import { Resvg, initWasm as initResvgWasm } from "@resvg/resvg-wasm";
// @ts-expect-error — vite + @cloudflare/vite-plugin resolves *.wasm to WebAssembly.Module
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import satori, { init as initSatori } from "satori/standalone";
// @ts-expect-error — same as above
import yogaWasm from "satori/yoga.wasm";
import type { OgImageRenderer, OgRenderInput } from "~/application/og/ports/og-image-renderer.port";
import { ogTemplate } from "./templates/og-template";

type AssetEnv = { ASSETS: Fetcher };

const fetchArrayBuffer = async (
	assets: Fetcher,
	origin: string,
	path: string,
): Promise<ArrayBuffer> => {
	const res = await assets.fetch(`${origin}${path}`);
	if (!res.ok) {
		throw new Error(`[og] asset fetch failed: ${path} (${res.status})`);
	}
	return res.arrayBuffer();
};

export const createSatoriOgRenderer = (env: AssetEnv): OgImageRenderer => {
	let initPromise: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | null = null;

	const ensureInit = (origin: string) => {
		if (initPromise) return initPromise;
		initPromise = (async () => {
			const [regular, bold] = await Promise.all([
				fetchArrayBuffer(env.ASSETS, origin, "/fonts/Pretendard-Regular.ttf"),
				fetchArrayBuffer(env.ASSETS, origin, "/fonts/Pretendard-Bold.ttf"),
			]);
			// satori/resvg init은 worker 전역 1회만 허용 — 두 번째 호출은 무시
			try {
				await initSatori(yogaWasm);
			} catch (err) {
				if (!String(err).includes("nitialized")) throw err;
			}
			try {
				await initResvgWasm(resvgWasm);
			} catch (err) {
				if (!String(err).includes("nitialized")) throw err;
			}
			return { regular, bold };
		})();
		return initPromise;
	};

	return {
		async render(input: OgRenderInput): Promise<Uint8Array> {
			const { regular, bold } = await ensureInit(input.origin);
			const tree = ogTemplate({
				label: input.kind === "project" ? "PROJECT" : "POST",
				title: input.title,
				date: input.date,
				tags: input.tags,
			});

			const svg = await satori(tree, {
				width: 1200,
				height: 630,
				fonts: [
					{ name: "Pretendard", data: regular, weight: 400, style: "normal" },
					{ name: "Pretendard", data: bold, weight: 700, style: "normal" },
				],
			});

			const resvg = new Resvg(svg, {
				background: "#0d0f12",
				font: { loadSystemFonts: false },
			});
			return resvg.render().asPng();
		},
	};
};
