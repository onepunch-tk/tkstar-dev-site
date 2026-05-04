import type { MetaDescriptor } from "react-router";
import { describe, expect, it } from "vitest";
import { meta } from "../blog.$slug";

type LdScript = { "script:ld+json": string };
const isLd = (m: MetaDescriptor): m is LdScript => "script:ld+json" in m;

const post = {
	slug: "my-post",
	title: "My Post",
	lede: "post lede",
	date: "2026-04-15",
	tags: ["typescript"] as string[],
	read: 5,
};

const data = {
	post,
	prev: null,
	next: null,
	origin: "https://tkstar.dev",
	canonicalUrl: "https://tkstar.dev/blog/my-post",
	ogImageUrl: "https://tkstar.dev/og/blog/my-post.png",
};

const callMeta = () =>
	meta({
		data,
		params: { slug: "my-post" },
		location: { pathname: "/blog/my-post", search: "", hash: "", state: null, key: "" },
		matches: [],
	} as unknown as Parameters<typeof meta>[0]);

describe("blog.$slug meta export", () => {
	it("title 이 'My Post — tkstar.dev' 를 포함한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([expect.objectContaining({ title: "My Post — tkstar.dev" })]),
		);
	});

	it("description 메타태그에 post.lede 를 사용한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "description", content: "post lede" }),
			]),
		);
	});

	it("canonical link 태그를 포함한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					tagName: "link",
					rel: "canonical",
					href: "https://tkstar.dev/blog/my-post",
				}),
			]),
		);
	});

	it("og:image 에 동적 Satori OG URL 을 포함한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					property: "og:image",
					content: "https://tkstar.dev/og/blog/my-post.png",
				}),
			]),
		);
	});

	it("og:type 이 article 이다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ property: "og:type", content: "article" }),
			]),
		);
	});

	it("JSON-LD 스크립트에 BlogPosting 타입을 포함한다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const types = ldScripts.map((s) => JSON.parse(s["script:ld+json"])["@type"]);
		expect(types).toContain("BlogPosting");
	});

	it("JSON-LD 스크립트에 BreadcrumbList 타입을 포함한다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const types = ldScripts.map((s) => JSON.parse(s["script:ld+json"])["@type"]);
		expect(types).toContain("BreadcrumbList");
	});

	it("BlogPosting JSON-LD 에 올바른 필드를 포함한다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const ld = ldScripts
			.map((s) => JSON.parse(s["script:ld+json"]))
			.find((o) => o["@type"] === "BlogPosting");
		expect(ld?.headline).toBe("My Post");
		expect(ld?.description).toBe("post lede");
		expect(ld?.datePublished).toBe("2026-04-15");
		expect(ld?.image).toBe("https://tkstar.dev/og/blog/my-post.png");
		expect(ld?.mainEntityOfPage).toBe("https://tkstar.dev/blog/my-post");
		expect(ld?.inLanguage).toBe("ko");
	});

	it("BreadcrumbList itemListElement 길이가 3 이다 (Home / Blog / 현재 포스트)", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const ld = ldScripts
			.map((s) => JSON.parse(s["script:ld+json"]))
			.find((o) => o["@type"] === "BreadcrumbList");
		expect(ld?.itemListElement).toHaveLength(3);
	});
});
