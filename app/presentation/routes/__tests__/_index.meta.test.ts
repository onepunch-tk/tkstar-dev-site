import type { MetaDescriptor } from "react-router";
import { describe, expect, it } from "vitest";
import { meta } from "../_index";

type LdScript = { "script:ld+json": string };
const isLd = (m: MetaDescriptor): m is LdScript => "script:ld+json" in m;

const data = {
	origin: "https://tkstar.dev",
	canonicalUrl: "https://tkstar.dev/",
	ogImageUrl: "https://tkstar.dev/og/fallback.png",
	featured: null,
	posts: [],
};

const callMeta = () =>
	meta({
		data,
		params: {},
		location: { pathname: "/", search: "", hash: "", state: null, key: "" },
		matches: [],
	} as unknown as Parameters<typeof meta>[0]);

describe("Home(_index) meta export", () => {
	it("title 이 tkstar.dev 를 포함한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([expect.objectContaining({ title: "tkstar.dev" })]),
		);
	});

	it("canonical link 태그를 포함한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					tagName: "link",
					rel: "canonical",
					href: "https://tkstar.dev/",
				}),
			]),
		);
	});

	it("og:image 에 절대 URL 을 포함한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					property: "og:image",
					content: "https://tkstar.dev/og/fallback.png",
				}),
			]),
		);
	});

	it("JSON-LD 스크립트에 Person 타입을 포함한다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const types = ldScripts.map((s) => JSON.parse(s["script:ld+json"])["@type"]);
		expect(types).toContain("Person");
	});

	it("JSON-LD 스크립트에 BreadcrumbList 타입을 포함하지 않는다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const types = ldScripts.map((s) => JSON.parse(s["script:ld+json"])["@type"]);
		expect(types).not.toContain("BreadcrumbList");
	});
});
