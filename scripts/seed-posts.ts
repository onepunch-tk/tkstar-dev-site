/**
 * T028 — Post seed migration (D1 동작 검증용 일회성 시드)
 *
 * - `seedPosts(db, seeds)` : Drizzle ORM `onConflictDoUpdate` 로 멱등 upsert.
 *   test 에서 better-sqlite3 인메모리 fixture 로 동작 검증.
 * - `main()` : CLI 진입점. wrangler d1 execute 로 local/preview/production D1
 *   에 동일한 멱등 upsert SQL 을 적용. T032 (Admin Posts List) 머지 후 폐기 예정.
 *
 * MEMORY 워크어라운드: wrangler 4.85~4.87 의 `--file=` OAuth 회귀 회피를 위해
 * `--command="..."` 로 SQL 직접 전달.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { posts } from "../app/infrastructure/db/schema/posts";

export type PostSeed = {
	slug: string;
	title: string;
	summary: string | null;
	raw_markdown: string;
	tags: string[];
	date_published: string | null;
	status?: "draft" | "published";
};

export const seedPosts = async (
	db: BetterSQLite3Database<Record<string, never>>,
	seeds: PostSeed[],
	now: number = Math.floor(Date.now() / 1000),
): Promise<{ inserted: number }> => {
	if (seeds.length === 0) return { inserted: 0 };

	const rows = seeds.map((s) => ({
		slug: s.slug,
		title: s.title,
		summary: s.summary,
		raw_markdown: s.raw_markdown,
		tags: JSON.stringify(s.tags),
		date_published: s.date_published,
		status: s.status ?? "published",
		created_at: now,
		updated_at: now,
	}));

	await db
		.insert(posts)
		.values(rows)
		.onConflictDoUpdate({
			target: posts.slug,
			set: {
				title: sql`excluded.title`,
				summary: sql`excluded.summary`,
				raw_markdown: sql`excluded.raw_markdown`,
				tags: sql`excluded.tags`,
				date_published: sql`excluded.date_published`,
				status: sql`excluded.status`,
				updated_at: sql`excluded.updated_at`,
			},
		});

	return { inserted: seeds.length };
};

const HARDCODED_SEEDS: PostSeed[] = [
	{
		slug: "2026-04-shipping-solo",
		title: "1인 기업으로 출발하기",
		summary: "tkstar.dev 첫 글 — Phase 2 콘텐츠 파이프라인 검증.",
		raw_markdown:
			'## 시작\n\n혼자 만드는 사이트도 Repository 패턴을 깨지 않는다.\n\n```ts\nimport { posts } from "#content";\nposts.length; // 1\n```\n',
		tags: ["solo", "ops"],
		date_published: "2026-04-28",
		status: "published",
	},
];

const DB_NAME_BY_TARGET = {
	local: "tkstar-dev-db-preview",
	preview: "tkstar-dev-db-preview",
	production: "tkstar-dev-db",
} as const;

const isTarget = (v: string): v is keyof typeof DB_NAME_BY_TARGET => v in DB_NAME_BY_TARGET;

const main = async (): Promise<void> => {
	const { values } = parseArgs({
		args: process.argv.slice(2),
		options: { target: { type: "string", default: "local" } },
	});
	const target = values.target ?? "local";
	if (!isTarget(target)) {
		console.error(`[T028] invalid --target='${target}' (must be local|preview|production)`);
		process.exit(1);
	}

	const dbName = DB_NAME_BY_TARGET[target];
	const targetFlag = target === "local" ? "--local" : "--remote";
	const now = Math.floor(Date.now() / 1000);

	const escape = (s: string): string => s.replace(/'/g, "''");
	const lit = (v: string | null): string => (v === null ? "NULL" : `'${escape(v)}'`);
	const rowSql = HARDCODED_SEEDS.map(
		(s) =>
			`(${lit(s.slug)}, ${lit(s.title)}, ${lit(s.summary)}, ${lit(s.raw_markdown)}, ${lit(JSON.stringify(s.tags))}, ${lit(s.date_published)}, ${lit(s.status ?? "published")}, ${now}, ${now})`,
	).join(",\n  ");

	const upsertSql = `INSERT INTO posts (slug, title, summary, raw_markdown, tags, date_published, status, created_at, updated_at) VALUES
  ${rowSql}
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  summary = excluded.summary,
  raw_markdown = excluded.raw_markdown,
  tags = excluded.tags,
  date_published = excluded.date_published,
  status = excluded.status,
  updated_at = excluded.updated_at;`;

	console.log(
		`[T028] seed:posts target=${target} db=${dbName} flag=${targetFlag} now=${now} rows=${HARDCODED_SEEDS.length}`,
	);

	const result = spawnSync(
		"bunx",
		["wrangler", "d1", "execute", dbName, targetFlag, "--command", upsertSql],
		{ stdio: "inherit" },
	);

	if (result.status !== 0) {
		console.error(`[T028] wrangler d1 execute failed (exit=${result.status})`);
		process.exit(result.status ?? 1);
	}
	console.log(`[T028] seed:posts ${target} OK`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main().catch((e) => {
		console.error(e);
		process.exit(1);
	});
}
