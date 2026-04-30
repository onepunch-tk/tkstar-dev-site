// Pure data — TDD exempt per phase-1-plan.md "TDD Exemption — Setup & Data Files"
// 본 PR은 placeholder 데이터로 구조 + AC만 책임. 실제 인물 정보는 후속 운영 PR에서 채움.

export type AboutHeader = {
	name: string;
	positioning: string;
	email: string;
};

export type StackArea = {
	area: string;
	items: readonly string[];
};

export type CareerEntry = {
	period: string;
	company: string;
	role: string;
	points: readonly string[];
};

export type EducationEntry = {
	period: string;
	institution: string;
	degree: string;
};

export type AwardEntry = {
	year: string;
	title: string;
	issuer: string;
};

export type CertificationEntry = {
	year: string;
	title: string;
	issuer: string;
};

export const ABOUT_HEADER: AboutHeader = {
	name: "김태곤",
	positioning: "1인 개발자 · 풀스택 · 제품 설계부터 운영까지",
	email: "hello@tkstar.dev",
};

export const STACK_CARDS: readonly StackArea[] = [
	{
		area: "frontend",
		items: ["React 19", "React Router 7", "TypeScript 5.9", "TailwindCSS v4"],
	},
	{
		area: "edge / backend",
		items: ["Cloudflare Workers", "NestJS", "PostgreSQL", "Drizzle"],
	},
	{
		area: "quality",
		items: ["Vitest", "Biome", "Clean Architecture", "TDD"],
	},
];

export const CAREER_TIMELINE: readonly CareerEntry[] = [
	{
		period: "YYYY.MM — present",
		company: "placeholder company",
		role: "placeholder role",
		points: ["placeholder bullet 1", "placeholder bullet 2"],
	},
];

export const EDUCATION: readonly EducationEntry[] = [
	{
		period: "YYYY.MM — YYYY.MM",
		institution: "placeholder institution",
		degree: "placeholder degree",
	},
];

export const AWARDS: readonly AwardEntry[] = [
	{ year: "YYYY", title: "placeholder award 1", issuer: "placeholder issuer" },
	{ year: "YYYY", title: "placeholder award 2", issuer: "placeholder issuer" },
];

// 자격증은 future optional — 본 PR에서는 자리만, 데이터 0개
export const CERTIFICATIONS: readonly CertificationEntry[] = [];
