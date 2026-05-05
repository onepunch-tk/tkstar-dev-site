import { describe, expect, it } from "vitest";
import type { Post } from "~/domain/post/post.entity";
import type { Project } from "~/domain/project/project.entity";
import { buildSitemap } from "../build-sitemap.service";

// 공통 픽스처
const ORIGIN = "https://tkstar.dev";
const GENERATED_AT = new Date("2026-05-04T12:00:00Z");
const STATIC_LASTMOD = "2026-05-04";

type SitemapProject = Pick<Project, "slug" | "date">;
type SitemapPost = Pick<Post, "slug" | "date">;

const baseInput = {
	origin: ORIGIN,
	projects: [] as SitemapProject[],
	posts: [] as SitemapPost[],
	generatedAt: GENERATED_AT,
};

describe("buildSitemap — 출력 구조", () => {
	it("XML 선언으로 시작한다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true);
	});

	it("urlset 여는 태그에 sitemaps.org namespace가 포함된다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
	});

	it("</urlset>로 끝난다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
	});
});

describe("buildSitemap — 정적 URL (projects/posts 없음)", () => {
	it("루트 URL과 lastmod를 포함한다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		expect(xml).toContain(`<loc>${ORIGIN}/</loc>`);
		expect(xml).toContain(`<lastmod>${STATIC_LASTMOD}</lastmod>`);
	});

	it("/about URL을 포함한다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		expect(xml).toContain(`<loc>${ORIGIN}/about</loc>`);
	});

	it("/projects URL을 포함한다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		expect(xml).toContain(`<loc>${ORIGIN}/projects</loc>`);
	});

	it("/blog URL을 포함한다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		expect(xml).toContain(`<loc>${ORIGIN}/blog</loc>`);
	});

	it("/contact URL을 포함한다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		expect(xml).toContain(`<loc>${ORIGIN}/contact</loc>`);
	});

	it("/legal URL을 포함한다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		expect(xml).toContain(`<loc>${ORIGIN}/legal</loc>`);
	});
});

describe("buildSitemap — 동적 프로젝트 URL", () => {
	const projects: SitemapProject[] = [
		{ slug: "alpha", date: "2025-12-01" },
		{ slug: "beta", date: "2026-01-15" },
	];

	it("alpha 슬러그와 lastmod를 포함한다", () => {
		// Arrange & Act
		const xml = buildSitemap({ ...baseInput, projects });

		// Assert
		expect(xml).toContain(`<loc>${ORIGIN}/projects/alpha</loc>`);
		expect(xml).toContain(`<lastmod>2025-12-01</lastmod>`);
	});

	it("beta 슬러그와 lastmod를 포함한다", () => {
		// Arrange & Act
		const xml = buildSitemap({ ...baseInput, projects });

		// Assert
		expect(xml).toContain(`<loc>${ORIGIN}/projects/beta</loc>`);
		expect(xml).toContain(`<lastmod>2026-01-15</lastmod>`);
	});
});

describe("buildSitemap — 동적 포스트 URL", () => {
	const posts: SitemapPost[] = [{ slug: "first-post", date: "2026-04-15" }];

	it("first-post 슬러그와 lastmod를 포함한다", () => {
		// Arrange & Act
		const xml = buildSitemap({ ...baseInput, posts });

		// Assert
		expect(xml).toContain(`<loc>${ORIGIN}/blog/first-post</loc>`);
		expect(xml).toContain(`<lastmod>2026-04-15</lastmod>`);
	});
});

describe("buildSitemap — 날짜 정규화", () => {
	it("post.date가 ISO 타임스탬프여도 lastmod는 날짜만 출력된다", () => {
		// Arrange
		const posts: SitemapPost[] = [{ slug: "ts-post", date: "2026-04-15T10:30:00Z" }];

		// Act
		const xml = buildSitemap({ ...baseInput, posts });

		// Assert
		expect(xml).toContain(`<lastmod>2026-04-15</lastmod>`);
		expect(xml).not.toContain("T10:30:00");
	});
});

describe("buildSitemap — 제외 URL 검증", () => {
	it("/legal/:app/terms 경로가 출력에 포함되지 않는다", () => {
		// Arrange — 슬러그 값이 앱 이름과 같더라도 /legal/:app/terms는 생성 안 됨
		const projects: SitemapProject[] = [{ slug: "some-app", date: "2026-01-01" }];

		// Act
		const xml = buildSitemap({ ...baseInput, projects });

		// Assert
		expect(xml).not.toContain("/legal/some-app/terms");
		expect(xml).not.toContain("/legal/some-app/privacy");
	});

	it("/og/, /rss.xml, /sitemap.xml, /robots.txt 경로가 포함되지 않는다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		expect(xml).not.toContain("/og/");
		expect(xml).not.toContain("/rss.xml");
		expect(xml).not.toContain("/sitemap.xml");
		expect(xml).not.toContain("/robots.txt");
	});
});

describe("buildSitemap — XML 이스케이프", () => {
	it("슬러그에 & 또는 < 이 포함될 경우 올바르게 이스케이프된다", () => {
		// Arrange
		const projects: SitemapProject[] = [{ slug: "a&b", date: "2026-01-01" }];

		// Act
		const xml = buildSitemap({ ...baseInput, projects });

		// Assert
		expect(xml).toContain("&amp;");
		expect(xml).not.toContain("a&b");
	});
});

describe("buildSitemap — 커스텀 origin", () => {
	it("origin이 다른 도메인이면 해당 도메인으로 URL이 생성된다", () => {
		// Arrange
		const previewOrigin = "https://preview.example.com";

		// Act
		const xml = buildSitemap({ ...baseInput, origin: previewOrigin });

		// Assert
		expect(xml).toContain(`<loc>${previewOrigin}/about</loc>`);
	});
});

describe("buildSitemap — 빈 입력", () => {
	it("projects와 posts가 모두 빈 배열이면 정적 URL 6개만 포함된다", () => {
		// Arrange & Act
		const xml = buildSitemap(baseInput);

		// Assert
		const locCount = xml.match(/<loc>/g)?.length ?? 0;
		expect(locCount).toBe(6);
	});
});
