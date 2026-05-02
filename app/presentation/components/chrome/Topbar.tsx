import { Link, useLocation } from "react-router";
import { useKbdHint } from "../../hooks/useKbdHint";
import { openCommandPalette } from "../../hooks/useCommandPalette";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
	const { pathname } = useLocation();
	const kbd = useKbdHint();
	return (
		<header
			data-chrome="topbar"
			className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-sm motion-reduce:bg-bg motion-reduce:backdrop-blur-none"
		>
			<div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
				<Link
					to="/"
					className="rounded-sm font-bold tracking-tight text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
				>
					tkstar<span className="text-accent">.dev</span>
				</Link>
				<span className="hidden min-w-0 max-w-[260px] truncate text-muted text-xs sm:inline">
					~{pathname === "/" ? "" : pathname}
				</span>
				<nav
					aria-label="Primary"
					className="ml-auto flex flex-1 items-center justify-end gap-2 text-sm"
				>
					<button
						type="button"
						data-chrome="search-trigger"
						aria-label="검색 — Command Palette 열기"
						onClick={openCommandPalette}
						className="inline-flex w-full max-w-[360px] cursor-pointer items-center gap-2 rounded-md border border-line bg-bg-elev px-2.5 py-1.5 text-muted text-xs transition-colors duration-[var(--duration-120)] ease-out hover:border-line-strong hover:text-fg motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
					>
						<span aria-hidden="true">›</span>
						<span className="flex-1 truncate text-left">go to ─ /about, post...</span>
						<kbd className="hidden rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline-block">
							{kbd}
						</kbd>
					</button>
					<ThemeToggle />
				</nav>
			</div>
		</header>
	);
}
