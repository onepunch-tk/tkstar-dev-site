import type { MetaDescriptor } from "react-router";
import { describe, expect, it } from "vitest";
import { meta } from "../$";

type LdScript = { "script:ld+json": string };
const isLd = (m: MetaDescriptor): m is LdScript => "script:ld+json" in m;

// 시나리오 A: data 없음 (loader 없거나 throw 한 경우)
const callMetaNoData = () =>
	meta({
		data: undefined,
		params: { "*": "some-broken-path" },
		location: { pathname: "/some-broken-path", search: "", hash: "", state: null, key: "" },
		matches: [],
	} as unknown as Parameters<typeof meta>[0]);

// 시나리오 B: loader 가 canonicalUrl / ogImageUrl / origin 을 내려준 경우
const dataWithUrls = {
	origin: "https://tkstar.dev",
	canonicalUrl: "https://tkstar.dev/some-broken-path",
	ogImageUrl: "https://tkstar.dev/og/fallback.png",
};

const callMetaWithData = () =>
	meta({
		data: dataWithUrls,
		params: { "*": "some-broken-path" },
		location: { pathname: "/some-broken-path", search: "", hash: "", state: null, key: "" },
		matches: [],
	} as unknown as Parameters<typeof meta>[0]);

describe("$.tsx (404 splat) meta export", () => {
	describe("(A) data 없음 시나리오", () => {
		it("title 에 'Not Found — tkstar.dev' 를 포함한다", () => {
			const result = callMetaNoData();
			expect(result).toEqual(
				expect.arrayContaining([expect.objectContaining({ title: "Not Found — tkstar.dev" })]),
			);
		});

		it("robots 메타태그가 'noindex, nofollow' 이다", () => {
			const result = callMetaNoData();
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ name: "robots", content: "noindex, nofollow" }),
				]),
			);
		});
	});

	describe("(B) data 있음 시나리오", () => {
		it("full meta + robots 가 'noindex, nofollow' 이다 (title / canonical / og:image 모두 포함)", () => {
			const result = callMetaWithData();
			expect(result).toEqual(
				expect.arrayContaining([expect.objectContaining({ title: "Not Found — tkstar.dev" })]),
			);
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						tagName: "link",
						rel: "canonical",
						href: "https://tkstar.dev/some-broken-path",
					}),
				]),
			);
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						property: "og:image",
						content: "https://tkstar.dev/og/fallback.png",
					}),
				]),
			);
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ name: "robots", content: "noindex, nofollow" }),
				]),
			);
		});

		it("JSON-LD 스크립트가 없다 (404 페이지는 schema 없음)", () => {
			const result = callMetaWithData();
			const ldScripts = (result as MetaDescriptor[]).filter(isLd);
			expect(ldScripts.length).toBe(0);
		});
	});
});
