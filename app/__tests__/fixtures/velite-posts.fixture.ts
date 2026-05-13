import type { Post } from "~/domain/post/post.entity";

// D1 Post entity fixture (camelCase). createdAt 정렬 기준:
//   delta(t-1) > charlie(t-2) > bravo(t-3) > alpha(t-4)
// "react" 태그는 delta 에만 포함 → findByTag("react") 검증용

const T = 1714291200; // base unix epoch (2024-04-28T08:00:00Z)

export const postAlpha: Post = {
	slug: "alpha",
	title: "Alpha Post",
	summary: "Alpha 포스트 요약입니다.",
	datePublished: "2026-04-23",
	tags: ["typescript"],
	status: "published",
	createdAt: T - 86400 * 4,
	updatedAt: T - 86400 * 4,
};

export const postBravo: Post = {
	slug: "bravo",
	title: "Bravo Post",
	summary: "Bravo 포스트 요약입니다.",
	datePublished: "2026-04-24",
	tags: ["node"],
	status: "published",
	createdAt: T - 86400 * 3,
	updatedAt: T - 86400 * 3,
};

export const postCharlie: Post = {
	slug: "charlie",
	title: "Charlie Post",
	summary: "Charlie 포스트 요약입니다.",
	datePublished: "2026-04-25",
	tags: ["vitest"],
	status: "published",
	createdAt: T - 86400 * 2,
	updatedAt: T - 86400 * 2,
};

export const postDelta: Post = {
	slug: "delta",
	title: "Delta Post",
	summary: "Delta 포스트 요약입니다.",
	datePublished: "2026-04-26",
	tags: ["react"],
	status: "published",
	createdAt: T - 86400,
	updatedAt: T - 86400,
};

export const fixturePosts: Post[] = [postAlpha, postBravo, postCharlie, postDelta];
