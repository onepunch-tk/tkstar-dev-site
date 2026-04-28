#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const ROADMAP = join(ROOT, "docs/ROADMAP.md");
const TASKS_DIR = join(ROOT, "docs/tasks");

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
