import { STACK_CARDS } from "../../lib/about-data";

export default function StackCards() {
	return (
		<section aria-labelledby="about-stack-heading" className="flex flex-col gap-3">
			<h2
				id="about-stack-heading"
				className="m-0 font-mono font-semibold text-fg text-xl leading-tight tracking-[-0.01em]"
			>
				기술 스택
			</h2>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{STACK_CARDS.map((card) => (
					<div
						key={card.area}
						className="flex flex-col gap-3 rounded-md border border-line bg-bg-card p-4"
					>
						<span className="inline-block self-start rounded-full border border-accent bg-accent px-2 py-0.5 font-mono font-medium text-[11px] text-bg tracking-[0.04em]">
							{card.area}
						</span>
						<ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
							{card.items.map((item) => (
								<li
									key={item}
									className="inline-block rounded-full border border-line-strong px-2 py-0.5 font-mono text-[11px] text-muted tracking-[0.02em]"
								>
									{item}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
}
