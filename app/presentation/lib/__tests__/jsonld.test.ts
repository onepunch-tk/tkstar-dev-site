import { describe, expect, it } from "vitest";
import {
	buildBlogPostingLd,
	buildBreadcrumbListLd,
	buildCreativeWorkLd,
	buildPersonLd,
} from "~/presentation/lib/jsonld";

describe("buildPersonLd", () => {
	it("@context와 @type이 올바르게 설정된다", () => {
		// Arrange
		const input = { origin: "https://tkstar.dev" };

		// Act
		const result = buildPersonLd(input);

		// Assert
		expect(result["@context"]).toBe("https://schema.org");
		expect(result["@type"]).toBe("Person");
	});

	it("name, email, url 필드가 올바른 값으로 포함된다", () => {
		// Arrange
		const input = { origin: "https://tkstar.dev" };

		// Act
		const result = buildPersonLd(input);

		// Assert
		expect(result.name).toBe("김태곤");
		expect(result.email).toBe("hello@tkstar.dev");
		expect(result.url).toBe("https://tkstar.dev");
	});

	it("sameAs 배열에 GitHub URL이 포함된다", () => {
		// Arrange
		const input = { origin: "https://tkstar.dev" };

		// Act
		const result = buildPersonLd(input);

		// Assert
		expect(result.sameAs).toEqual(["https://github.com/onepunch-tk"]);
	});

	it("image 필드를 포함하지 않는다", () => {
		// Arrange
		const input = { origin: "https://tkstar.dev" };

		// Act
		const result = buildPersonLd(input);

		// Assert
		expect(result).not.toHaveProperty("image");
	});
});

describe("buildBlogPostingLd", () => {
	it("@context와 @type이 올바르게 설정된다", () => {
		// Arrange
		const post = {
			slug: "my-post",
			title: "My Post",
			lede: "post lede",
			date: "2026-04-15",
			tags: ["typescript"],
			read: 5,
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/blog/my-post.png";

		// Act
		const result = buildBlogPostingLd({ post, origin, ogImage });

		// Assert
		expect(result["@context"]).toBe("https://schema.org");
		expect(result["@type"]).toBe("BlogPosting");
	});

	it("headline과 description이 post의 title, lede로 설정된다", () => {
		// Arrange
		const post = {
			slug: "my-post",
			title: "My Post",
			lede: "post lede",
			date: "2026-04-15",
			tags: ["typescript"],
			read: 5,
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/blog/my-post.png";

		// Act
		const result = buildBlogPostingLd({ post, origin, ogImage });

		// Assert
		expect(result.headline).toBe("My Post");
		expect(result.description).toBe("post lede");
	});

	it("datePublished이 post.date로 설정된다", () => {
		// Arrange
		const post = {
			slug: "my-post",
			title: "My Post",
			lede: "post lede",
			date: "2026-04-15",
			tags: ["typescript"],
			read: 5,
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/blog/my-post.png";

		// Act
		const result = buildBlogPostingLd({ post, origin, ogImage });

		// Assert
		expect(result.datePublished).toBe("2026-04-15");
	});

	it("image가 ogImage URL로 설정된다", () => {
		// Arrange
		const post = {
			slug: "my-post",
			title: "My Post",
			lede: "post lede",
			date: "2026-04-15",
			tags: ["typescript"],
			read: 5,
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/blog/my-post.png";

		// Act
		const result = buildBlogPostingLd({ post, origin, ogImage });

		// Assert
		expect(result.image).toBe("https://tkstar.dev/og/blog/my-post.png");
	});

	it("mainEntityOfPage가 origin + /blog/:slug 경로로 설정된다", () => {
		// Arrange
		const post = {
			slug: "my-post",
			title: "My Post",
			lede: "post lede",
			date: "2026-04-15",
			tags: ["typescript"],
			read: 5,
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/blog/my-post.png";

		// Act
		const result = buildBlogPostingLd({ post, origin, ogImage });

		// Assert
		expect(result.mainEntityOfPage).toBe("https://tkstar.dev/blog/my-post");
	});

	it("inLanguage가 'ko'로 설정된다", () => {
		// Arrange
		const post = {
			slug: "my-post",
			title: "My Post",
			lede: "post lede",
			date: "2026-04-15",
			tags: ["typescript"],
			read: 5,
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/blog/my-post.png";

		// Act
		const result = buildBlogPostingLd({ post, origin, ogImage });

		// Assert
		expect(result.inLanguage).toBe("ko");
	});

	it("author가 Person 타입의 김태곤으로 설정된다", () => {
		// Arrange
		const post = {
			slug: "my-post",
			title: "My Post",
			lede: "post lede",
			date: "2026-04-15",
			tags: ["typescript"],
			read: 5,
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/blog/my-post.png";

		// Act
		const result = buildBlogPostingLd({ post, origin, ogImage });

		// Assert
		expect(result.author).toEqual(
			expect.objectContaining({
				"@type": "Person",
				name: "김태곤",
				url: "https://tkstar.dev",
			}),
		);
	});
});

describe("buildCreativeWorkLd", () => {
	it("@context와 @type이 올바르게 설정된다", () => {
		// Arrange
		const project = {
			slug: "my-project",
			title: "My Project",
			summary: "project summary",
			date: "2025-12-01",
			tags: [] as string[],
			stack: [] as string[],
			metrics: [] as [string, string][],
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/projects/my-project.png";

		// Act
		const result = buildCreativeWorkLd({ project, origin, ogImage });

		// Assert
		expect(result["@context"]).toBe("https://schema.org");
		expect(result["@type"]).toBe("CreativeWork");
	});

	it("name과 description이 project의 title, summary로 설정된다", () => {
		// Arrange
		const project = {
			slug: "my-project",
			title: "My Project",
			summary: "project summary",
			date: "2025-12-01",
			tags: [] as string[],
			stack: [] as string[],
			metrics: [] as [string, string][],
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/projects/my-project.png";

		// Act
		const result = buildCreativeWorkLd({ project, origin, ogImage });

		// Assert
		expect(result.name).toBe("My Project");
		expect(result.description).toBe("project summary");
	});

	it("datePublished이 project.date로 설정된다", () => {
		// Arrange
		const project = {
			slug: "my-project",
			title: "My Project",
			summary: "project summary",
			date: "2025-12-01",
			tags: [] as string[],
			stack: [] as string[],
			metrics: [] as [string, string][],
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/projects/my-project.png";

		// Act
		const result = buildCreativeWorkLd({ project, origin, ogImage });

		// Assert
		expect(result.datePublished).toBe("2025-12-01");
	});

	it("image가 ogImage URL로 설정된다", () => {
		// Arrange
		const project = {
			slug: "my-project",
			title: "My Project",
			summary: "project summary",
			date: "2025-12-01",
			tags: [] as string[],
			stack: [] as string[],
			metrics: [] as [string, string][],
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/projects/my-project.png";

		// Act
		const result = buildCreativeWorkLd({ project, origin, ogImage });

		// Assert
		expect(result.image).toBe("https://tkstar.dev/og/projects/my-project.png");
	});

	it("url이 origin + /projects/:slug 경로로 설정된다", () => {
		// Arrange
		const project = {
			slug: "my-project",
			title: "My Project",
			summary: "project summary",
			date: "2025-12-01",
			tags: [] as string[],
			stack: [] as string[],
			metrics: [] as [string, string][],
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/projects/my-project.png";

		// Act
		const result = buildCreativeWorkLd({ project, origin, ogImage });

		// Assert
		expect(result.url).toBe("https://tkstar.dev/projects/my-project");
	});

	it("inLanguage가 'ko'로 설정된다", () => {
		// Arrange
		const project = {
			slug: "my-project",
			title: "My Project",
			summary: "project summary",
			date: "2025-12-01",
			tags: [] as string[],
			stack: [] as string[],
			metrics: [] as [string, string][],
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/projects/my-project.png";

		// Act
		const result = buildCreativeWorkLd({ project, origin, ogImage });

		// Assert
		expect(result.inLanguage).toBe("ko");
	});

	it("author가 Person 타입의 김태곤으로 설정된다", () => {
		// Arrange
		const project = {
			slug: "my-project",
			title: "My Project",
			summary: "project summary",
			date: "2025-12-01",
			tags: [] as string[],
			stack: [] as string[],
			metrics: [] as [string, string][],
		};
		const origin = "https://tkstar.dev";
		const ogImage = "https://tkstar.dev/og/projects/my-project.png";

		// Act
		const result = buildCreativeWorkLd({ project, origin, ogImage });

		// Assert
		expect(result.author).toEqual(
			expect.objectContaining({
				"@type": "Person",
				name: "김태곤",
				url: "https://tkstar.dev",
			}),
		);
	});
});

describe("buildBreadcrumbListLd", () => {
	it("@context와 @type이 올바르게 설정된다", () => {
		// Arrange
		const items = [
			{ name: "Home", url: "https://tkstar.dev/" },
			{ name: "Blog", url: "https://tkstar.dev/blog" },
			{ name: "My Post", url: "https://tkstar.dev/blog/my-post" },
		];

		// Act
		const result = buildBreadcrumbListLd({ items });

		// Assert
		expect(result["@context"]).toBe("https://schema.org");
		expect(result["@type"]).toBe("BreadcrumbList");
	});

	it("itemListElement가 items 수와 동일한 3개 항목의 배열로 구성된다", () => {
		// Arrange
		const items = [
			{ name: "Home", url: "https://tkstar.dev/" },
			{ name: "Blog", url: "https://tkstar.dev/blog" },
			{ name: "My Post", url: "https://tkstar.dev/blog/my-post" },
		];

		// Act
		const result = buildBreadcrumbListLd({ items });

		// Assert
		expect(Array.isArray(result.itemListElement)).toBe(true);
		expect((result.itemListElement as unknown[]).length).toBe(3);
	});

	it("각 항목이 ListItem 타입으로 1-based position, name, item 필드를 포함한다", () => {
		// Arrange
		const items = [
			{ name: "Home", url: "https://tkstar.dev/" },
			{ name: "Blog", url: "https://tkstar.dev/blog" },
			{ name: "My Post", url: "https://tkstar.dev/blog/my-post" },
		];

		// Act
		const result = buildBreadcrumbListLd({ items });

		// Assert
		expect(result.itemListElement).toEqual([
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://tkstar.dev/" },
			{ "@type": "ListItem", position: 2, name: "Blog", item: "https://tkstar.dev/blog" },
			{
				"@type": "ListItem",
				position: 3,
				name: "My Post",
				item: "https://tkstar.dev/blog/my-post",
			},
		]);
	});

	it("빈 items 배열 전달 시 itemListElement가 빈 배열로 설정된다", () => {
		// Arrange
		const items: { name: string; url: string }[] = [];

		// Act
		const result = buildBreadcrumbListLd({ items });

		// Assert
		expect(result.itemListElement).toEqual([]);
	});
});
