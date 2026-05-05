import type { Post } from "~/domain/post/post.entity";

const SITE_URL = "https://tkstar.dev";
const SITE_TITLE = "tkstar.dev";
const SITE_DESC = "1인 기업(개발자) 개인 브랜드 사이트";

const escapeXml = (s: string): string =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const toRfc822 = (iso: string): string => new Date(iso).toUTCString();

export const buildRssFeed = (posts: Post[]): string => {
	const items = posts
		.map((p) => {
			const url = `${SITE_URL}/blog/${p.slug}`;
			return [
				"    <item>",
				`      <title>${escapeXml(p.title)}</title>`,
				`      <link>${url}</link>`,
				`      <description>${escapeXml(p.lede)}</description>`,
				`      <pubDate>${toRfc822(p.date)}</pubDate>`,
				`      <guid>${url}</guid>`,
				"    </item>",
			].join("\n");
		})
		.join("\n");

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
		"  <channel>",
		`    <title>${SITE_TITLE}</title>`,
		`    <link>${SITE_URL}/blog</link>`,
		`    <description>${SITE_DESC}</description>`,
		`    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>`,
		items,
		"  </channel>",
		"</rss>",
	]
		.filter(Boolean)
		.join("\n");
};
