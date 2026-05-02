import { useEffect, useRef, useState } from "react";
import {
	type CommandPaletteApi,
	type PaletteEntry,
	type PaletteGroup,
	useCommandPalette,
} from "~/presentation/hooks/useCommandPalette";

const GROUP_LABELS: Record<PaletteGroup | "recents", string> = {
	recents: "Recent",
	pages: "Pages",
	projects: "Projects",
	posts: "Posts",
};

type GroupKey = PaletteGroup | "recents";

const collectGroups = (api: CommandPaletteApi): { key: GroupKey; items: PaletteEntry[] }[] => {
	const out: { key: GroupKey; items: PaletteEntry[] }[] = [];
	if (api.recents.length > 0) out.push({ key: "recents", items: api.recents });
	if (api.groups.pages.length > 0) out.push({ key: "pages", items: api.groups.pages });
	if (api.groups.projects.length > 0) out.push({ key: "projects", items: api.groups.projects });
	if (api.groups.posts.length > 0) out.push({ key: "posts", items: api.groups.posts });
	return out;
};

export default function CommandPalette() {
	const api = useCommandPalette();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [listEl, setListEl] = useState<HTMLUListElement | null>(null);

	useEffect(() => {
		if (api.isOpen) inputRef.current?.focus();
	}, [api.isOpen]);

	useEffect(() => {
		if (!listEl) return;
		const onEnter = (e: Event) => {
			const target = e.target as HTMLElement | null;
			const item = target?.closest<HTMLElement>("[data-palette-index]");
			if (!item) return;
			const idx = Number(item.dataset.paletteIndex);
			if (Number.isFinite(idx)) api.setActiveIndex(idx);
		};
		listEl.addEventListener("pointerenter", onEnter, true);
		return () => listEl.removeEventListener("pointerenter", onEnter, true);
	}, [listEl, api.setActiveIndex]);

	if (!api.isOpen) return null;

	const visible = collectGroups(api);
	let runningIndex = 0;

	return (
		<div
			data-testid="palette-modal"
			role="dialog"
			aria-modal="true"
			aria-label="Command palette"
			className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24"
		>
			<div className="w-full max-w-xl rounded-md border border-border bg-bg-elev shadow-lg">
				<input
					ref={inputRef}
					data-testid="palette-input"
					value={api.query}
					onChange={(e) => api.setQuery(e.target.value)}
					placeholder="Search pages, projects, posts..."
					className="w-full bg-transparent px-4 py-3 outline-none"
				/>
				<ul ref={setListEl} className="max-h-96 overflow-y-auto py-2">
					{visible.map(({ key, items }) => (
						<li key={key} data-testid={`palette-group-${key}`}>
							<div className="px-4 py-1 text-xs uppercase text-muted">{GROUP_LABELS[key]}</div>
							<ul>
								{items.map((item) => {
									const itemIndex = runningIndex++;
									const isActive = itemIndex === api.activeIndex;
									return (
										<li
											key={`${key}-${item.slug}`}
											data-testid={`palette-item-${key === "recents" ? item.group : key}-${item.slug}`}
											data-active={isActive ? "true" : "false"}
											data-palette-index={itemIndex}
											onClick={() => {
												api.setActiveIndex(itemIndex);
												api.selectActive();
											}}
											className={`cursor-pointer px-4 py-2 ${isActive ? "bg-accent/10" : ""}`}
										>
											<div className="text-sm">{item.title}</div>
											<div className="text-xs text-muted">{item.href}</div>
										</li>
									);
								})}
							</ul>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
