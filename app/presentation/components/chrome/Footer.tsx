import { Link } from "react-router";
import { FOOTER_LINKS } from "../../lib/chrome-links";

export default function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="border-t border-line text-muted text-xs">
			<div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
				<p>© {year} tkstar.dev</p>
				<ul className="flex flex-wrap gap-4">
					{FOOTER_LINKS.map((link) => (
						<li key={link.label}>
							{link.external ? (
								<a
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-fg"
								>
									{link.label}
								</a>
							) : (
								<Link to={link.href} className="hover:text-fg">
									{link.label}
								</Link>
							)}
						</li>
					))}
				</ul>
			</div>
		</footer>
	);
}
