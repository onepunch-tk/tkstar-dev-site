import { describe, expect, it } from "vitest";
import { getAnalyticsScriptProps } from "../cloudflare-web-analytics";

describe("getAnalyticsScriptProps", () => {
	it("token truthy → defer + beacon URL + JSON-encoded data-cf-beacon 반환", () => {
		const props = getAnalyticsScriptProps("token-abc");

		expect(props).not.toBeNull();
		expect(props?.defer).toBe(true);
		expect(props?.src).toBe("https://static.cloudflareinsights.com/beacon.min.js");
		expect(props?.["data-cf-beacon"]).toBe('{"token":"token-abc"}');
	});

	it("빈 문자열 토큰 → null", () => {
		expect(getAnalyticsScriptProps("")).toBeNull();
	});

	it("undefined 토큰 → null", () => {
		expect(getAnalyticsScriptProps(undefined)).toBeNull();
	});

	it("token 에 따옴표 포함 → JSON.stringify 가 escape", () => {
		const props = getAnalyticsScriptProps('a"b');
		expect(props?.["data-cf-beacon"]).toBe('{"token":"a\\"b"}');
	});
});
