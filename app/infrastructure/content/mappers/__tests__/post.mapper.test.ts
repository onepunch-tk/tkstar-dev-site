import { describe, expect, it } from "vitest";
import { toPost } from "../post.mapper";

describe("toPost mapper", () => {
	it("raw 에 toc 포함 시 entity 도 toc 를 가진다", () => {
		// Arrange
		const raw = {
			slug: "test-post",
			title: "Test Post",
			lede: "A test lede",
			date: "2026-05-02",
			tags: ["test"],
			read: 3,
			toc: [{ slug: "a", text: "A" }],
		};

		// Act
		const entity = toPost(raw) as Record<string, unknown>;

		// Assert
		expect((entity.toc as { slug: string; text: string }[])[0].slug).toBe("a");
	});

	it("raw 에 toc 미제공 시 entity 의 toc 는 undefined 이다", () => {
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
	});
});
