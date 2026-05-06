import { describe, expect, it } from "vitest";
import { fixturePosts, postBravo } from "~/__tests__/fixtures/velite-posts.fixture";
import { buildRssFeed } from "../build-rss-feed.service";

describe("buildRssFeed", () => {
	const posts = fixturePosts;

	it("RSS 2.0 well-formed XML을 반환한다", () => {
		const result = buildRssFeed(posts);
		expect(result.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(result).toContain('<rss version="2.0"');
		expect(result).toContain("<channel>");
		expect(result).toContain("<title>tkstar.dev</title>");
		expect(result).toContain("<link>https://tkstar.dev/blog</link>");
		expect(result).toContain("<description>");
	});

	it("item 개수가 입력한 posts 길이와 동일하다", () => {
		const result = buildRssFeed(posts);
		const itemMatches = result.match(/<item>/g);
		expect(itemMatches).not.toBeNull();
		expect(itemMatches).toHaveLength(4);
	});

	it("XML 특수문자를 escape 처리한다", () => {
		const specialPost = { ...postBravo, title: "글 B & <C>" };
		const result = buildRssFeed([specialPost]);
		expect(result).toContain("&amp;");
		expect(result).toContain("&lt;");
		expect(result).not.toContain("글 B & <C>");
	});

	it("pubDate가 RFC 822 형식으로 출력된다", () => {
		const result = buildRssFeed([postBravo]);
		const expectedDateFragment = new Date(postBravo.datePublished as string)
			.toUTCString()
			.slice(0, 16);
		expect(result).toContain("<pubDate>");
		expect(result).toContain(expectedDateFragment);
	});

	it("item link와 guid가 절대 URL로 출력된다", () => {
		const result = buildRssFeed([postBravo]);
		expect(result).toContain(`<link>https://tkstar.dev/blog/${postBravo.slug}</link>`);
		expect(result).toContain(`<guid>https://tkstar.dev/blog/${postBravo.slug}</guid>`);
	});

	it("빈 posts 배열 입력 시 item 없이 channel을 반환한다", () => {
		const result = buildRssFeed([]);
		expect(result).toContain("<channel>");
		expect(result).not.toContain("<item>");
	});
});
