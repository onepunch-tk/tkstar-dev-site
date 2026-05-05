// velite raw output shape를 모방한 fixture
// date desc 정렬 기준: delta(2026-04-26) > charlie(2026-04-25) > bravo(2026-04-24) > alpha(2026-04-23)
// "react" 태그는 delta에만 포함 → findByTag("react") 검증용

export const postAlpha = {
	slug: "alpha",
	title: "Alpha Post",
	lede: "Alpha 포스트 요약입니다.",
	date: "2026-04-23T00:00:00.000Z",
	tags: ["typescript"],
	read: 3,
	body: "",
};

export const postBravo = {
	slug: "bravo",
	title: "Bravo Post",
	lede: "Bravo 포스트 요약입니다.",
	date: "2026-04-24T00:00:00.000Z",
	tags: ["node"],
	read: 5,
	body: "",
};

export const postCharlie = {
	slug: "charlie",
	title: "Charlie Post",
	lede: "Charlie 포스트 요약입니다.",
	date: "2026-04-25T00:00:00.000Z",
	tags: ["vitest"],
	read: 7,
	body: "",
};

export const postDelta = {
	slug: "delta",
	title: "Delta Post",
	lede: "Delta 포스트 요약입니다.",
	date: "2026-04-26T00:00:00.000Z",
	tags: ["react"],
	read: 4,
	body: "",
};

// 전체 배열 (velite 출력 순서 — 정렬 전 raw)
export const fixturePosts = [postAlpha, postBravo, postCharlie, postDelta];
