import { AWARDS } from "../../lib/about-data";

export default function AwardsCard() {
	return (
		<section aria-labelledby="about-awards-heading" className="flex flex-col gap-3">
			<h2
				id="about-awards-heading"
				className="m-0 flex items-center gap-2 font-mono font-semibold text-faint text-xs tracking-[0.1em] before:text-accent before:content-['##']"
			>
				수상
				<span aria-hidden="true" className="ml-2 h-px flex-1 bg-line" />
			</h2>
			<ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
				{AWARDS.map((entry) => (
					<li
						key={`${entry.year}-${entry.title}`}
						className="flex flex-col gap-2 rounded-md border border-line bg-bg-card p-4"
					>
						<span className="inline-block self-start rounded-full border border-line-strong px-2 py-0.5 font-mono text-[11px] text-accent tracking-[0.04em]">
							{entry.year}
						</span>
						<div className="flex flex-col gap-0.5">
							<span className="font-mono font-semibold text-[13px] text-fg">{entry.title}</span>
							<span className="font-mono text-[12px] text-muted">{entry.issuer}</span>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}
