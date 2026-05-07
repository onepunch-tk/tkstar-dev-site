import { describe, expect, it } from "vitest";
import { computeBodyHash } from "../compile-post-body.service";

describe("computeBodyHash", () => {
	it("같은 input 은 같은 hex 를 반환한다", async () => {
		// Arrange
		const markdown = "# Hello\n\nThis is a test post.";

		// Act
		const hash1 = await computeBodyHash(markdown);
		const hash2 = await computeBodyHash(markdown);

		// Assert
		expect(hash1).toBe(hash2);
	});

	it("다른 input 은 다른 hex 를 반환한다", async () => {
		// Arrange
		const markdownA = "# Post A\n\nFirst content.";
		const markdownB = "# Post B\n\nSecond content.";

		// Act
		const hashA = await computeBodyHash(markdownA);
		const hashB = await computeBodyHash(markdownB);

		// Assert
		expect(hashA).not.toBe(hashB);
	});

	it("결과 길이가 정확히 16 자이다", async () => {
		// Arrange
		const markdown = "## 제목\n\n본문 내용입니다.";

		// Act
		const hash = await computeBodyHash(markdown);

		// Assert
		expect(hash).toHaveLength(16);
	});

	it("결과가 `[0-9a-f]{16}` 형식의 hex string 이다", async () => {
		// Arrange
		const markdown = "Some markdown content with **bold** and _italic_.";

		// Act
		const hash = await computeBodyHash(markdown);

		// Assert
		expect(hash).toMatch(/^[0-9a-f]{16}$/);
	});

	it("빈 문자열 입력에도 16 자 hex 를 반환한다", async () => {
		// Arrange
		const markdown = "";

		// Act
		const hash1 = await computeBodyHash(markdown);
		const hash2 = await computeBodyHash(markdown);

		// Assert
		expect(hash1).toHaveLength(16);
		expect(hash1).toMatch(/^[0-9a-f]{16}$/);
		// deterministic 확인
		expect(hash1).toBe(hash2);
	});
});
