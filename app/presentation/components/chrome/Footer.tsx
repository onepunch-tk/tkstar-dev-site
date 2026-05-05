import { Link, useRouteLoaderData } from "react-router";
import { FOOTER_LINKS } from "../../lib/chrome-links";

const linkClass =
	"rounded-sm hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function Footer() {
	const rootData = useRouteLoaderData("root") as { appCount?: number } | undefined;
	const showLegal = (rootData?.appCount ?? 0) > 0;

	return (
		<footer data-chrome="footer" className="border-t border-line text-muted text-xs">
			<div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
				<p>© {new Date().getFullYear()} tkstar.dev</p>
				<ul className="flex flex-wrap gap-4">
					{FOOTER_LINKS.map((link) => (
						<li key={link.label}>
							{link.external ? (
								<a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
									{link.label}
								</a>
							) : (
								<Link to={link.href} className={linkClass}>
									{link.label}
								</Link>
							)}
						</li>
					))}
					{showLegal && (
						<li>
							<Link to="/legal" className={linkClass}>
								legal
							</Link>
						</li>
					)}
				</ul>
			</div>
		</footer>
	);
}
