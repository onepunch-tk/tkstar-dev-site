import { Link } from "react-router";

import type { Project } from "../../../domain/project/project.entity";

type Props = { project: Project };

export default function FeaturedProjectCard({ project }: Props) {
	return (
		<Link
			to={`/projects/${project.slug}`}
			className="block rounded-lg border border-line bg-bg-elev p-4 text-fg no-underline transition-colors duration-[var(--duration-120)] ease-out hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
		>
			<div
				data-testid="cover"
				className="mb-3 aspect-video w-full overflow-hidden rounded-md border border-line"
			>
				{project.cover ? (
					<img
						src={project.cover}
						alt=""
						loading="eager"
						decoding="async"
						fetchPriority="high"
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-bg-elev bg-[image:repeating-linear-gradient(45deg,var(--color-hatch)_0_8px,transparent_8px_16px)] font-mono text-[11px] text-faint tracking-[0.06em]">
						cover · 16:9
					</div>
				)}
			</div>

			<div className="mb-1.5 flex flex-wrap gap-2">
				{project.stack.map((s) => (
					<span
						key={s}
						className="inline-block rounded-full border border-line-strong px-2 py-0.5 font-mono text-[11px] text-muted tracking-[0.02em]"
					>
						{s}
					</span>
				))}
			</div>

			<h3 className="m-0 font-mono font-semibold text-[clamp(1.25rem,3.4vw,1.5rem)] leading-[1.2] tracking-[-0.01em]">
				{project.title}
			</h3>

			<p className="m-0 mt-1.5 text-muted text-sm leading-[1.7]">{project.summary}</p>
		</Link>
	);
}
