type Props = {
	date: string;
	role?: string;
	stack: string[];
};

export default function ProjectMetaSidebar({ date, role, stack }: Props) {
	const year = new Date(date).getUTCFullYear();
	return (
		<aside data-testid="project-meta-sidebar" className="flex flex-col gap-3 font-mono">
			<div className="flex flex-col gap-1">
				<span className="text-[11px] tracking-[0.12em] text-muted uppercase">year</span>
				<span className="text-[18px] text-fg" data-testid="project-meta-year">
					{year}
				</span>
			</div>

			{role ? (
				<div className="mt-3 flex flex-col gap-1 border-line border-t border-dashed pt-3">
					<span className="text-[11px] tracking-[0.12em] text-muted uppercase">role</span>
					<span className="text-[13px] text-fg" data-testid="project-meta-role">
						{role}
					</span>
				</div>
			) : null}

			<div className="mt-3 flex flex-col gap-2 border-line border-t border-dashed pt-3">
				<span className="text-[11px] tracking-[0.12em] text-muted uppercase">stack</span>
				<ul data-testid="project-meta-stack" className="flex flex-wrap gap-1.5 m-0 p-0 list-none">
					{stack.map((item) => (
						<li
							key={item}
							className="inline-block rounded-full border border-line-strong px-2 py-0.5 font-mono text-[11px] text-muted tracking-[0.02em]"
						>
							{item}
						</li>
					))}
				</ul>
			</div>
		</aside>
	);
}
