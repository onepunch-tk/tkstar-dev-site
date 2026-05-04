import type { MetaDescriptor } from "react-router";
import { describe, expect, it } from "vitest";
import { meta } from "../contact";

type LdScript = { "script:ld+json": Record<string, unknown> };
const isLd = (m: MetaDescriptor): m is LdScript => "script:ld+json" in m;

const data = {
	origin: "https://tkstar.dev",
	canonicalUrl: "https://tkstar.dev/contact",
	ogImageUrl: "https://tkstar.dev/og/fallback.png",
	siteKey: "1x00000000000000000000AA",
	contactEmail: "hello@tkstar.dev",
};

const callMeta = () =>
	meta({
		data,
		params: {},
		location: { pathname: "/contact", search: "", hash: "", state: null, key: "" },
		matches: [],
	} as unknown as Parameters<typeof meta>[0]);

describe("Contact meta export", () => {
	it("title 이 Contact — tkstar.dev 를 포함한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([expect.objectContaining({ title: "Contact — tkstar.dev" })]),
		);
	});

	it("canonical link 태그를 포함한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					tagName: "link",
					rel: "canonical",
					href: "https://tkstar.dev/contact",
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

	it("JSON-LD 스크립트에 BreadcrumbList 타입을 포함한다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const types = ldScripts.map((s) => s["script:ld+json"]["@type"]);
		expect(types).toContain("BreadcrumbList");
	});

	it("JSON-LD 스크립트에 Person 타입을 포함하지 않는다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const types = ldScripts.map((s) => s["script:ld+json"]["@type"]);
		expect(types).not.toContain("Person");
	});
});

describe("data 가 undefined 이면 fallback meta 만 반환한다", () => {
	it("title 만 포함하고 canonical/og:image/JSON-LD 는 제외", () => {
		const result = meta({
			data: undefined,
			params: {},
			location: { pathname: "/", search: "", hash: "", state: null, key: "" },
			matches: [],
		} as unknown as Parameters<typeof meta>[0]);
		expect((result as { title?: string }[]).some((m) => "title" in m)).toBe(true);
		expect((result as { tagName?: string }[]).some((m) => m.tagName === "link")).toBe(false);
	});
});
