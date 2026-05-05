import { describe, expect, it } from "vitest";
import type { Post } from "~/domain/post/post.entity";
import { buildRssFeed } from "../build-rss-feed.service";

describe("buildRssFeed", () => {
	const posts: Post[] = [
		{ slug: "post-a", title: "글 A", lede: "요약 A", date: "2026-04-28", tags: ["solo"], read: 3 },
		{
			slug: "post-b",
			title: "글 B & <C>",
			lede: "요약 B",
			date: "2026-04-20",
			tags: ["ops"],
			read: 5,
		},
		{ slug: "post-c", title: "글 C", lede: "요약 C", date: "2026-04-10", tags: [], read: 2 },
	];

	it("RSS 2.0 well-formed XML을 반환한다", () => {
		// Arrange & Act
		const result = buildRssFeed(posts);

		// Assert
		expect(result.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(result).toContain('<rss version="2.0"');
		expect(result).toContain("<channel>");
		expect(result).toContain("<title>tkstar.dev</title>");
		expect(result).toContain("<link>https://tkstar.dev/blog</link>");
		expect(result).toContain("<description>");
	});

	it("item 개수가 입력한 posts 길이와 동일하다", () => {
		// Arrange & Act
		const result = buildRssFeed(posts);

		// Assert
		const itemMatches = result.match(/<item>/g);
		expect(itemMatches).not.toBeNull();
		expect(itemMatches).toHaveLength(3);
	});

	it("XML 특수문자를 escape 처리한다", () => {
		// Arrange
		const specialPost = posts[1];

		// Act
		const result = buildRssFeed([specialPost]);

		// Assert
		expect(result).toContain("&amp;");
		expect(result).toContain("&lt;");
		expect(result).not.toContain("글 B & <C>");
	});

	it("pubDate가 RFC 822 형식으로 출력된다", () => {
		// Arrange
		const postA = posts[0];
		const expectedDateFragment = new Date("2026-04-28").toUTCString().slice(0, 16); // "Tue, 28 Apr 2026"

		// Act
		const result = buildRssFeed([postA]);

		// Assert
		expect(result).toContain("<pubDate>");
		expect(result).toContain(expectedDateFragment);
	});

	it("item link와 guid가 절대 URL로 출력된다", () => {
		// Arrange
		const postA = posts[0];

		// Act
		const result = buildRssFeed([postA]);

		// Assert
		expect(result).toContain("<link>https://tkstar.dev/blog/post-a</link>");
		expect(result).toContain("<guid>https://tkstar.dev/blog/post-a</guid>");
	});

	it("빈 posts 배열 입력 시 item 없이 channel을 반환한다", () => {
		// Arrange & Act
		const result = buildRssFeed([]);

		// Assert
		expect(result).toContain("<channel>");
		expect(result).not.toContain("<item>");
	});
});
