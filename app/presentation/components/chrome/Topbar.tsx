import { Link, useLocation } from "react-router";
import { useKbdHint } from "../../hooks/useKbdHint";
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
				<span className="hidden min-w-0 max-w-[260px] truncate text-muted text-sm sm:inline">
					$ {pathname}
				</span>
				<nav aria-label="Primary" className="ml-auto flex items-center gap-4 text-sm">
					<button
						type="button"
						data-chrome="search-trigger"
						aria-disabled="true"
						aria-label="검색 (준비 중)"
						onClick={(e) => e.preventDefault()}
						className="cursor-not-allowed rounded-sm border border-line px-2 py-1 text-muted text-xs opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
					>
						{kbd}
					</button>
					<ThemeToggle />
				</nav>
			</div>
		</header>
	);
}
