import { EDUCATION } from "../../lib/about-data";

export default function EducationCard() {
	return (
		<section aria-labelledby="about-education-heading" className="flex flex-col gap-3">
			<h2
				id="about-education-heading"
				className="m-0 font-mono font-semibold text-fg text-xl leading-tight tracking-[-0.01em]"
			>
				학력
			</h2>
			<ul className="m-0 flex list-none flex-col gap-2 p-0">
				{EDUCATION.map((entry) => (
					<li
						key={`${entry.period}-${entry.institution}`}
						className="flex flex-col gap-1.5 rounded-md border border-line bg-bg-card p-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
					>
						<div className="flex flex-col gap-0.5">
							<span className="font-mono font-semibold text-[13px] text-fg">
								{entry.institution}
							</span>
							<span className="font-mono text-[12px] text-muted">{entry.degree}</span>
						</div>
						<span className="font-mono text-[11px] text-faint tracking-[0.04em]">
							{entry.period}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}
