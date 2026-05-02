import { beforeEach, describe, expect, it } from "vitest";
import { getRecent, pushRecent, type RecentItem } from "../recent-visits";

describe("recent-visits", () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	it("스토리지가 비어 있을 때 getRecent()는 빈 배열을 반환한다", () => {
		// Act
		const result = getRecent();

		// Assert
		expect(result).toEqual([]);
	});

	it("pushRecent 후 getRecent()는 해당 아이템을 반환한다", () => {
		// Arrange
		const item: RecentItem = { slug: "home", title: "홈", group: "pages" };

		// Act
		pushRecent(item);
		const result = getRecent();

		// Assert
		expect(result).toEqual([item]);
	});

	it("가장 최근에 push한 아이템이 앞에 위치한다 (most-recent-first)", () => {
		// Arrange
		const a: RecentItem = { slug: "a", title: "A", group: "pages" };
		const b: RecentItem = { slug: "b", title: "B", group: "projects" };
		const c: RecentItem = { slug: "c", title: "C", group: "posts" };

		// Act
		pushRecent(a);
		pushRecent(b);
		pushRecent(c);
		const result = getRecent();

		// Assert
		expect(result).toEqual([c, b, a]);
	});

	it("6번째 아이템 push 시 최대 5개로 제한되고 가장 오래된 항목이 제거된다", () => {
		// Arrange
		const items: RecentItem[] = [
			{ slug: "first", title: "First", group: "pages" },
			{ slug: "second", title: "Second", group: "pages" },
			{ slug: "third", title: "Third", group: "pages" },
			{ slug: "fourth", title: "Fourth", group: "pages" },
			{ slug: "fifth", title: "Fifth", group: "pages" },
			{ slug: "sixth", title: "Sixth", group: "pages" },
		];

		// Act
		for (const item of items) {
			pushRecent(item);
		}
		const result = getRecent();

		// Assert
		expect(result).toHaveLength(5);
		expect(result.map((i: RecentItem) => i.slug)).not.toContain("first");
	});

	it("동일 slug push 시 기존 항목을 제거하고 새 메타데이터로 앞에 위치시킨다 (LRU move-to-front)", () => {
		// Arrange
		const aOriginal: RecentItem = { slug: "a", title: "A", group: "pages" };
		const b: RecentItem = { slug: "b", title: "B", group: "projects" };
		const aUpdated: RecentItem = { slug: "a", title: "updated A", group: "projects" };

		// Act
		pushRecent(aOriginal);
		pushRecent(b);
		pushRecent(aUpdated);
		const result = getRecent();

		// Assert
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual(aUpdated);
		expect(result[1]).toEqual(b);
	});

	it("pushRecent 후 getRecent()를 두 번 호출해도 동일한 결과를 반환한다 (sessionStorage 영속)", () => {
		// Arrange
		const item: RecentItem = { slug: "about", title: "About", group: "pages" };

		// Act
		pushRecent(item);
		const first = getRecent();
		const second = getRecent();

		// Assert
		expect(first).toEqual(second);
	});

	it("sessionStorage에 깨진 JSON이 있을 때 getRecent()는 빈 배열을 반환한다 (에러 미전파)", () => {
		// Arrange
		sessionStorage.setItem("tkstar-palette-recent", "not-json{{{");

		// Act
		const result = getRecent();

		// Assert
		expect(result).toEqual([]);
	});

	it("다양한 group 값이 sessionStorage를 통해 그대로 보존된다", () => {
		// Arrange
		const page: RecentItem = { slug: "home", title: "홈", group: "pages" };
		const project: RecentItem = { slug: "proj-a", title: "프로젝트 A", group: "projects" };
		const post: RecentItem = { slug: "post-1", title: "포스트 1", group: "posts" };

		// Act
		pushRecent(page);
		pushRecent(project);
		pushRecent(post);
		const result = getRecent();

		// Assert
		expect(result[0].group).toBe("posts");
		expect(result[1].group).toBe("projects");
		expect(result[2].group).toBe("pages");
	});
});
