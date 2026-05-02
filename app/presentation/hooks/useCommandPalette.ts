import type { SearchableItem } from "~/application/search/lib/token-search";

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

const noop = (): void => {};

// T010 placeholder. Cycle 4 Green 에서 실제 구현으로 교체.
export const useCommandPalette = (): CommandPaletteApi => {
	return {
		isOpen: false,
		open: noop,
		close: noop,
		query: "",
		setQuery: noop,
		groups: { pages: [], projects: [], posts: [] },
		recents: [],
		flatItems: [],
		activeIndex: 0,
		setActiveIndex: noop,
		selectActive: noop,
	};
};
