// velite raw output shape를 모방한 fixture
// date desc 정렬 기준: gamma(2026-04-27) > beta(2026-04-26) > alpha(2026-04-25)
// "infra" 태그는 gamma에만 포함 → findByTag("infra") 검증용

export const projectAlpha = {
	slug: "alpha",
	title: "Alpha Project",
	summary: "Alpha 프로젝트 요약입니다.",
	date: "2026-04-25T00:00:00.000Z",
	tags: ["frontend", "react"],
	stack: ["React", "TypeScript"],
	metrics: [
		["성능", "95점"],
		["접근성", "100점"],
	] as [string, string][],
	featured: undefined as boolean | undefined,
	cover: undefined as string | undefined,
	body: "",
};

export const projectBeta = {
	slug: "beta",
	title: "Beta Project",
	summary: "Beta 프로젝트 요약입니다.",
	date: "2026-04-26T00:00:00.000Z",
	tags: ["backend", "node"],
	stack: ["Node.js", "TypeScript"],
	metrics: [
		["응답속도", "120ms"],
		["가용성", "99.9%"],
	] as [string, string][],
	featured: true,
	cover: "/images/beta-cover.png",
	body: "",
};

export const projectGamma = {
	slug: "gamma",
	title: "Gamma Project",
	summary: "Gamma 프로젝트 요약입니다.",
	date: "2026-04-27T00:00:00.000Z",
	tags: ["infra", "devops"],
	stack: ["Cloudflare Workers", "TypeScript"],
	metrics: [
		["배포시간", "30s"],
		["에러율", "0%"],
	] as [string, string][],
	featured: undefined as boolean | undefined,
	cover: undefined as string | undefined,
	body: "",
};

// 전체 배열 (velite 출력 순서 — 정렬 전 raw)
export const fixtureProjects = [projectAlpha, projectBeta, projectGamma];
