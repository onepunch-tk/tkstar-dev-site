import { describe, expect, it } from "vitest";
import { extractToc } from "../extract-toc";

describe("extractToc", () => {
	it("단순 h2 3개를 추출한다", () => {
		// Arrange
		const markdown = "## Problem\n## Approach\n## Results";

		// Act
		const toc = extractToc(markdown);

		// Assert
		expect(toc).toHaveLength(3);
		expect(toc[0]).toEqual({ slug: "problem", text: "Problem" });
		expect(toc[1]).toEqual({ slug: "approach", text: "Approach" });
		expect(toc[2]).toEqual({ slug: "results", text: "Results" });
	});

	it("펜스 코드 블록 안의 ## 는 무시한다", () => {
		// Arrange
		// 백틱 3개를 포함한 마크다운을 문자열 연결로 구성
		const fence = "```";
		const markdown = [
			"## Real",
			`${fence}md`,
			"## Fake inside fence",
			fence,
			"## After fence",
		].join("\n");

		// Act
		const toc = extractToc(markdown);

		// Assert
		expect(toc).toHaveLength(2);
		expect(toc[0]).toEqual({ slug: "real", text: "Real" });
		expect(toc[1]).toEqual({ slug: "after-fence", text: "After fence" });
	});

	it("빈 마크다운은 빈 배열을 반환한다", () => {
		// Arrange
		const markdown = "";

		// Act
		const toc = extractToc(markdown);

		// Assert
		expect(toc).toEqual([]);
	});

	it("한국어 헤딩의 slug 는 공백을 하이픈으로 변환한다", () => {
		// Arrange
		const markdown = "## 문제 정의";

		// Act
		const toc = extractToc(markdown);

		// Assert
		expect(toc).toHaveLength(1);
		expect(toc[0]).toEqual({ slug: "문제-정의", text: "문제 정의" });
	});

	it("중복 헤딩은 github-slugger 방식으로 deduplication 한다", () => {
		// Arrange
		const markdown = "## Problem\n## Problem";

		// Act
		const toc = extractToc(markdown);

		// Assert
		expect(toc).toHaveLength(2);
		expect(toc[0]).toEqual({ slug: "problem", text: "Problem" });
		expect(toc[1]).toEqual({ slug: "problem-1", text: "Problem" });
	});
});
