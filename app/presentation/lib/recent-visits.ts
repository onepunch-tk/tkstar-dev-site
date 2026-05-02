export type RecentItem = {
	slug: string;
	title: string;
	group: "pages" | "projects" | "posts";
};

const KEY = "tkstar-palette-recent";
const MAX = 5;

const isRecentItem = (value: unknown): value is RecentItem => {
	if (typeof value !== "object" || value === null) return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.slug === "string" &&
		typeof v.title === "string" &&
		(v.group === "pages" || v.group === "projects" || v.group === "posts")
	);
};

export const getRecent = (): RecentItem[] => {
	if (typeof sessionStorage === "undefined") return [];
	const raw = sessionStorage.getItem(KEY);
	if (raw === null) return [];
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isRecentItem);
	} catch {
		return [];
	}
};

export const pushRecent = (item: RecentItem): void => {
	if (typeof sessionStorage === "undefined") return;
	const current = getRecent().filter((existing) => existing.slug !== item.slug);
	const next = [item, ...current].slice(0, MAX);
	sessionStorage.setItem(KEY, JSON.stringify(next));
};
