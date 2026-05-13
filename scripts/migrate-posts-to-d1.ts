/**
 * T026 — MDX → D1 일회성 마이그레이션 스크립트.
 * Why: T025가 velite Post collection을 폐기했지만 기존 content/posts/*.mdx
 *      데이터가 D1으로 옮겨지지 않아 production /blog가 빈 상태.
 *      본 스크립트는 INSERT SQL을 emit하고, 사용자가 wrangler d1 execute로
 *      수동 적용한다 (자동 INSERT 없음 — production --remote는 PR 검토 후).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";

export type ParsedPost = {
	slug: string;
	title: string;
	summary: string | null;
	rawMarkdown: string;
	tags: string[];
	datePublished: string | null;
};

export const parseMdxFile = (filePath: string, raw: string): ParsedPost => {
	const { data, content } = matter(raw);

	for (const field of ["slug", "title", "tags", "date"] as const) {
		if (data[field] === undefined || data[field] === null) {
			throw new Error(`[T026] ${filePath}: missing required frontmatter '${field}'`);
		}
	}
	if (!Array.isArray(data.tags)) {
		throw new Error(`[T026] ${filePath}: 'tags' must be an array`);
	}

	const dateValue = data.date;
	const datePublished =
		dateValue instanceof Date ? dateValue.toISOString().slice(0, 10) : String(dateValue);

	return {
		slug: String(data.slug),
		title: String(data.title),
		summary: data.lede ? String(data.lede) : null,
		rawMarkdown: content.replace(/^\s+/, ""),
		tags: data.tags.map(String),
		datePublished,
	};
};

const escapeSqlString = (s: string): string => s.replace(/'/g, "''");

const sqlLiteral = (value: string | null): string =>
	value === null ? "NULL" : `'${escapeSqlString(value)}'`;

export const buildInsertSql = (rows: ParsedPost[], now: number): string => {
	if (rows.length === 0) return "";

	const valuesList = rows
		.map((row) => {
			const tagsJson = JSON.stringify(row.tags);
			return `(${sqlLiteral(row.slug)}, ${sqlLiteral(row.title)}, ${sqlLiteral(
				row.summary,
			)}, ${sqlLiteral(row.rawMarkdown)}, ${sqlLiteral(
				tagsJson,
			)}, ${sqlLiteral(row.datePublished)}, 'published', ${now}, ${now})`;
		})
		.join(",\n  ");

	return `INSERT INTO posts (slug, title, summary, raw_markdown, tags, date_published, status, created_at, updated_at) VALUES\n  ${valuesList};\n`;
};

const main = (): void => {
	const args = process.argv.slice(2);
	const outArg = args.find((a) => a.startsWith("--out="));
	const dryRun = args.includes("--dry-run");
	const sourceArg = args.find((a) => a.startsWith("--source="));

	const sourceDir = resolve(
		process.cwd(),
		sourceArg ? sourceArg.slice("--source=".length) : "content/posts",
	);

	const files = readdirSync(sourceDir).filter((f) => f.endsWith(".mdx"));
	if (files.length === 0) {
		console.error(`[T026] no .mdx files in ${sourceDir}`);
		process.exit(1);
	}

	const rows = files.map((f) => {
		const filePath = join(sourceDir, f);
		const raw = readFileSync(filePath, "utf-8");
		return parseMdxFile(filePath, raw);
	});

	const now = Math.floor(Date.now() / 1000);
	const sql = buildInsertSql(rows, now);

	if (dryRun || !outArg) {
		process.stdout.write(sql);
		return;
	}

	const outPath = resolve(process.cwd(), outArg.slice("--out=".length));
	writeFileSync(outPath, sql, "utf-8");
	console.error(`[T026] wrote ${rows.length} row(s) → ${outPath}`);
};

if (import.meta.main) {
	main();
}
