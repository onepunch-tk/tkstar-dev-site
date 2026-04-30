type Props = { toc: { slug: string; text: string }[] };

export default function OnThisPageToc({ toc }: Props) {
	if (toc.length === 0) return null;
	return (
		<nav data-testid="on-this-page-toc" aria-label="On this page">
			<ul>
				{toc.map((item) => (
					<li key={item.slug}>
						<a href={`#${item.slug}`}>{item.text}</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
