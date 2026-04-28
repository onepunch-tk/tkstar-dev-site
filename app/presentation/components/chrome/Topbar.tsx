import { Link, NavLink, useLocation } from "react-router";
import { TOPBAR_LINKS } from "../../lib/chrome-links";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
	const { pathname } = useLocation();
	return (
		<header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-sm">
			<div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
				<Link to="/" className="text-fg font-bold">
					tkstar.dev
				</Link>
				<span className="text-muted text-sm hidden sm:inline">$ {pathname}</span>
				<nav aria-label="Primary" className="ml-auto flex items-center gap-4 text-sm">
					{TOPBAR_LINKS.map((link) => (
						<NavLink
							key={link.href}
							to={link.href}
							className={({ isActive }) => (isActive ? "text-accent" : "text-muted hover:text-fg")}
						>
							{link.label}
						</NavLink>
					))}
					<button
						type="button"
						aria-label="Open search"
						className="rounded-sm border border-line px-2 py-1 text-xs text-muted hover:text-fg"
					>
						⌘K
					</button>
					<ThemeToggle />
				</nav>
			</div>
		</header>
	);
}
