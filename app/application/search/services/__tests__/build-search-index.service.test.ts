import { describe, expect, it } from "vitest";
import {
	buildSearchIndex,
	type ProjectIndexInput,
	type PostIndexInput,
} from "../build-search-index.service";

describe("buildSearchIndex", () => {
	const project: ProjectIndexInput = {
		slug: "example-project",
		title: "Example Project",
		summary: "Phase 2 검증용 시드 프로젝트",
		tags: ["seed", "infra"],
		// body는 입력 시에는 들어올 수 있어도 출력에서는 제외되어야 함
		body: "function _createMdxContent() { /* huge mdx body */ }",
	};

	const post: PostIndexInput = {
		slug: "2026-04-shipping-solo",
		title: "1인 기업으로 출발하기",
		lede: "tkstar.dev 첫 글",
		date: "2026-04-28",
		read: 3,
		tags: ["solo", "ops"],
		body: "function _createMdxContent() { /* huge mdx body */ }",
	};

	it("정적 라우트 6개를 pages 그룹에 정해진 순서로 포함한다", () => {
		// Arrange & Act
		const result = buildSearchIndex({ projects: [], posts: [] });

		// Assert
		expect(result.pages.map((p: { slug: string }) => p.slug)).toEqual([
			"/",
			"/about",
			"/projects",
			"/blog",
			"/contact",
			"/legal",
		]);
	});

	it("pages 항목은 title 과 summary 가 비어있지 않다", () => {
		// Arrange & Act
		const result = buildSearchIndex({ projects: [], posts: [] });

		// Assert
		for (const page of result.pages) {
			expect(page.title.length).toBeGreaterThan(0);
			expect(page.summary?.length ?? 0).toBeGreaterThan(0);
		}
	});

	it("projects 입력을 SearchableItem 형태로 매핑하고 입력 순서를 유지한다", () => {
		// Arrange
		const second: ProjectIndexInput = {
			slug: "second-project",
			title: "Second",
			summary: "두 번째",
			tags: [],
			body: "body content",
		};

		// Act
		const result = buildSearchIndex({ projects: [project, second], posts: [] });

		// Assert
		expect(result.projects).toHaveLength(2);
		expect(result.projects[0].slug).toBe("example-project");
		expect(result.projects[1].slug).toBe("second-project");
		expect(result.projects[0].title).toBe("Example Project");
		expect(result.projects[0].summary).toBe("Phase 2 검증용 시드 프로젝트");
		expect(result.projects[0].tags).toEqual(["seed", "infra"]);
	});

	it("posts 입력의 lede 를 summary 로 정규화하고 lede 키는 출력에 남기지 않는다", () => {
		// Arrange & Act
		const result = buildSearchIndex({ projects: [], posts: [post] });

		// Assert
		expect(result.posts).toHaveLength(1);
		expect(result.posts[0].slug).toBe("2026-04-shipping-solo");
		expect(result.posts[0].title).toBe("1인 기업으로 출발하기");
		expect(result.posts[0].summary).toBe("tkstar.dev 첫 글");
		expect("lede" in result.posts[0]).toBe(false);
	});

	it("출력 항목 어디에도 body 키가 포함되지 않는다", () => {
		// Arrange & Act
		const result = buildSearchIndex({ projects: [project], posts: [post] });

		// Assert — pages / projects / posts 모든 그룹에 body 부재
		const all = [...result.pages, ...result.projects, ...result.posts];
		for (const item of all) {
			expect("body" in item).toBe(false);
		}
	});

	it("JSON 직렬화 size 가 150KB 이하다 (gzip ~100KB 환산)", () => {
		// Arrange — 100개 프로젝트 + 200개 포스트로 양산
		const projects: ProjectIndexInput[] = Array.from({ length: 100 }, (_, i) => ({
			slug: `project-${i}`,
			title: `Project Title ${i} — long enough name for realism`,
			summary: "프로젝트 요약 한 두 문장 정도 길이로 작성됩니다.",
			tags: ["solo", "infra", "ts"],
			body: "this body should not appear in the output",
		}));
		const posts: PostIndexInput[] = Array.from({ length: 200 }, (_, i) => ({
			slug: `post-${i}`,
			title: `Post ${i}`,
			lede: "포스트 한 줄 요약 ~ 두 줄 정도 길이.",
			date: "2026-04-20",
			read: 6,
			tags: ["ops"],
			body: "should not appear",
		}));

		// Act
		const result = buildSearchIndex({ projects, posts });
		const json = JSON.stringify(result);

		// Assert
		expect(json.length).toBeLessThanOrEqual(150 * 1024);
	});

	it("결과의 pages/projects 는 SearchableItem 형태({slug,title,summary,tags?})만, posts 는 추가로 date/read 만 노출한다", () => {
		// Arrange & Act
		const result = buildSearchIndex({ projects: [project], posts: [post] });

		// Assert — pages / projects 는 SearchableItem 키 셋
		const baseAllowed = new Set(["slug", "title", "summary", "tags"]);
		for (const item of [...result.pages, ...result.projects]) {
			for (const key of Object.keys(item)) {
				expect(baseAllowed.has(key)).toBe(true);
			}
		}

		// posts 는 base + date/read 만 허용
		const postAllowed = new Set(["slug", "title", "summary", "tags", "date", "read"]);
		for (const item of result.posts) {
			for (const key of Object.keys(item)) {
				expect(postAllowed.has(key)).toBe(true);
			}
		}
	});

	it("posts 출력에 date 와 read 필드가 보존된다", () => {
		// Arrange & Act
		const result = buildSearchIndex({ projects: [], posts: [post] });

		// Assert
		expect(result.posts[0].date).toBe("2026-04-28");
		expect(result.posts[0].read).toBe(3);
	});
});
