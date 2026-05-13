import { describe, expect, it } from "vitest";

import { loader } from "../robots[.txt]";

const makeArgs = (
	env: { SITE_LAUNCHED: string; SITE_ORIGIN: string },
	url = "https://tkstar.dev/robots.txt",
) =>
	({
		request: new Request(url),
		context: { cloudflare: { env, ctx: {} } },
		params: {},
	}) as never;

describe("robots[.txt] loader — launched", () => {
	const env = { SITE_LAUNCHED: "true", SITE_ORIGIN: "https://tkstar.dev" };

	it("Content-Type 헤더가 text/plain으로 설정된다", async () => {
		const res = await loader(makeArgs(env));

		expect(res.headers.get("Content-Type")).toMatch(/^text\/plain/);
	});

	it("응답 body에 User-agent: *가 포함된다", async () => {
		const res = await loader(makeArgs(env));
		const body = await res.text();

		expect(body).toContain("User-agent: *");
	});

	it("응답 body에 Allow: /가 포함된다", async () => {
		const res = await loader(makeArgs(env));
		const body = await res.text();

		expect(body).toContain("Allow: /");
	});

	it("응답 body에 Sitemap 절대 URL 라인이 포함된다", async () => {
		const res = await loader(makeArgs(env));
		const body = await res.text();

		expect(body).toContain("Sitemap: https://tkstar.dev/sitemap.xml");
	});

	it("Sitemap URL의 origin은 request URL이 아닌 env.SITE_ORIGIN에서 가져온다", async () => {
		const stagingEnv = {
			SITE_LAUNCHED: "true",
			SITE_ORIGIN: "https://staging.tkstar.dev",
		};

		const res = await loader(makeArgs(stagingEnv));
		const body = await res.text();

		expect(body).toContain("Sitemap: https://staging.tkstar.dev/sitemap.xml");
	});

	it("응답 body가 개행 문자로 끝난다", async () => {
		const res = await loader(makeArgs(env));
		const body = await res.text();

		expect(body.endsWith("\n")).toBe(true);
	});
});

describe("robots[.txt] loader — unlaunched (SITE_LAUNCHED='false')", () => {
	const env = { SITE_LAUNCHED: "false", SITE_ORIGIN: "https://tkstar.dev" };

	it("Content-Type 헤더가 text/plain으로 설정된다", async () => {
		const res = await loader(makeArgs(env));

		expect(res.headers.get("Content-Type")).toMatch(/^text\/plain/);
	});

	it("응답 body에 User-agent: *가 포함된다", async () => {
		const res = await loader(makeArgs(env));
		const body = await res.text();

		expect(body).toContain("User-agent: *");
	});

	it("응답 body에 Disallow: /가 포함된다", async () => {
		const res = await loader(makeArgs(env));
		const body = await res.text();

		expect(body).toContain("Disallow: /");
	});

	it("응답 body에 Allow: 라인이 포함되지 않는다", async () => {
		const res = await loader(makeArgs(env));
		const body = await res.text();

		expect(body).not.toContain("Allow:");
	});

	it("응답 body에 Sitemap: 라인이 포함되지 않는다", async () => {
		const res = await loader(makeArgs(env));
		const body = await res.text();

		expect(body).not.toContain("Sitemap:");
	});

	it("응답 body가 개행 문자로 끝난다", async () => {
		const res = await loader(makeArgs(env));
		const body = await res.text();

		expect(body.endsWith("\n")).toBe(true);
	});
});

describe("robots[.txt] loader — isLaunched 엄격 동등 검사 (defense-in-depth)", () => {
	it("SITE_LAUNCHED='yes'는 미출시로 처리되어 Disallow: /를 반환한다", async () => {
		const env = { SITE_LAUNCHED: "yes", SITE_ORIGIN: "https://tkstar.dev" };

		const res = await loader(makeArgs(env));
		const body = await res.text();

		expect(body).toContain("Disallow: /");
		expect(body).not.toContain("Allow:");
		expect(body).not.toContain("Sitemap:");
	});
});
