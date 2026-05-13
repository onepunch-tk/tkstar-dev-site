/**
 * PRD F021 Data Model — posts 테이블 스키마 정적 검증
 *
 * 실제 SQLite 인스턴스를 띄우지 않고 Drizzle ORM의 getTableConfig를 사용해
 * 컬럼 메타만 정적으로 검증한다.
 *
 * Red Phase: schema/posts.ts 미구현 상태이므로 이 파일 전체가 실패해야 한다.
 * Green Phase(T5)에서 schema가 구현되면 통과 예정.
 */

import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { posts } from "../schema/posts";

describe("posts schema", () => {
	// ──────────────────────────────────────────────
	// 상위 메타 검증
	// ──────────────────────────────────────────────

	it("posts named export가 존재한다", () => {
		// Arrange: 모듈 import 자체가 Arrange
		// Act / Assert
		expect(posts).toBeDefined();
	});

	it("테이블 이름이 정확히 'posts' 이다", () => {
		// Arrange
		const config = getTableConfig(posts);
		// Assert
		expect(config.name).toBe("posts");
	});

	it("컬럼이 정확히 10개 존재한다", () => {
		// Arrange
		const { columns } = getTableConfig(posts);
		// Assert
		expect(columns).toHaveLength(10);
	});

	// ──────────────────────────────────────────────
	// 각 컬럼 검증
	// ──────────────────────────────────────────────

	it("id 컬럼 — integer PK, autoIncrement", () => {
		// Arrange: F021 PK 자동 증가 식별자
		const { columns } = getTableConfig(posts);
		const col = columns.find((c) => c.name === "id");
		// Assert
		expect(col).toBeDefined();
		expect(col?.columnType).toBe("SQLiteInteger");
		expect(col?.primary).toBe(true);
		// autoIncrement는 SQLiteBaseInteger의 런타임 필드
		expect((col as { autoIncrement?: boolean } | undefined)?.autoIncrement).toBe(true);
	});

	it("slug 컬럼 — text, NOT NULL, UNIQUE", () => {
		// Arrange: F021 Post 고유 경로 식별자
		const { columns } = getTableConfig(posts);
		const col = columns.find((c) => c.name === "slug");
		// Assert
		expect(col).toBeDefined();
		expect(col?.columnType).toBe("SQLiteText");
		expect(col?.notNull).toBe(true);
		expect(col?.isUnique).toBe(true);
	});

	it("title 컬럼 — text, NOT NULL", () => {
		// Arrange: F021 Post 제목
		const { columns } = getTableConfig(posts);
		const col = columns.find((c) => c.name === "title");
		// Assert
		expect(col).toBeDefined();
		expect(col?.columnType).toBe("SQLiteText");
		expect(col?.notNull).toBe(true);
	});

	it("summary 컬럼 — text, NULL 허용", () => {
		// Arrange: F021 요약 (선택 항목)
		const { columns } = getTableConfig(posts);
		const col = columns.find((c) => c.name === "summary");
		// Assert
		expect(col).toBeDefined();
		expect(col?.columnType).toBe("SQLiteText");
		expect(col?.notNull).toBe(false);
	});

	it("raw_markdown 컬럼 — text, NOT NULL", () => {
		// Arrange: F021 원본 마크다운 본문
		const { columns } = getTableConfig(posts);
		const col = columns.find((c) => c.name === "raw_markdown");
		// Assert
		expect(col).toBeDefined();
		expect(col?.columnType).toBe("SQLiteText");
		expect(col?.notNull).toBe(true);
	});

	it("tags 컬럼 — text (JSON 직렬화 문자열), NOT NULL", () => {
		// Arrange: F021 태그 목록 (JSON string으로 저장)
		const { columns } = getTableConfig(posts);
		const col = columns.find((c) => c.name === "tags");
		// Assert
		expect(col).toBeDefined();
		expect(col?.columnType).toBe("SQLiteText");
		expect(col?.notNull).toBe(true);
	});

	it("date_published 컬럼 — text (ISO 8601), NULL 허용", () => {
		// Arrange: F021 발행 날짜 (draft 상태에서는 null)
		const { columns } = getTableConfig(posts);
		const col = columns.find((c) => c.name === "date_published");
		// Assert
		expect(col).toBeDefined();
		expect(col?.columnType).toBe("SQLiteText");
		expect(col?.notNull).toBe(false);
	});

	it("status 컬럼 — text enum ['draft','published'], NOT NULL, DEFAULT 'draft'", () => {
		// Arrange: F021 PostStatus VO — 'draft' | 'published'
		const { columns } = getTableConfig(posts);
		const col = columns.find((c) => c.name === "status");
		// Assert — 타입
		expect(col).toBeDefined();
		expect(col?.columnType).toBe("SQLiteText");
		expect(col?.notNull).toBe(true);
		// Assert — enum 메타
		expect(col?.enumValues).toEqual(["draft", "published"]);
		// Assert — default
		expect(col?.hasDefault).toBe(true);
		expect(col?.default).toBe("draft");
	});

	it("created_at 컬럼 — integer (unix epoch seconds), NOT NULL", () => {
		// Arrange: F021 레코드 생성 시각
		const { columns } = getTableConfig(posts);
		const col = columns.find((c) => c.name === "created_at");
		// Assert
		expect(col).toBeDefined();
		expect(col?.columnType).toBe("SQLiteInteger");
		expect(col?.notNull).toBe(true);
	});

	it("updated_at 컬럼 — integer (unix epoch seconds), NOT NULL", () => {
		// Arrange: F021 레코드 최종 수정 시각
		const { columns } = getTableConfig(posts);
		const col = columns.find((c) => c.name === "updated_at");
		// Assert
		expect(col).toBeDefined();
		expect(col?.columnType).toBe("SQLiteInteger");
		expect(col?.notNull).toBe(true);
	});
});
