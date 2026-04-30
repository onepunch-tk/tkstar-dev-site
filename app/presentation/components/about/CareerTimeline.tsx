import { CAREER_TIMELINE } from "../../lib/about-data";

export default function CareerTimeline() {
	return (
		<section aria-labelledby="about-career-heading" className="flex flex-col gap-3">
			<h2
				id="about-career-heading"
				className="m-0 font-mono font-semibold text-fg text-xl leading-tight tracking-[-0.01em]"
			>
				경력
			</h2>
			<ol className="m-0 flex list-none flex-col gap-0 p-0">
				{CAREER_TIMELINE.map((entry) => (
					<li
						key={`${entry.period}-${entry.company}`}
						className="grid grid-cols-1 gap-2 border-line border-b border-dashed py-3 last:border-b-0 sm:grid-cols-[140px_1fr] sm:gap-4"
					>
						<span className="font-mono text-[11px] text-faint tracking-[0.04em]">
							{entry.period}
						</span>
						<div className="flex flex-col gap-1.5">
							<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
								<span className="font-mono font-semibold text-[13px] text-fg">{entry.company}</span>
								<span className="font-mono text-[12px] text-muted">· {entry.role}</span>
							</div>
							<ul className="m-0 flex list-none flex-col gap-1 p-0">
								{entry.points.map((point) => (
									<li
										key={point}
										className="font-mono text-[12px] text-muted leading-relaxed before:mr-2 before:text-accent before:content-['●']"
									>
										{point}
									</li>
								))}
							</ul>
						</div>
					</li>
				))}
			</ol>
		</section>
	);
}
