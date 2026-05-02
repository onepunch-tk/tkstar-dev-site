import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { tokenSearch, type SearchableItem } from "~/application/search/lib/token-search";
import { getRecent, pushRecent, type RecentItem } from "~/presentation/lib/recent-visits";

export type PaletteGroup = "pages" | "projects" | "posts";

export type PaletteEntry = SearchableItem & {
	group: PaletteGroup;
	href: string;
};

export type CommandPaletteApi = {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	query: string;
	setQuery: (q: string) => void;
	groups: { pages: PaletteEntry[]; projects: PaletteEntry[]; posts: PaletteEntry[] };
	recents: PaletteEntry[];
	flatItems: PaletteEntry[];
	activeIndex: number;
	setActiveIndex: (i: number) => void;
	selectActive: () => void;
};

type SearchIndexPayload = {
	pages: SearchableItem[];
	projects: SearchableItem[];
	posts: SearchableItem[];
};

const SEARCH_INDEX_URL = "/search-index.json";

const hrefFor = (group: PaletteGroup, slug: string): string =>
	group === "pages" ? slug : group === "projects" ? `/projects/${slug}` : `/blog/${slug}`;

const toEntry = (item: SearchableItem, group: PaletteGroup): PaletteEntry => ({
	...item,
	group,
	href: hrefFor(group, item.slug),
});

const recentToEntry = (r: RecentItem): PaletteEntry => ({
	slug: r.slug,
	title: r.title,
	group: r.group,
	href: hrefFor(r.group, r.slug),
});

const isInputFocused = (el: Element | null): boolean => {
	if (!el) return false;
	const tag = el.tagName;
	if (tag === "INPUT" || tag === "TEXTAREA") return true;
	if ((el as HTMLElement).isContentEditable === true) return true;
	const ce = el.getAttribute("contenteditable");
	return ce === "" || ce === "true";
};

export const useCommandPalette = (): CommandPaletteApi => {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const [index, setIndex] = useState<SearchIndexPayload>({
		pages: [],
		projects: [],
		posts: [],
	});
	const [recents, setRecents] = useState<PaletteEntry[]>([]);
	const fetchRef = useRef<Promise<SearchIndexPayload> | null>(null);

	const ensureIndex = useCallback(() => {
		if (!fetchRef.current) {
			fetchRef.current = (async () => {
				const res = await fetch(SEARCH_INDEX_URL);
				const payload = (await res.json()) as SearchIndexPayload;
				setIndex(payload);
				return payload;
			})();
		}
		return fetchRef.current;
	}, []);

	const open = useCallback(() => {
		setRecents(getRecent().map(recentToEntry));
		setActiveIndex(0);
		setIsOpen(true);
		void ensureIndex();
	}, [ensureIndex]);

	const close = useCallback(() => {
		setIsOpen(false);
	}, []);

	const trimmed = query.trim();
	const groups = useMemo(() => {
		const filterGroup = (items: SearchableItem[], group: PaletteGroup) =>
			(trimmed ? tokenSearch(items, trimmed) : items).map((it) => toEntry(it, group));
		return {
			pages: filterGroup(index.pages, "pages"),
			projects: filterGroup(index.projects, "projects"),
			posts: filterGroup(index.posts, "posts"),
		};
	}, [index, trimmed]);

	const visibleRecents = trimmed ? [] : recents;
	const flatItems = useMemo(
		() =>
			visibleRecents.length > 0
				? visibleRecents
				: [...groups.pages, ...groups.projects, ...groups.posts],
		[visibleRecents, groups],
	);

	const selectActive = useCallback(() => {
		const item = flatItems[activeIndex];
		if (!item) {
			setIsOpen(false);
			return;
		}
		pushRecent({ slug: item.slug, title: item.title, group: item.group });
		navigate(item.href);
		setIsOpen(false);
	}, [activeIndex, flatItems, navigate]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsOpen(false);
				return;
			}
			const isShortcut = ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || e.key === "/";
			if (isShortcut) {
				if (isInputFocused(document.activeElement)) return;
				e.preventDefault();
				open();
				return;
			}
			if (!isOpen) return;
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setActiveIndex((i) => Math.min(i + 1, Math.max(0, flatItems.length - 1)));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setActiveIndex((i) => Math.max(0, i - 1));
			} else if (e.key === "Enter") {
				e.preventDefault();
				selectActive();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [isOpen, flatItems.length, open, selectActive]);

	return {
		isOpen,
		open,
		close,
		query,
		setQuery,
		groups,
		recents: visibleRecents,
		flatItems,
		activeIndex,
		setActiveIndex,
		selectActive,
	};
};
