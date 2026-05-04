import type { MetaDescriptor } from "react-router";
import { describe, expect, it } from "vitest";
import { meta } from "../legal.$app.terms";

type LdScript = { "script:ld+json": Record<string, unknown> };
const isLd = (m: MetaDescriptor): m is LdScript => "script:ld+json" in m;

const data = {
	doc: {
		app_slug: "moai",
		doc_type: "terms" as const,
		version: "1.0",
		effective_date: "2026-01-01",
	},
	origin: "https://tkstar.dev",
	canonicalUrl: "https://tkstar.dev/legal/moai/terms",
	ogImageUrl: "https://tkstar.dev/og/fallback.png",
};

const callMeta = () =>
	meta({
		data,
		params: { app: "moai" },
		location: { pathname: "/legal/moai/terms", search: "", hash: "", state: null, key: "" },
		matches: [],
	} as unknown as Parameters<typeof meta>[0]);

describe("legal.$app.terms meta export", () => {
	it("title 이 'moai 서비스 이용약관 — tkstar.dev' 를 포함한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ title: "moai 서비스 이용약관 — tkstar.dev" }),
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
					href: "https://tkstar.dev/legal/moai/terms",
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

	it("robots 메타태그가 'noindex, follow' 이다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "robots", content: "noindex, follow" }),
			]),
		);
	});

	it("JSON-LD 스크립트에 BreadcrumbList 타입을 포함한다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const types = ldScripts.map((s) => s["script:ld+json"]["@type"]);
		expect(types).toContain("BreadcrumbList");
	});

	it("JSON-LD 스크립트에 BreadcrumbList 만 포함한다 (Person / BlogPosting / CreativeWork 미포함)", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const types = ldScripts.map((s) => s["script:ld+json"]["@type"]);
		expect(types).not.toContain("Person");
		expect(types).not.toContain("BlogPosting");
		expect(types).not.toContain("CreativeWork");
	});

	it("BreadcrumbList itemListElement 길이가 3 이다 (Home / Legal / moai 서비스 이용약관)", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const ld = ldScripts
			.map((s) => s["script:ld+json"])
			.find((o) => o["@type"] === "BreadcrumbList");
		expect(ld?.itemListElement).toHaveLength(3);
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
