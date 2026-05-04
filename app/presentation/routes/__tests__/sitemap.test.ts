import { describe, expect, it, vi } from "vitest";

import { loader } from "../sitemap[.xml]";

const makeContext = (xml: string) => {
	const buildSitemap = vi.fn().mockResolvedValue(xml);
	return {
		context: {
			container: {
				listProjects: vi.fn(),
				getProjectDetail: vi.fn(),
				getFeaturedProject: vi.fn(),
				listPosts: vi.fn(),
				getPostDetail: vi.fn(),
				getRecentPosts: vi.fn(),
				buildRssFeed: vi.fn(),
				buildSitemap,
			},
			cloudflare: { env: {}, ctx: {} },
		},
		spies: { buildSitemap },
	};
};

describe("sitemap[.xml] loader", () => {
	it("Content-Type 헤더가 application/xml로 설정된다", async () => {
		const { context } = makeContext(
			'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
		);
		const request = new Request("https://tkstar.dev/sitemap.xml");

		const res = await loader({ context, request } as never);

		expect(res.headers.get("Content-Type")).toMatch(/^application\/xml/);
	});

	it("응답 body가 <?xml로 시작한다", async () => {
		const { context } = makeContext(
			'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
		);
		const request = new Request("https://tkstar.dev/sitemap.xml");

		const res = await loader({ context, request } as never);
		const body = await res.text();

		expect(body.startsWith("<?xml")).toBe(true);
	});

	it("응답 body가 buildSitemap의 반환값과 동일하다", async () => {
		const xml =
			'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://tkstar.dev/</loc></url></urlset>';
		const { context } = makeContext(xml);
		const request = new Request("https://tkstar.dev/sitemap.xml");

		const res = await loader({ context, request } as never);
		const body = await res.text();

		expect(body).toBe(xml);
	});

	it("container.buildSitemap이 request URL의 origin으로 1회 호출된다", async () => {
		const { context, spies } = makeContext(
			'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
		);
		const request = new Request("https://tkstar.dev/sitemap.xml");

		await loader({ context, request } as never);

		expect(spies.buildSitemap).toHaveBeenCalledOnce();
		expect(spies.buildSitemap).toHaveBeenCalledWith("https://tkstar.dev");
	});

	it("커스텀 origin이 buildSitemap에 전달된다", async () => {
		const { context, spies } = makeContext(
			'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
		);
		const request = new Request("https://preview.example.com/sitemap.xml");

		await loader({ context, request } as never);

		expect(spies.buildSitemap).toHaveBeenCalledWith("https://preview.example.com");
	});
});
