import { describe, expect, it } from "vitest";
import type { MetaDescriptor } from "react-router";
import { buildMeta } from "../meta";

describe("buildMeta", () => {
	describe("기본 최소 입력 (title, description, canonical, ogImage 만 전달)", () => {
		it("title 메타 태그를 포함한다", () => {
			// Arrange
			const input = {
				title: "테스트 페이지",
				description: "페이지 설명입니다.",
				canonical: "https://tkstar.dev/about",
				ogImage: "https://tkstar.dev/og/fallback.png",
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([expect.objectContaining({ title: "테스트 페이지" })]),
			);
		});

		it("description 메타 태그를 포함한다", () => {
			// Arrange
			const input = {
				title: "테스트 페이지",
				description: "페이지 설명입니다.",
				canonical: "https://tkstar.dev/about",
				ogImage: "https://tkstar.dev/og/fallback.png",
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ name: "description", content: "페이지 설명입니다." }),
				]),
			);
		});

		it("canonical link 태그를 포함한다", () => {
			// Arrange
			const input = {
				title: "테스트 페이지",
				description: "페이지 설명입니다.",
				canonical: "https://tkstar.dev/about",
				ogImage: "https://tkstar.dev/og/fallback.png",
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						tagName: "link",
						rel: "canonical",
						href: "https://tkstar.dev/about",
					}),
				]),
			);
		});

		it("OG 태그(og:title, og:description, og:url, og:image, og:type=website)를 포함한다", () => {
			// Arrange
			const input = {
				title: "테스트 페이지",
				description: "페이지 설명입니다.",
				canonical: "https://tkstar.dev/about",
				ogImage: "https://tkstar.dev/og/fallback.png",
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ property: "og:title", content: "테스트 페이지" }),
					expect.objectContaining({ property: "og:description", content: "페이지 설명입니다." }),
					expect.objectContaining({ property: "og:url", content: "https://tkstar.dev/about" }),
					expect.objectContaining({
						property: "og:image",
						content: "https://tkstar.dev/og/fallback.png",
					}),
					expect.objectContaining({ property: "og:type", content: "website" }),
				]),
			);
		});

		it("OG 이미지 기본 크기(1200×630)를 포함한다", () => {
			// Arrange
			const input = {
				title: "테스트 페이지",
				description: "페이지 설명입니다.",
				canonical: "https://tkstar.dev/about",
				ogImage: "https://tkstar.dev/og/fallback.png",
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ property: "og:image:width", content: "1200" }),
					expect.objectContaining({ property: "og:image:height", content: "630" }),
				]),
			);
		});

		it("Twitter Card 태그(summary_large_image, title, description, image)를 포함한다", () => {
			// Arrange
			const input = {
				title: "테스트 페이지",
				description: "페이지 설명입니다.",
				canonical: "https://tkstar.dev/about",
				ogImage: "https://tkstar.dev/og/fallback.png",
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ name: "twitter:card", content: "summary_large_image" }),
					expect.objectContaining({ name: "twitter:title", content: "테스트 페이지" }),
					expect.objectContaining({ name: "twitter:description", content: "페이지 설명입니다." }),
					expect.objectContaining({
						name: "twitter:image",
						content: "https://tkstar.dev/og/fallback.png",
					}),
				]),
			);
		});

		it("robots 미전달 시 robots 메타 태그를 포함하지 않는다", () => {
			// Arrange
			const input = {
				title: "테스트 페이지",
				description: "페이지 설명입니다.",
				canonical: "https://tkstar.dev/about",
				ogImage: "https://tkstar.dev/og/fallback.png",
			};

			// Act
			const result = buildMeta(input);

			// Assert
			const hasRobots = (result as MetaDescriptor[]).some(
				(tag) => "name" in tag && tag.name === "robots",
			);
			expect(hasRobots).toBe(false);
		});
	});

	describe("ogType: 'article' 전달 시", () => {
		it("og:type 값이 'article'로 설정된다", () => {
			// Arrange
			const input = {
				title: "블로그 글",
				description: "글 설명",
				canonical: "https://tkstar.dev/blog/my-post",
				ogImage: "https://tkstar.dev/og/blog/my-post.png",
				ogType: "article" as const,
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ property: "og:type", content: "article" }),
				]),
			);
		});
	});

	describe("robots: 'noindex, follow' 전달 시", () => {
		it("robots 메타 태그가 'noindex, follow' 값으로 포함된다", () => {
			// Arrange
			const input = {
				title: "약관 페이지",
				description: "이용약관",
				canonical: "https://tkstar.dev/legal/some-app/terms",
				ogImage: "https://tkstar.dev/og/fallback.png",
				robots: "noindex, follow" as const,
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ name: "robots", content: "noindex, follow" }),
				]),
			);
		});
	});

	describe("robots: 'noindex, nofollow' 전달 시", () => {
		it("robots 메타 태그가 'noindex, nofollow' 값으로 포함된다", () => {
			// Arrange
			const input = {
				title: "404 페이지",
				description: "찾을 수 없는 페이지",
				canonical: "https://tkstar.dev/not-found",
				ogImage: "https://tkstar.dev/og/fallback.png",
				robots: "noindex, nofollow" as const,
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ name: "robots", content: "noindex, nofollow" }),
				]),
			);
		});
	});

	describe("커스텀 ogImageWidth / ogImageHeight 전달 시", () => {
		it("og:image:width와 og:image:height가 지정된 값으로 오버라이드된다", () => {
			// Arrange
			const input = {
				title: "커스텀 이미지 페이지",
				description: "커스텀 크기 OG 이미지",
				canonical: "https://tkstar.dev/projects/my-project",
				ogImage: "https://tkstar.dev/og/projects/my-project.png",
				ogImageWidth: 800,
				ogImageHeight: 400,
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ property: "og:image:width", content: "800" }),
					expect.objectContaining({ property: "og:image:height", content: "400" }),
				]),
			);
		});
	});

	describe("모든 입력을 함께 전달하는 조합 스모크 테스트", () => {
		it("article + noindex + 커스텀 크기 조합에서 모든 태그가 올바르게 포함된다", () => {
			// Arrange
			const input = {
				title: "종합 테스트",
				description: "모든 옵션 조합 테스트",
				canonical: "https://tkstar.dev/blog/full-test",
				ogImage: "https://tkstar.dev/og/blog/full-test.png",
				ogType: "article" as const,
				robots: "noindex, follow" as const,
				ogImageWidth: 1000,
				ogImageHeight: 500,
			};

			// Act
			const result = buildMeta(input);

			// Assert
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ title: "종합 테스트" }),
					expect.objectContaining({ name: "description", content: "모든 옵션 조합 테스트" }),
					expect.objectContaining({
						tagName: "link",
						rel: "canonical",
						href: "https://tkstar.dev/blog/full-test",
					}),
					expect.objectContaining({ property: "og:type", content: "article" }),
					expect.objectContaining({ name: "robots", content: "noindex, follow" }),
					expect.objectContaining({ property: "og:image:width", content: "1000" }),
					expect.objectContaining({ property: "og:image:height", content: "500" }),
					expect.objectContaining({ name: "twitter:card", content: "summary_large_image" }),
				]),
			);
		});
	});
});
