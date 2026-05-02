import { Link } from "react-router";

import type { Project } from "../../../domain/project/project.entity";
import { formatDate } from "../../lib/format";

type Props = { project: Project };

export default function ProjectRow({ project }: Props) {
	return (
		<Link
			to={`/projects/${project.slug}`}
			data-testid="project-row"
			className="grid grid-cols-[1fr_auto] items-baseline gap-2.5 border-line border-b border-dashed py-3.5 font-mono text-[13px] text-fg no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none min-[720px]:grid-cols-[72px_140px_1fr_minmax(0,200px)]"
		>
			<span className="hidden text-[11px] text-muted min-[720px]:inline">
				{formatDate(project.date)}
			</span>
			<span className="hidden text-[12px] text-accent min-[720px]:inline">{project.slug}/</span>
			<div className="flex flex-col gap-0.5">
				<span className="font-mono text-[11px] text-accent min-[720px]:hidden">
					{project.slug}/
				</span>
				<span className="font-semibold text-fg">{project.title}</span>
				<span className="text-[11px] text-muted">{project.summary}</span>
			</div>
			<div className="flex flex-wrap justify-end gap-1.5">
				{project.stack.map((s) => (
					<span
						key={s}
						className="inline-block rounded-full border border-line-strong px-2 py-0.5 font-mono text-[11px] text-muted tracking-[0.02em]"
					>
						{s}
					</span>
				))}
			</div>
		</Link>
	);
}
