import { describe, expect, it } from "vitest";

import { loader } from "../robots[.txt]";

describe("robots[.txt] loader", () => {
	it("Content-Type 헤더가 text/plain으로 설정된다", async () => {
		const request = new Request("https://tkstar.dev/robots.txt");

		const res = await loader({ request } as never);

		expect(res.headers.get("Content-Type")).toMatch(/^text\/plain/);
	});

	it("응답 body에 User-agent: *가 포함된다", async () => {
		const request = new Request("https://tkstar.dev/robots.txt");

		const res = await loader({ request } as never);
		const body = await res.text();

		expect(body).toContain("User-agent: *");
	});

	it("응답 body에 Allow: /가 포함된다", async () => {
		const request = new Request("https://tkstar.dev/robots.txt");

		const res = await loader({ request } as never);
		const body = await res.text();

		expect(body).toContain("Allow: /");
	});

	it("응답 body에 Sitemap 절대 URL 라인이 포함된다", async () => {
		const request = new Request("https://tkstar.dev/robots.txt");

		const res = await loader({ request } as never);
		const body = await res.text();

		expect(body).toContain("Sitemap: https://tkstar.dev/sitemap.xml");
	});

	it("커스텀 origin의 Sitemap URL이 body에 포함된다", async () => {
		const request = new Request("https://preview.example.com/robots.txt");

		const res = await loader({ request } as never);
		const body = await res.text();

		expect(body).toContain("Sitemap: https://preview.example.com/sitemap.xml");
	});

	it("응답 body가 개행 문자로 끝난다", async () => {
		const request = new Request("https://tkstar.dev/robots.txt");

		const res = await loader({ request } as never);
		const body = await res.text();

		expect(body.endsWith("\n")).toBe(true);
	});
});
