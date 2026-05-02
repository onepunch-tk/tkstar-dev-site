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
	date: string;
	read: number;
	tags?: string[];
	[key: string]: unknown;
};

export type IndexedPage = SearchableItem;
export type IndexedProject = SearchableItem;
export type IndexedPost = SearchableItem & { date: string; read: number };

export type SearchIndex = {
	pages: IndexedPage[];
	projects: IndexedProject[];
	posts: IndexedPost[];
};

const STATIC_PAGES: IndexedPage[] = [
	{ slug: "/", title: "Home", summary: "tkstar.dev — 1인 기업 개인 브랜드" },
	{ slug: "/about", title: "About", summary: "B2B 채용·협업 검토를 위한 이력 페이지" },
	{ slug: "/projects", title: "Projects", summary: "B2C 의뢰 검토용 프로젝트 케이스 스터디 모음" },
	{ slug: "/blog", title: "Blog", summary: "월 1편 운영 원칙의 기술 블로그" },
	{ slug: "/contact", title: "Contact", summary: "B2B / B2C 의뢰 문의 폼" },
	{ slug: "/legal", title: "Legal", summary: "출시한 앱별 이용약관 / 개인정보처리방침 색인" },
];

const withTags = <T extends { tags?: string[] }>(item: T): T => {
	if (item.tags && item.tags.length === 0) {
		const { tags: _omit, ...rest } = item;
		return rest as T;
	}
	return item;
};

const toIndexedProject = (p: ProjectIndexInput): IndexedProject =>
	withTags({
		slug: p.slug,
		title: p.title,
		summary: p.summary,
		...(p.tags && p.tags.length > 0 ? { tags: p.tags } : {}),
	});

const toIndexedPost = (p: PostIndexInput): IndexedPost =>
	withTags({
		slug: p.slug,
		title: p.title,
		summary: p.lede,
		date: p.date.slice(0, 10),
		read: p.read,
		...(p.tags && p.tags.length > 0 ? { tags: p.tags } : {}),
	});

export const buildSearchIndex = (input: {
	projects: ProjectIndexInput[];
	posts: PostIndexInput[];
}): SearchIndex => ({
	pages: STATIC_PAGES.map((page) => ({ ...page })),
	projects: input.projects.map(toIndexedProject),
	posts: input.posts.map(toIndexedPost),
});
