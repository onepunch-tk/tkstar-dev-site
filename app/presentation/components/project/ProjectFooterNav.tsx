import { Link } from "react-router";

type Adjacent = { slug: string; title: string } | null;
type Props = { prev: Adjacent; next: Adjacent };

export default function ProjectFooterNav({ prev, next }: Props) {
	return (
		<nav data-testid="project-footer-nav" aria-label="Project navigation">
			{prev ? <Link to={`/projects/${prev.slug}`}>← prev · {prev.title}</Link> : <span />}
			<Link to="/contact">의뢰하기 →</Link>
			{next ? <Link to={`/projects/${next.slug}`}>{next.title} · next →</Link> : <span />}
		</nav>
	);
}
