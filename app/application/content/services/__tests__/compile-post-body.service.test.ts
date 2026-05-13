import type { Root as HastRoot } from "hast";
import { describe, expect, it, vi } from "vitest";
import type { CompileMarkdown } from "~/application/content/ports/markdown-compiler.port";
import type { PostBodyCache } from "~/application/content/ports/post-body-cache.port";
import { compilePostBody, computeBodyHash } from "../compile-post-body.service";

const makeFixture = (label: string): HastRoot => ({
	type: "root",
	children: [{ type: "text", value: label }],
});

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

describe("compilePostBody", () => {
	// 테스트마다 새 mock 생성 — 호출 기록이 섞이지 않도록
	const makeMocks = () => {
		const fakeHast = makeFixture("compiled");
		const cache: PostBodyCache = {
			get: vi.fn(),
			set: vi.fn(),
		};
		const compile: CompileMarkdown = vi.fn().mockResolvedValue(fakeHast);
		return { cache, compile, fakeHast };
	};

	it("cache miss → compile 호출 → cache.set 호출 → cacheHit:false 반환", async () => {
		// Arrange
		const { cache, compile, fakeHast } = makeMocks();
		vi.mocked(cache.get).mockResolvedValue(null);
		vi.mocked(cache.set).mockResolvedValue(undefined);
		const slug = "post-1";
		const rawMarkdown = "# heading";

		// Act
		const result = await compilePostBody(cache, compile, { slug, rawMarkdown });

		// Assert
		expect(cache.get).toHaveBeenCalledOnce();
		expect(cache.get).toHaveBeenCalledWith(slug, expect.stringMatching(/^[0-9a-f]{16}$/));

		expect(compile).toHaveBeenCalledOnce();
		expect(compile).toHaveBeenCalledWith(rawMarkdown);

		expect(cache.set).toHaveBeenCalledOnce();
		expect(cache.set).toHaveBeenCalledWith(slug, expect.stringMatching(/^[0-9a-f]{16}$/), fakeHast);

		expect(result.cacheHit).toBe(false);
		expect(result.hast).toEqual(fakeHast);
		expect(result.hash).toMatch(/^[0-9a-f]{16}$/);
	});

	it("cache hit → compile 미호출 → cacheHit:true 반환", async () => {
		// Arrange
		const { cache, compile } = makeMocks();
		const cachedHast = makeFixture("from-cache");
		vi.mocked(cache.get).mockResolvedValue(cachedHast);
		vi.mocked(cache.set).mockResolvedValue(undefined);
		const slug = "post-1";
		const rawMarkdown = "# heading";

		// Act
		const result = await compilePostBody(cache, compile, { slug, rawMarkdown });

		// Assert
		expect(compile).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
		expect(result.cacheHit).toBe(true);
		expect(result.hast).toEqual(cachedHast);
		expect(result.hash).toMatch(/^[0-9a-f]{16}$/);
	});

	it("반환된 hash 는 computeBodyHash(rawMarkdown) 와 일치한다", async () => {
		// Arrange
		const { cache, compile } = makeMocks();
		vi.mocked(cache.get).mockResolvedValue(null);
		vi.mocked(cache.set).mockResolvedValue(undefined);
		const rawMarkdown = "## 해시 검증용 마크다운";

		// Act
		const result = await compilePostBody(cache, compile, { slug: "s", rawMarkdown });
		const expected = await computeBodyHash(rawMarkdown);

		// Assert
		expect(result.hash).toBe(expected);
	});

	it("다른 rawMarkdown → 다른 hash 로 cache.get 호출된다", async () => {
		// Arrange
		const { cache: cacheA, compile: compileA } = makeMocks();
		vi.mocked(cacheA.get).mockResolvedValue(null);
		vi.mocked(cacheA.set).mockResolvedValue(undefined);

		const { cache: cacheB, compile: compileB } = makeMocks();
		vi.mocked(cacheB.get).mockResolvedValue(null);
		vi.mocked(cacheB.set).mockResolvedValue(undefined);

		const slug = "same-slug";
		const rawMarkdownA = "# 첫 번째 내용";
		const rawMarkdownB = "# 두 번째 내용";

		// Act
		await compilePostBody(cacheA, compileA, { slug, rawMarkdown: rawMarkdownA });
		await compilePostBody(cacheB, compileB, { slug, rawMarkdown: rawMarkdownB });

		// Assert — cache.get 두 번째 인자(hash)가 서로 다름
		const [[, hashA]] = vi.mocked(cacheA.get).mock.calls;
		const [[, hashB]] = vi.mocked(cacheB.get).mock.calls;
		expect(hashA).not.toBe(hashB);
	});

	it("miss 경로의 cache.set 인자가 (slug, hash, hast) 형식으로 정확하다", async () => {
		// Arrange
		const { cache, compile, fakeHast } = makeMocks();
		vi.mocked(cache.get).mockResolvedValue(null);
		vi.mocked(cache.set).mockResolvedValue(undefined);
		const slug = "abc";
		const rawMarkdown = "x";

		// Act
		await compilePostBody(cache, compile, { slug, rawMarkdown });

		// Assert
		const expectedHash = await computeBodyHash(rawMarkdown);
		expect(cache.set).toHaveBeenCalledWith(slug, expectedHash, fakeHast);
	});
});
