import { Link } from "react-router";

type Adjacent = { slug: string; title: string } | null;
type Props = { prev: Adjacent; next: Adjacent };

export default function PostFooterNav({ prev, next }: Props) {
	return (
		<nav
			data-testid="post-footer-nav"
			aria-label="Post navigation"
			className="mt-12 grid grid-cols-3 items-center gap-2 border-line border-t pt-6 min-[720px]:gap-3"
		>
			{prev ? (
				<Link
					to={`/blog/${prev.slug}`}
					className="inline-flex min-h-11 items-center justify-self-start font-mono text-[12px] text-muted no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
				>
					← prev · {prev.title}
				</Link>
			) : (
				<span />
			)}

			<Link
				to="/blog"
				className="inline-flex min-h-11 items-center justify-center justify-self-center border border-line px-4 py-2 font-mono text-[12px] text-muted no-underline transition-colors duration-[var(--duration-120)] ease-out hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
			>
				[모든 글]
			</Link>

			{next ? (
				<Link
					to={`/blog/${next.slug}`}
					className="inline-flex min-h-11 items-center justify-self-end text-right font-mono text-[12px] text-muted no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
				>
					{next.title} · next →
				</Link>
			) : (
				<span />
			)}
		</nav>
	);
}
