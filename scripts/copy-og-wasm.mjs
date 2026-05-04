#!/usr/bin/env node
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const copies = [
	{
		from: resolve(root, "node_modules/satori/yoga.wasm"),
		to: resolve(root, "public/wasm/yoga.wasm"),
	},
	{
		from: resolve(root, "node_modules/@resvg/resvg-wasm/index_bg.wasm"),
		to: resolve(root, "public/wasm/resvg.wasm"),
	},
];

await mkdir(resolve(root, "public/wasm"), { recursive: true });

for (const { from, to } of copies) {
	await copyFile(from, to);
	console.log(`[copy-og-wasm] ${from} → ${to}`);
}
