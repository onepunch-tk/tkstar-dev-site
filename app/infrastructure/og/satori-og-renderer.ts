import { Resvg, initWasm as initResvgWasm } from "@resvg/resvg-wasm";
import satori, { init as initSatori } from "satori/standalone";
import type { OgImageRenderer, OgRenderInput } from "~/application/og/ports/og-image-renderer.port";
import { postTemplate } from "./templates/post";
import { projectTemplate } from "./templates/project";

const ASSET_BASE = "https://x.local";

type AssetEnv = { ASSETS: Fetcher };

const fetchArrayBuffer = async (assets: Fetcher, path: string): Promise<ArrayBuffer> => {
	const res = await assets.fetch(`${ASSET_BASE}${path}`);
	if (!res.ok) {
		throw new Error(`[og] asset fetch failed: ${path} (${res.status})`);
	}
	return res.arrayBuffer();
};

export const createSatoriOgRenderer = (env: AssetEnv): OgImageRenderer => {
	let initPromise: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | null = null;

	const ensureInit = () => {
		if (initPromise) return initPromise;
		initPromise = (async () => {
			const [regular, bold, yogaWasm, resvgWasm] = await Promise.all([
				fetchArrayBuffer(env.ASSETS, "/fonts/JetBrainsMono-Regular.ttf"),
				fetchArrayBuffer(env.ASSETS, "/fonts/JetBrainsMono-Bold.ttf"),
				fetchArrayBuffer(env.ASSETS, "/wasm/yoga.wasm"),
				fetchArrayBuffer(env.ASSETS, "/wasm/resvg.wasm"),
			]);
			await initSatori(yogaWasm);
			await initResvgWasm(resvgWasm);
			return { regular, bold };
		})();
		return initPromise;
	};

	return {
		async render(input: OgRenderInput): Promise<Uint8Array> {
			const { regular, bold } = await ensureInit();
			const tree = input.kind === "project" ? projectTemplate(input) : postTemplate(input);

			const svg = await satori(tree, {
				width: 1200,
				height: 630,
				fonts: [
					{ name: "JetBrains Mono", data: regular, weight: 400, style: "normal" },
					{ name: "JetBrains Mono", data: bold, weight: 700, style: "normal" },
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
