import { describe, expect, it, vi } from "vitest";

import { loader } from "../rss[.xml]";

const makeContext = (xml: string) => {
	const buildRssFeed = vi.fn().mockResolvedValue(xml);
	return {
		context: {
			container: {
				listProjects: vi.fn(),
				getProjectDetail: vi.fn(),
				getFeaturedProject: vi.fn(),
				listPosts: vi.fn(),
				getPostDetail: vi.fn(),
				getRecentPosts: vi.fn(),
				buildRssFeed,
			},
			cloudflare: { env: {}, ctx: {} },
		},
		spies: { buildRssFeed },
	};
};

describe("rss[.xml] loader", () => {
	it("Content-Type 헤더가 application/xml로 설정된다", async () => {
		const { context } = makeContext('<?xml version="1.0"?><rss></rss>');

		const res = await loader({ context } as never);

		expect(res.headers.get("Content-Type")).toMatch(/^application\/xml/);
	});

	it("응답 body가 <?xml로 시작한다", async () => {
		const { context } = makeContext('<?xml version="1.0"?><rss></rss>');

		const res = await loader({ context } as never);
		const body = await res.text();

		expect(body.startsWith("<?xml")).toBe(true);
	});

	it("container.buildRssFeed()에 위임한다", async () => {
		const { context, spies } = makeContext('<?xml version="1.0"?><rss></rss>');

		await loader({ context } as never);

		expect(spies.buildRssFeed).toHaveBeenCalledOnce();
	});
});
