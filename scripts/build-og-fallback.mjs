#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg, initWasm as initResvgWasm } from "@resvg/resvg-wasm";
import satori, { init as initSatori } from "satori/standalone";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const COLOR = {
	bg: "#0d0f12",
	fg: "#e8ebef",
	muted: "#8a93a0",
	line: "#2a3038",
	accent: "#36d399",
};

const ce = (tag, props, ...children) => ({
	type: tag,
	props: { ...(props ?? {}), children: children.length === 1 ? children[0] : children },
	key: null,
});

const fallbackTree = ce(
	"div",
	{
		style: {
			width: "1200px",
			height: "630px",
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between",
			padding: "72px",
			backgroundColor: COLOR.bg,
			color: COLOR.fg,
			fontFamily: "JetBrains Mono",
			borderTop: `8px solid ${COLOR.accent}`,
		},
	},
	ce(
		"div",
		{ style: { display: "flex", flexDirection: "column", gap: "32px" } },
		ce(
			"div",
			{
				style: {
					fontSize: "24px",
					fontWeight: 700,
					letterSpacing: "0.2em",
					color: COLOR.accent,
				},
			},
			"PREVIEW",
		),
		ce(
			"div",
			{
				style: {
					fontSize: "72px",
					fontWeight: 700,
					lineHeight: 1.1,
					letterSpacing: "-0.02em",
				},
			},
			"tkstar.dev",
		),
		ce(
			"div",
			{ style: { fontSize: "28px", color: COLOR.muted, lineHeight: 1.3 } },
			"preview unavailable",
		),
	),
	ce(
		"div",
		{
			style: {
				display: "flex",
				justifyContent: "space-between",
				alignItems: "flex-end",
				borderTop: `1px solid ${COLOR.line}`,
				paddingTop: "32px",
				color: COLOR.muted,
				fontSize: "24px",
			},
		},
		ce("span", null, "1인 기업 · PM · 풀스택"),
		ce("span", { style: { color: COLOR.fg, fontWeight: 700 } }, "tkstar.dev →"),
	),
);

const [regular, bold, yogaWasm, resvgWasm] = await Promise.all([
	readFile(resolve(root, "public/fonts/JetBrainsMono-Regular.ttf")),
	readFile(resolve(root, "public/fonts/JetBrainsMono-Bold.ttf")),
	readFile(resolve(root, "public/wasm/yoga.wasm")),
	readFile(resolve(root, "public/wasm/resvg.wasm")),
]);

await initSatori(yogaWasm);
await initResvgWasm(resvgWasm);

const svg = await satori(fallbackTree, {
	width: 1200,
	height: 630,
	fonts: [
		{ name: "JetBrains Mono", data: regular, weight: 400, style: "normal" },
		{ name: "JetBrains Mono", data: bold, weight: 700, style: "normal" },
	],
});

const png = new Resvg(svg, {
	background: COLOR.bg,
	font: { loadSystemFonts: false },
})
	.render()
	.asPng();

const outPath = resolve(root, "public/og/fallback.png");
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, png);
console.log(`[build-og-fallback] wrote ${outPath} (${png.length} bytes)`);
