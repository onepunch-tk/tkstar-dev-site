import { describe, expect, it } from "vitest";
import { tokenSearch, type SearchableItem } from "../token-search";

describe("tokenSearch", () => {
	it("빈 items 배열 입력 시 빈 배열을 반환한다", () => {
		// Arrange
		const items: SearchableItem[] = [];

		// Act
		const result = tokenSearch(items, "rou");

		// Assert
		expect(result).toEqual([]);
	});

	it("빈 쿼리 입력 시 모든 items를 원래 순서 그대로 반환한다", () => {
		// Arrange
		const items: SearchableItem[] = [
			{ slug: "a", title: "router navigation" },
			{ slug: "b", title: "component design" },
			{ slug: "c", title: "typescript guide" },
		];

		// Act (빈 문자열)
		const resultEmpty = tokenSearch(items, "");

		// Assert
		expect(resultEmpty).toEqual(items);
	});

	it("공백만 있는 쿼리 입력 시 모든 items를 원래 순서 그대로 반환한다", () => {
		// Arrange
		const items: SearchableItem[] = [
			{ slug: "a", title: "router navigation" },
			{ slug: "b", title: "component design" },
			{ slug: "c", title: "typescript guide" },
		];

		// Act (공백만 있는 쿼리)
		const resultWhitespace = tokenSearch(items, "   ");

		// Assert
		expect(resultWhitespace).toEqual(items);
	});

	it("AND 토큰 필터링: 모든 토큰이 매칭된 item만 반환한다", () => {
		// Arrange
		const items: SearchableItem[] = [
			{ slug: "a", title: "router navigation" },
			{ slug: "b", title: "router only" },
			{ slug: "c", title: "unrelated" },
		];

		// Act
		const result = tokenSearch(items, "rou nav");

		// Assert
		expect(result).toHaveLength(1);
		expect(result[0].slug).toBe("a");
	});

	it("토큰은 title, tags, summary 필드를 대소문자 구분 없이 검색하고 ANY 매칭으로 AND 조건을 충족한다", () => {
		// Arrange
		const items: SearchableItem[] = [
			{
				slug: "a",
				title: "intro post",
				tags: ["TYPESCRIPT"],
				summary: "cloudflare workers deploy guide",
			},
		];

		// Act — "typescript"는 tags에만, "cloudflare"는 summary에만 있음
		const result = tokenSearch(items, "typescript cloudflare");

		// Assert
		expect(result).toHaveLength(1);
		expect(result[0].slug).toBe("a");
	});

	it("가중치 점수 내림차순으로 정렬한다 (title +3 / tag +2 / summary +1)", () => {
		// Arrange
		const token = "vitest";
		const itemX: SearchableItem = {
			slug: "x",
			title: "testing guide",
			tags: ["testing"],
			summary: `learn vitest basics`,
		};
		const itemY: SearchableItem = {
			slug: "y",
			title: "testing guide",
			tags: [token],
			summary: "how to write tests",
		};
		const itemZ: SearchableItem = {
			slug: "z",
			title: `${token} deep dive`,
			tags: ["testing"],
			summary: "how to write tests",
		};

		// Act
		const result = tokenSearch([itemX, itemY, itemZ], token);

		// Assert — 점수: Z(title +3) > Y(tag +2) > X(summary +1)
		expect(result.map((i: SearchableItem) => i.slug)).toEqual(["z", "y", "x"]);
	});

	it("점수가 같은 items는 입력 배열 원래 순서를 유지한다 (stable tie-break)", () => {
		// Arrange — 두 items 모두 title에만 토큰이 있어 동점(+3)
		const token = "react";
		const first: SearchableItem = { slug: "first", title: `${token} patterns` };
		const second: SearchableItem = { slug: "second", title: `intro to ${token}` };

		// Act
		const result = tokenSearch([first, second], token);

		// Assert
		expect(result.map((i: SearchableItem) => i.slug)).toEqual(["first", "second"]);
	});

	it("제네릭 타입: 반환값이 T[]이므로 확장 타입의 추가 필드가 보존된다", () => {
		// Arrange
		type ProjectLike = SearchableItem & { kind: "project" };
		const items: ProjectLike[] = [
			{ slug: "proj-a", title: "router architecture", kind: "project" },
			{ slug: "proj-b", title: "unrelated content", kind: "project" },
		];

		// Act
		const result = tokenSearch(items, "router");

		// Assert — 캐스트 없이 kind 필드에 접근 가능
		expect(result).toHaveLength(1);
		expect(result[0].kind).toBe("project");
	});
});
