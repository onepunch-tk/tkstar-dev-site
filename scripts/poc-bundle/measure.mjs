#!/usr/bin/env node
// T023 PoC — measure Workers SSR bundle size for each candidate.
// Rewrites scripts/poc-bundle/wrangler.poc.toml's `main` per candidate, runs
// `wrangler deploy --dry-run --outdir`, and sums raw + gzip sizes of emitted .js / .wasm files.
// Output: markdown table to stdout.

import { execSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const POC_DIR = __dirname;
const WRANGLER_TOML = join(POC_DIR, "wrangler.poc.toml");
const OUT_BASE = join(REPO_ROOT, "tmp-poc-out");

const CANDIDATES = [
  { id: "baseline",       entry: "./entries/baseline.ts" },
  { id: "mdx-marked",     entry: "./entries/mdx-marked.ts" },
  { id: "mdx-micromark",  entry: "./entries/mdx-micromark.ts" },
  { id: "mdx-mdxjs",      entry: "./entries/mdx-mdxjs.ts" },
  { id: "shiki",          entry: "./entries/shiki.ts" },
  { id: "jose",           entry: "./entries/jose.ts" },
  { id: "r2-aws4fetch",   entry: "./entries/r2-aws4fetch.ts" },
  { id: "r2-binding",     entry: "./entries/r2-binding.ts" },
  { id: "r2-aws-sdk",     entry: "./entries/r2-aws-sdk.ts" },
  { id: "drizzle-d1",     entry: "./entries/drizzle-d1.ts" },
];

const TOML_TEMPLATE = (entry) => `#:schema ../../node_modules/wrangler/config-schema.json
name = "tkstar-dev-poc"
compatibility_date = "2026-04-27"
compatibility_flags = ["nodejs_compat"]
main = "${entry}"
`;

function measureDir(dir) {
  let raw = 0;
  let gz = 0;
  const walk = (d) => {
    for (const ent of readdirSync(d)) {
      const p = join(d, ent);
      const s = statSync(p);
      if (s.isDirectory()) {
        walk(p);
        continue;
      }
      if (!/\.(js|mjs|cjs|wasm)$/.test(ent)) continue;
      const buf = readFileSync(p);
      raw += buf.length;
      gz += gzipSync(buf).length;
    }
  };
  walk(dir);
  return { raw, gz };
}

const fmt = (n) => (n / 1024).toFixed(2);

const results = [];
for (const c of CANDIDATES) {
  process.stderr.write(`\n[poc] measuring ${c.id} ... `);
  writeFileSync(WRANGLER_TOML, TOML_TEMPLATE(c.entry));
  const out = join(OUT_BASE, c.id);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  try {
    execSync(
      `bunx wrangler deploy --dry-run --config ${WRANGLER_TOML} --outdir ${out}`,
      { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "pipe"] },
    );
    const { raw, gz } = measureDir(out);
    results.push({ id: c.id, raw, gz });
    process.stderr.write(`raw=${fmt(raw)} KiB gzip=${fmt(gz)} KiB\n`);
  } catch (e) {
    results.push({ id: c.id, raw: -1, gz: -1, error: e.message ?? String(e) });
    process.stderr.write(`FAILED — ${e.message ?? String(e)}\n`);
  }
}

const baseline = results.find((r) => r.id === "baseline");
const baseRaw = baseline?.raw ?? 0;
const baseGz = baseline?.gz ?? 0;

console.log("");
console.log("| Candidate | raw (KiB) | gzip (KiB) | Δ raw | Δ gzip |");
console.log("|---|---|---|---|---|");
for (const r of results) {
  if (r.raw < 0) {
    console.log(`| ${r.id} | FAILED | FAILED | — | — | <!-- ${r.error} -->`);
    continue;
  }
  const dr = r.raw - baseRaw;
  const dg = r.gz - baseGz;
  console.log(
    `| ${r.id} | ${fmt(r.raw)} | ${fmt(r.gz)} | ${r.id === "baseline" ? "—" : (dr >= 0 ? "+" : "") + fmt(dr)} | ${r.id === "baseline" ? "—" : (dg >= 0 ? "+" : "") + fmt(dg)} |`,
  );
}
