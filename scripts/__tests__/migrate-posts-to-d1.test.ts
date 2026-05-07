import { describe, expect, it } from "vitest";
import { buildInsertSql, parseMdxFile } from "../migrate-posts-to-d1";

const FIXTURE_FULL = `---
slug: 2026-04-shipping-solo
title: 1인 기업으로 출발하기
lede: tkstar.dev 첫 글 — Phase 2 콘텐츠 파이프라인 검증.
date: 2026-04-28
tags: [solo, ops]
read: 3
---

## 시작

혼자 만드는 사이트도 Repository 패턴을 깨지 않는다.

\`\`\`ts
import { posts } from "#content";
posts.length; // 1
\`\`\`
`;

describe("parseMdxFile", () => {
	it("happy path — 모든 frontmatter present", () => {
		const result = parseMdxFile("test.mdx", FIXTURE_FULL);

		expect(result.slug).toBe("2026-04-shipping-solo");
		expect(result.title).toBe("1인 기업으로 출발하기");
		expect(result.summary).toBe("tkstar.dev 첫 글 — Phase 2 콘텐츠 파이프라인 검증.");
		expect(result.tags).toEqual(["solo", "ops"]);
		expect(result.datePublished).toBe("2026-04-28");
		expect(result.rawMarkdown.startsWith("## 시작")).toBe(true);
		expect(result.rawMarkdown).toContain("```ts");
	});

	it("lede 누락 → summary: null", () => {
		const raw = `---
slug: x
title: t
date: 2026-01-01
tags: [a]
---

body
`;
		const result = parseMdxFile("test.mdx", raw);
		expect(result.summary).toBeNull();
	});

	it("slug 누락 → throw", () => {
		const raw = `---
title: t
date: 2026-01-01
tags: [a]
---
body
`;
		expect(() => parseMdxFile("missing-slug.mdx", raw)).toThrow(/slug/);
	});

	it("title 누락 → throw", () => {
		const raw = `---
slug: x
date: 2026-01-01
tags: [a]
---
body
`;
		expect(() => parseMdxFile("missing-title.mdx", raw)).toThrow(/title/);
	});

	it("date 누락 → throw", () => {
		const raw = `---
slug: x
title: t
tags: [a]
---
body
`;
		expect(() => parseMdxFile("missing-date.mdx", raw)).toThrow(/date/);
	});

	it("tags 누락 → throw", () => {
		const raw = `---
slug: x
title: t
date: 2026-01-01
---
body
`;
		expect(() => parseMdxFile("missing-tags.mdx", raw)).toThrow(/tags/);
	});

	it("tags가 배열 아님 → throw", () => {
		const raw = `---
slug: x
title: t
date: 2026-01-01
tags: solo
---
body
`;
		expect(() => parseMdxFile("non-array-tags.mdx", raw)).toThrow(/tags.*array/);
	});

	it("rawMarkdown은 frontmatter 제외 + 선행 공백 trim", () => {
		const raw = `---
slug: x
title: t
date: 2026-01-01
tags: [a]
---


hello
`;
		const result = parseMdxFile("test.mdx", raw);
		expect(result.rawMarkdown).toBe("hello\n");
	});
});

describe("buildInsertSql", () => {
	const NOW = 1714521600; // 2024-05-01T00:00:00Z (unix seconds)

	it("1건 INSERT 정상 SQL 생성", () => {
		const sql = buildInsertSql(
			[
				{
					slug: "hello",
					title: "Hello",
					summary: "lede",
					rawMarkdown: "body",
					tags: ["a", "b"],
					datePublished: "2026-04-28",
				},
			],
			NOW,
		);

		expect(sql).toMatch(/^INSERT INTO posts/);
		expect(sql).toContain("'hello'");
		expect(sql).toContain("'Hello'");
		expect(sql).toContain("'lede'");
		expect(sql).toContain("'body'");
		expect(sql).toContain('\'["a","b"]\'');
		expect(sql).toContain("'2026-04-28'");
		expect(sql).toContain("'published'");
		expect(sql).toContain(`${NOW}`);
		expect(sql.trimEnd().endsWith(";")).toBe(true);
	});

	it("single-quote 포함 본문 → '' escape", () => {
		const sql = buildInsertSql(
			[
				{
					slug: "x",
					title: "It's working",
					summary: null,
					rawMarkdown: "don't break",
					tags: [],
					datePublished: "2026-01-01",
				},
			],
			NOW,
		);

		expect(sql).toContain("'It''s working'");
		expect(sql).toContain("'don''t break'");
	});

	it("summary가 null → SQL NULL 리터럴", () => {
		const sql = buildInsertSql(
			[
				{
					slug: "x",
					title: "t",
					summary: null,
					rawMarkdown: "b",
					tags: [],
					datePublished: "2026-01-01",
				},
			],
			NOW,
		);

		expect(sql).toMatch(/,\s*NULL\s*,/);
	});

	it("datePublished가 null → SQL NULL 리터럴", () => {
		const sql = buildInsertSql(
			[
				{
					slug: "x",
					title: "t",
					summary: "s",
					rawMarkdown: "b",
					tags: [],
					datePublished: null,
				},
			],
			NOW,
		);

		expect(sql).toMatch(/,\s*NULL\s*,/);
	});

	it("다건 → 단일 INSERT VALUES 묶음", () => {
		const sql = buildInsertSql(
			[
				{
					slug: "a",
					title: "A",
					summary: null,
					rawMarkdown: "x",
					tags: [],
					datePublished: "2026-01-01",
				},
				{
					slug: "b",
					title: "B",
					summary: null,
					rawMarkdown: "y",
					tags: [],
					datePublished: "2026-02-01",
				},
			],
			NOW,
		);

		const insertCount = (sql.match(/INSERT INTO posts/g) ?? []).length;
		expect(insertCount).toBe(1);
		expect(sql).toContain("'a'");
		expect(sql).toContain("'b'");
	});

	it("tags JSON 직렬화 — 배열 그대로", () => {
		const sql = buildInsertSql(
			[
				{
					slug: "x",
					title: "t",
					summary: null,
					rawMarkdown: "b",
					tags: ["solo", "ops"],
					datePublished: "2026-01-01",
				},
			],
			NOW,
		);

		expect(sql).toContain('\'["solo","ops"]\'');
	});

	it("status='published' 고정, created_at/updated_at 동일 NOW", () => {
		const sql = buildInsertSql(
			[
				{
					slug: "x",
					title: "t",
					summary: null,
					rawMarkdown: "b",
					tags: [],
					datePublished: "2026-01-01",
				},
			],
			NOW,
		);

		expect(sql).toContain("'published'");
		// created_at, updated_at가 모두 NOW로 들어가야 함 → NOW 가 최소 2번 등장
		const matches = sql.match(new RegExp(`\\b${NOW}\\b`, "g")) ?? [];
		expect(matches.length).toBeGreaterThanOrEqual(2);
	});

	it("0건 → 빈 문자열 또는 no-op (INSERT 없음)", () => {
		const sql = buildInsertSql([], NOW);
		expect(sql).not.toMatch(/INSERT INTO posts/);
	});
});
