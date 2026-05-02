import { useEffect, useRef, useState } from "react";
import {
	type CommandPaletteApi,
	type PaletteEntry,
	type PaletteGroup,
	useCommandPalette,
} from "~/presentation/hooks/useCommandPalette";
import { useKbdHint } from "~/presentation/hooks/useKbdHint";

const GROUP_LABELS: Record<PaletteGroup | "recents", string> = {
	recents: "Recent",
	pages: "Pages",
	projects: "Projects",
	posts: "Posts",
};

const TYPE_BADGE: Record<PaletteGroup, string> = {
	pages: "page",
	projects: "project",
	posts: "post",
};

type GroupKey = PaletteGroup | "recents";

const itemMeta = (item: PaletteEntry): string => {
	if (item.group === "posts") {
		const date = item.date ?? "";
		const read = item.read != null ? `${item.read} min` : "";
		return [date, read].filter(Boolean).join(" · ");
	}
	if (item.group === "projects") return item.summary ?? item.href;
	return item.href;
};

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
	const kbd = useKbdHint();
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
	const isEmpty = visible.length === 0;
	let runningIndex = 0;

	return (
		<div
			data-testid="palette-modal"
			data-palette-backdrop
			role="dialog"
			aria-modal="true"
			aria-label="Command palette"
			onClick={(e) => {
				// 패널 자체 클릭은 무시 — backdrop(자기 자신)만 close 트리거
				if (e.target === e.currentTarget) api.close();
			}}
			className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[14vh] backdrop-blur-sm motion-reduce:bg-black/60 motion-reduce:backdrop-blur-none [animation:palette-backdrop-in_var(--duration-120)_ease-out]"
		>
			<div
				data-palette-panel
				className="w-full max-w-xl overflow-hidden rounded-md border border-line-strong bg-bg-elev font-mono shadow-2xl shadow-black/40 [animation:palette-panel-in_var(--duration-120)_ease-out]"
			>
				<div className="flex items-center gap-2 border-line border-b px-4">
					<span aria-hidden="true" className="text-accent text-sm">
						›
					</span>
					<input
						ref={inputRef}
						data-testid="palette-input"
						value={api.query}
						onChange={(e) => api.setQuery(e.target.value)}
						onKeyDown={(e) => {
							// open trigger '/' 가 input 에 echo 되는 race 차단 (빈 query 일 때만)
							if (e.key === "/" && api.query === "") e.preventDefault();
						}}
						placeholder="go to ─ /about, project slug, post..."
						className="flex-1 bg-transparent py-3 font-mono text-fg text-sm outline-none placeholder:text-faint"
					/>
					<kbd className="hidden rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline-block">
						{kbd}
					</kbd>
					<kbd className="hidden rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline-block">
						esc
					</kbd>
				</div>

				{isEmpty ? (
					<div className="px-4 py-8 text-center font-mono text-muted text-xs">
						{api.query ? "검색 결과 없음" : "검색어를 입력하세요"}
					</div>
				) : (
					<ul ref={setListEl} className="max-h-[60vh] overflow-y-auto py-2">
						{visible.map(({ key, items }) => (
							<li key={key} data-testid={`palette-group-${key}`}>
								<div className="px-4 pt-2 pb-1 font-mono text-[10px] text-faint uppercase tracking-[0.12em]">
									{GROUP_LABELS[key]}
								</div>
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
												className="cursor-pointer border-l-2 border-l-transparent px-4 py-2 transition-colors duration-[var(--duration-120)] ease-out motion-reduce:transition-none data-[active=true]:border-l-accent data-[active=true]:bg-bg-card"
											>
												<div className="flex items-baseline gap-2">
													<span
														aria-hidden="true"
														className="w-3 shrink-0 font-mono text-accent text-xs opacity-0 data-[active=true]:opacity-100"
														data-active={isActive ? "true" : "false"}
													>
														▸
													</span>
													<span className="shrink-0 font-mono text-fg text-sm">{item.title}</span>
													<span className="min-w-0 flex-1 truncate font-mono text-faint text-xs">
														{itemMeta(item)}
													</span>
													<span className="shrink-0 rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">
														{TYPE_BADGE[item.group]}
													</span>
												</div>
											</li>
										);
									})}
								</ul>
							</li>
						))}
					</ul>
				)}

				<div className="flex items-center justify-end gap-3 border-line border-t bg-bg/40 px-4 py-2 font-mono text-[10px] text-faint">
					<span className="flex items-center gap-1">
						<kbd className="rounded-sm border border-line px-1 py-0.5 text-muted">↑↓</kbd>
						이동
					</span>
					<span className="flex items-center gap-1">
						<kbd className="rounded-sm border border-line px-1 py-0.5 text-muted">↵</kbd>
						선택
					</span>
					<span className="flex items-center gap-1">
						<kbd className="rounded-sm border border-line px-1 py-0.5 text-muted">esc</kbd>
						닫기
					</span>
				</div>
			</div>
		</div>
	);
}
