import type { MetaDescriptor } from "react-router";
import { describe, expect, it } from "vitest";
import { meta } from "../projects.$slug";

type LdScript = { "script:ld+json": Record<string, unknown> };
const isLd = (m: MetaDescriptor): m is LdScript => "script:ld+json" in m;

const project = {
	slug: "my-project",
	title: "My Project",
	summary: "project summary",
	date: "2025-12-01",
	tags: [] as string[],
	stack: [] as string[],
	metrics: [] as [string, string][],
};

const data = {
	project,
	prev: null,
	next: null,
	origin: "https://tkstar.dev",
	canonicalUrl: "https://tkstar.dev/projects/my-project",
	ogImageUrl: "https://tkstar.dev/og/projects/my-project.png",
};

const callMeta = () =>
	meta({
		data,
		params: { slug: "my-project" },
		location: { pathname: "/projects/my-project", search: "", hash: "", state: null, key: "" },
		matches: [],
	} as unknown as Parameters<typeof meta>[0]);

describe("projects.$slug meta export", () => {
	it("title 이 'My Project — tkstar.dev' 를 포함한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([expect.objectContaining({ title: "My Project — tkstar.dev" })]),
		);
	});

	it("description 메타태그에 project.summary 를 사용한다", () => {
		const result = callMeta();
		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "description", content: "project summary" }),
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
					href: "https://tkstar.dev/projects/my-project",
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
					content: "https://tkstar.dev/og/projects/my-project.png",
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

	it("JSON-LD 스크립트에 CreativeWork 타입을 포함한다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const types = ldScripts.map((s) => s["script:ld+json"]["@type"]);
		expect(types).toContain("CreativeWork");
	});

	it("JSON-LD 스크립트에 BreadcrumbList 타입을 포함한다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const types = ldScripts.map((s) => s["script:ld+json"]["@type"]);
		expect(types).toContain("BreadcrumbList");
	});

	it("CreativeWork JSON-LD 에 올바른 필드를 포함한다", () => {
		const result = callMeta();
		const ldScripts = (result as MetaDescriptor[]).filter(isLd);
		const ld = ldScripts
			.map((s) => s["script:ld+json"])
			.find((o) => o["@type"] === "CreativeWork");
		expect(ld?.name).toBe("My Project");
		expect(ld?.description).toBe("project summary");
		expect(ld?.url).toBe("https://tkstar.dev/projects/my-project");
		expect(ld?.image).toBe("https://tkstar.dev/og/projects/my-project.png");
		expect(ld?.inLanguage).toBe("ko");
	});

	it("BreadcrumbList itemListElement 길이가 3 이다 (Home / Projects / 현재 프로젝트)", () => {
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
