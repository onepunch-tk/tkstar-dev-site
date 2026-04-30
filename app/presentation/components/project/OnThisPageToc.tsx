type Props = { toc: { slug: string; text: string }[] };

export default function OnThisPageToc({ toc }: Props) {
	if (toc.length === 0) return null;
	return (
		<nav
			data-testid="on-this-page-toc"
			aria-label="On this page"
			className="flex flex-col gap-2 border-line border-t border-dashed pt-3 font-mono"
		>
			<span className="text-[11px] tracking-[0.12em] text-muted uppercase">on this page</span>
			<ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
				{toc.map((item) => (
					<li key={item.slug}>
						<a
							href={`#${item.slug}`}
							className="text-[12px] text-muted no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
						>
							{item.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
