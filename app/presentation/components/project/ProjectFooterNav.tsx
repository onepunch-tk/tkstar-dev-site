import { Link } from "react-router";

type Adjacent = { slug: string; title: string } | null;
type Props = { prev: Adjacent; next: Adjacent };

export default function ProjectFooterNav({ prev, next }: Props) {
	return (
		<nav
			data-testid="project-footer-nav"
			aria-label="Project navigation"
			className="mt-12 grid grid-cols-3 items-center gap-2 border-line border-t pt-6 min-[720px]:gap-3"
		>
			{prev ? (
				<Link
					to={`/projects/${prev.slug}`}
					className="justify-self-start font-mono text-[12px] text-muted no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
				>
					← prev · {prev.title}
				</Link>
			) : (
				<span />
			)}

			<Link
				to="/contact"
				className="inline-flex items-center justify-center justify-self-center border border-accent px-4 py-2 font-mono text-[12px] text-accent no-underline transition-colors duration-[var(--duration-120)] ease-out hover:bg-accent hover:text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
			>
				의뢰하기 →
			</Link>

			{next ? (
				<Link
					to={`/projects/${next.slug}`}
					className="justify-self-end text-right font-mono text-[12px] text-muted no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
				>
					{next.title} · next →
				</Link>
			) : (
				<span />
			)}
		</nav>
	);
}
