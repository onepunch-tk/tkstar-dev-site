import type { SearchableItem } from "../lib/token-search";

export type ProjectIndexInput = {
	slug: string;
	title: string;
	summary: string;
	tags?: string[];
	[key: string]: unknown;
};

export type PostIndexInput = {
	slug: string;
	title: string;
	lede: string;
	tags?: string[];
	[key: string]: unknown;
};

export type SearchIndex = {
	pages: SearchableItem[];
	projects: SearchableItem[];
	posts: SearchableItem[];
};

const STATIC_PAGES: SearchableItem[] = [
	{ slug: "/", title: "Home", summary: "tkstar.dev — 1인 기업 개인 브랜드" },
	{ slug: "/about", title: "About", summary: "B2B 채용·협업 검토를 위한 이력 페이지" },
	{ slug: "/projects", title: "Projects", summary: "B2C 의뢰 검토용 프로젝트 케이스 스터디 모음" },
	{ slug: "/blog", title: "Blog", summary: "월 1편 운영 원칙의 기술 블로그" },
	{ slug: "/contact", title: "Contact", summary: "B2B / B2C 의뢰 문의 폼" },
	{ slug: "/legal", title: "Legal", summary: "출시한 앱별 이용약관 / 개인정보처리방침 색인" },
];

const toSearchable = (input: {
	slug: string;
	title: string;
	summary: string;
	tags?: string[];
}): SearchableItem => {
	const item: SearchableItem = {
		slug: input.slug,
		title: input.title,
		summary: input.summary,
	};
	if (input.tags && input.tags.length > 0) item.tags = input.tags;
	return item;
};

export const buildSearchIndex = (input: {
	projects: ProjectIndexInput[];
	posts: PostIndexInput[];
}): SearchIndex => {
	const projects = input.projects.map((p) =>
		toSearchable({ slug: p.slug, title: p.title, summary: p.summary, tags: p.tags }),
	);
	const posts = input.posts.map((p) =>
		toSearchable({ slug: p.slug, title: p.title, summary: p.lede, tags: p.tags }),
	);
	return { pages: STATIC_PAGES.map((page) => ({ ...page })), projects, posts };
};
