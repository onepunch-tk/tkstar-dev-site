import { describe, expect, it } from "vitest";
import { toPost } from "../post.mapper";

// ---------------------------------------------------------------------------
// T014b RED — toPost mapper body/toc passthrough 검증
// 현재 mapper 는 body/toc 를 drop 하므로 이 테스트들은 실패해야 한다
// ---------------------------------------------------------------------------

describe("toPost mapper", () => {
	it("raw 에 body + toc 포함 시 entity 도 body 와 toc 를 가진다", () => {
		// Arrange
		const raw = {
			slug: "test-post",
			title: "Test Post",
			lede: "A test lede",
			date: "2026-05-02",
			tags: ["test"],
			read: 3,
			body: "mdx-fn-body-string",
			toc: [{ slug: "a", text: "A" }],
		};

		// Act
		const entity = toPost(raw) as Record<string, unknown>;

		// Assert
		expect(entity.body).toBe("mdx-fn-body-string");
		expect((entity.toc as { slug: string; text: string }[])[0].slug).toBe("a");
	});

	it("raw 에 toc/body 미제공 시 entity 의 toc 와 body 는 undefined 이다", () => {
		// Arrange
		const raw = {
			slug: "no-toc-post",
			title: "No Toc Post",
			lede: "A lede without toc",
			date: "2026-05-02",
			tags: ["blog"],
			read: 5,
		};

		// Act
		const entity = toPost(raw) as Record<string, unknown>;

		// Assert
		expect(entity.toc).toBeUndefined();
		expect(entity.body).toBeUndefined();
	});
});
