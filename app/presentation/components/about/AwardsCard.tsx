import { AWARDS } from "../../lib/about-data";

export default function AwardsCard() {
	return (
		<section aria-labelledby="about-awards-heading" className="flex flex-col gap-3">
			<h2
				id="about-awards-heading"
				className="m-0 font-mono font-semibold text-fg text-xl leading-tight tracking-[-0.01em]"
			>
				수상
			</h2>
			<ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
				{AWARDS.map((entry) => (
					<li
						key={`${entry.year}-${entry.title}`}
						className="flex flex-col gap-2 rounded-md border border-line bg-bg-card p-4"
					>
						<span className="inline-block self-start rounded-full border border-line-strong px-2 py-0.5 font-mono text-[11px] text-accent tracking-[0.06em]">
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
