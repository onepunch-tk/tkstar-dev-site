import { describe, expect, it, vi } from "vitest";

import { loader } from "../sitemap[.xml]";

const makeContext = (
	xml: string,
	env: { SITE_LAUNCHED: string; SITE_ORIGIN: string } = {
		SITE_LAUNCHED: "true",
		SITE_ORIGIN: "https://tkstar.dev",
	},
) => {
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
			cloudflare: { env, ctx: {} },
		},
		spies: { buildSitemap },
	};
};

describe("sitemap[.xml] loader — launched", () => {
	it("Content-Type 헤더가 application/xml로 설정된다", async () => {
		const { context } = makeContext(
			'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
		);

		const res = await loader({ context } as never);

		expect(res.headers.get("Content-Type")).toMatch(/^application\/xml/);
	});

	it("응답 body가 <?xml로 시작한다", async () => {
		const { context } = makeContext(
			'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
		);

		const res = await loader({ context } as never);
		const body = await res.text();

		expect(body.startsWith("<?xml")).toBe(true);
	});

	it("응답 body가 buildSitemap의 반환값과 동일하다", async () => {
		const xml =
			'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://tkstar.dev/</loc></url></urlset>';
		const { context } = makeContext(xml);

		const res = await loader({ context } as never);
		const body = await res.text();

		expect(body).toBe(xml);
	});

	it("container.buildSitemap이 env.SITE_ORIGIN의 origin으로 1회 호출된다", async () => {
		const { context, spies } = makeContext(
			'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
		);

		await loader({ context } as never);

		expect(spies.buildSitemap).toHaveBeenCalledOnce();
		expect(spies.buildSitemap).toHaveBeenCalledWith("https://tkstar.dev");
	});

	it("커스텀 origin이 buildSitemap에 전달된다", async () => {
		const { context, spies } = makeContext(
			'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
			{ SITE_LAUNCHED: "true", SITE_ORIGIN: "https://staging.tkstar.dev" },
		);

		await loader({ context } as never);

		expect(spies.buildSitemap).toHaveBeenCalledWith("https://staging.tkstar.dev");
	});
});

describe("sitemap[.xml] loader — unlaunched (SITE_LAUNCHED='false')", () => {
	it("Content-Type 헤더가 application/xml로 설정된다", async () => {
		const { context } = makeContext("", {
			SITE_LAUNCHED: "false",
			SITE_ORIGIN: "https://tkstar.dev",
		});

		const res = await loader({ context } as never);

		expect(res.headers.get("Content-Type")).toMatch(/^application\/xml/);
	});

	it("응답 body가 빈 urlset XML이다", async () => {
		const { context } = makeContext("", {
			SITE_LAUNCHED: "false",
			SITE_ORIGIN: "https://tkstar.dev",
		});

		const res = await loader({ context } as never);
		const body = await res.text();

		expect(body).toBe(
			'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
		);
	});

	it("container.buildSitemap이 호출되지 않는다", async () => {
		const { context, spies } = makeContext("", {
			SITE_LAUNCHED: "false",
			SITE_ORIGIN: "https://tkstar.dev",
		});

		await loader({ context } as never);

		expect(spies.buildSitemap).not.toHaveBeenCalled();
	});
});

describe("sitemap[.xml] loader — isLaunched 엄격 동등 검사 (defense-in-depth)", () => {
	it("SITE_LAUNCHED='yes'는 미출시로 처리되어 빈 urlset을 반환하고 buildSitemap을 호출하지 않는다", async () => {
		const { context, spies } = makeContext("", {
			SITE_LAUNCHED: "yes",
			SITE_ORIGIN: "https://tkstar.dev",
		});

		const res = await loader({ context } as never);
		const body = await res.text();

		expect(body).toBe(
			'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
		);
		expect(spies.buildSitemap).not.toHaveBeenCalled();
	});
});
