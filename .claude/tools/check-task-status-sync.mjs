#!/usr/bin/env node
// Portable validator (harness-pipeline tool). Lives under .claude/tools/ and
// must work in any project that follows the harness ROADMAP/task convention.
//
// Project root: resolved via `git rev-parse --show-toplevel` so the script can
// be invoked from any cwd. Paths are overridable via env so projects with a
// non-default docs layout (e.g. documentation/, planning/) still work:
//   HARNESS_ROADMAP_PATH   default: docs/ROADMAP.md
//   HARNESS_TASKS_DIR      default: docs/tasks
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const detectRoot = () => {
	try {
		return execSync("git rev-parse --show-toplevel", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
	} catch {
		// Fallback: this file lives at <root>/.claude/tools/check-task-status-sync.mjs
		const here = fileURLToPath(new URL(".", import.meta.url));
		return join(here, "..", "..");
	}
};
const ROOT = detectRoot();
const resolvePath = (envVar, fallback) => {
	const v = process.env[envVar];
	if (!v) return join(ROOT, fallback);
	return isAbsolute(v) ? v : join(ROOT, v);
};
const ROADMAP = resolvePath("HARNESS_ROADMAP_PATH", "docs/ROADMAP.md");
const TASKS_DIR = resolvePath("HARNESS_TASKS_DIR", "docs/tasks");

if (!existsSync(ROADMAP) || !existsSync(TASKS_DIR)) {
	// Project does not use the harness ROADMAP convention — silent no-op
	// (keeps the docs-sync-gate hook backward-compatible).
	console.log(`[task-status-sync] skip — ROADMAP or tasks dir not found (ROADMAP=${ROADMAP})`);
	process.exit(0);
}

const DONE_PATTERNS = [/✅\s*Done/i, /^Done$/i, /^Completed$/i];

const isDoneStatus = (raw) => {
	const v = raw.replace(/\([^)]*\)/g, "").trim();
	return DONE_PATTERNS.some((re) => re.test(v));
};

const readRoadmapChecks = () => {
	const md = readFileSync(ROADMAP, "utf8");
	const result = new Map();
	const re = /^- \[(x| )\]\s+\*\*Task\s+(\d{3}[a-z]?):/gim;
	let m;
	while ((m = re.exec(md)) !== null) {
		const checked = m[1] === "x";
		const id = `T${m[2]}`;
		result.set(id, checked);
	}
	return result;
};

const readTaskStatuses = () => {
	const result = new Map();
	const files = readdirSync(TASKS_DIR).filter((f) => /^T\d{3}[a-z]?-.*\.md$/.test(f));
	for (const f of files) {
		const id = f.match(/^(T\d{3}[a-z]?)/)[1];
		const md = readFileSync(join(TASKS_DIR, f), "utf8");
		const m = md.match(/\|\s*\*\*Status\*\*\s*\|\s*([^|\n]+?)\s*\|/);
		if (!m) continue;
		result.set(id, { file: f, raw: m[1], done: isDoneStatus(m[1]) });
	}
	return result;
};

const main = () => {
	const roadmap = readRoadmapChecks();
	const tasks = readTaskStatuses();
	const drift = [];

	for (const [id, checked] of roadmap.entries()) {
		const t = tasks.get(id);
		if (!t) {
			drift.push(`  ${id}: ROADMAP에 [${checked ? "x" : " "}] 마킹되었으나 task 파일이 없음`);
			continue;
		}
		if (checked && !t.done) {
			drift.push(`  ${id} (${t.file}): ROADMAP=[x] 이지만 Status="${t.raw}" → ✅ Done 으로 동기화 필요`);
		}
		if (!checked && t.done) {
			drift.push(`  ${id} (${t.file}): ROADMAP=[ ] 이지만 Status="${t.raw}" (Done) → 한쪽이 stale`);
		}
	}

	if (drift.length > 0) {
		console.error("[task-status-sync] ROADMAP 체크 ↔ task 파일 Status 불일치:");
		for (const line of drift) console.error(line);
		console.error("");
		console.error("해결: ROADMAP `[x]`이면 task 파일 `**Status** | ✅ Done` 으로, 또는 그 반대로 정렬하세요.");
		process.exit(1);
	}

	console.log(`[task-status-sync] OK — ${roadmap.size} ROADMAP 항목 / ${tasks.size} task 파일 일치`);
};

main();
