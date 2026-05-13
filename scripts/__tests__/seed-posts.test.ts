import { beforeEach, describe, expect, it } from "vitest";
import { createInMemoryD1 } from "../../app/infrastructure/db/__tests__/_helpers/in-memory-d1";
import type { InMemoryDb } from "../../app/infrastructure/db/__tests__/_helpers/in-memory-d1";
import { posts } from "../../app/infrastructure/db/schema/posts";
import { seedPosts, type PostSeed } from "../seed-posts";

// 매 테스트마다 fresh DB
let db: InMemoryDb;

beforeEach(() => {
	db = createInMemoryD1();
});

describe("seedPosts", () => {
	it("서로 다른 slug 2개 → 모두 INSERT (row 2개, 각 컬럼 일치)", async () => {
		// Arrange
		const seeds: PostSeed[] = [
			{
				slug: "post-alpha",
				title: "첫 번째 포스트",
				summary: "요약 A",
				raw_markdown: "# Alpha\n본문",
				tags: ["go", "rust"],
				date_published: "2026-01-01",
				status: "published",
			},
			{
				slug: "post-beta",
				title: "두 번째 포스트",
				summary: null,
				raw_markdown: "# Beta\n본문",
				tags: ["typescript"],
				date_published: "2026-02-01",
			},
		];

		// Act
		await seedPosts(db, seeds);

		// Assert
		const rows = await db.select().from(posts);
		expect(rows).toHaveLength(2);

		const alpha = rows.find((r) => r.slug === "post-alpha");
		expect(alpha).toBeDefined();
		expect(alpha?.title).toBe("첫 번째 포스트");
		expect(alpha?.raw_markdown).toBe("# Alpha\n본문");
		expect(alpha?.tags).toBe('["go","rust"]');
		expect(alpha?.status).toBe("published");

		const beta = rows.find((r) => r.slug === "post-beta");
		expect(beta).toBeDefined();
		expect(beta?.title).toBe("두 번째 포스트");
		expect(beta?.raw_markdown).toBe("# Beta\n본문");
		expect(beta?.tags).toBe('["typescript"]');
	});

	it("같은 slug로 두 번 호출 → idempotent upsert (row 1개, title/updated_at 갱신)", async () => {
		// Arrange
		const NOW_FIRST = 1746000000;
		const NOW_SECOND = 1746010000;
		const seedFirst: PostSeed[] = [
			{
				slug: "upsert-target",
				title: "초기 제목",
				summary: "초기 요약",
				raw_markdown: "초기 본문",
				tags: ["a"],
				date_published: "2026-03-01",
			},
		];
		const seedSecond: PostSeed[] = [
			{
				slug: "upsert-target",
				title: "갱신된 제목",
				summary: "갱신된 요약",
				raw_markdown: "갱신된 본문",
				tags: ["a", "b"],
				date_published: "2026-03-01",
			},
		];

		// Act
		await seedPosts(db, seedFirst, NOW_FIRST);
		await seedPosts(db, seedSecond, NOW_SECOND);

		// Assert
		const rows = await db.select().from(posts);
		expect(rows).toHaveLength(1);
		expect(rows[0].title).toBe("갱신된 제목");
		expect(rows[0].updated_at).toBe(NOW_SECOND);
		// created_at 은 INSERT 시점값 유지 — SET 절에 포함되면 안 됨
		expect(rows[0].created_at).toBe(NOW_FIRST);
	});

	it("seeds 빈 배열 → inserted=0, DB 변경 없음", async () => {
		await expect(seedPosts(db, [])).resolves.toEqual({ inserted: 0 });
		const rows = await db.select().from(posts);
		expect(rows).toHaveLength(0);
	});

	it("tags 배열 → JSON 직렬화 후 저장 (문자열 정확히 일치 + JSON.parse 복원)", async () => {
		// Arrange
		const seed: PostSeed[] = [
			{
				slug: "tags-test",
				title: "태그 테스트",
				summary: null,
				raw_markdown: "본문",
				tags: ["solo", "ops"],
				date_published: null,
			},
		];

		// Act
		await seedPosts(db, seed);

		// Assert
		const rows = await db.select().from(posts);
		expect(rows).toHaveLength(1);
		// 정확한 JSON 문자열 직렬화 확인
		expect(rows[0].tags).toBe('["solo","ops"]');
		// JSON.parse 복원 deep equal
		expect(JSON.parse(rows[0].tags)).toEqual(["solo", "ops"]);
	});

	it("status 필드 미지정 → DB row의 status가 'published' (default 적용)", async () => {
		// Arrange — status 필드를 아예 포함하지 않음
		const seed: PostSeed[] = [
			{
				slug: "default-status",
				title: "status 미지정 포스트",
				summary: null,
				raw_markdown: "본문",
				tags: [],
				date_published: "2026-04-01",
				// status: 생략
			},
		];

		// Act
		await seedPosts(db, seed);

		// Assert
		const rows = await db.select().from(posts);
		expect(rows).toHaveLength(1);
		expect(rows[0].status).toBe("published");
	});
});
