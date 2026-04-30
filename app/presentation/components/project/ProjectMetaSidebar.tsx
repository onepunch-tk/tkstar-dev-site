type Props = {
	date: string;
	role?: string;
	stack: string[];
};

export default function ProjectMetaSidebar({ date, role, stack }: Props) {
	const year = new Date(date).getUTCFullYear();
	return (
		<aside data-testid="project-meta-sidebar">
			<div data-testid="project-meta-year">{year}</div>
			{role ? <div data-testid="project-meta-role">{role}</div> : null}
			<ul data-testid="project-meta-stack">
				{stack.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</aside>
	);
}
