import { ABOUT_HEADER } from "../../lib/about-data";
import { triggerPrint } from "../../lib/print";

export default function AboutHeader() {
	return (
		<section
			aria-labelledby="about-heading"
			className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
		>
			<div className="flex flex-col gap-2">
				<h1
					id="about-heading"
					className="m-0 font-mono font-bold leading-[1.1] tracking-[-0.02em] text-[clamp(1.75rem,6vw,2.75rem)]"
				>
					{ABOUT_HEADER.name}
					<span className="ml-2 align-middle font-normal text-faint text-sm">· solo developer</span>
				</h1>
				<p className="m-0 font-mono text-muted text-sm leading-[1.7]">
					{ABOUT_HEADER.positioning} ·{" "}
					<a
						href={`mailto:${ABOUT_HEADER.email}`}
						className="text-accent underline-offset-4 transition-colors duration-[var(--duration-120)] ease-out hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
					>
						{ABOUT_HEADER.email}
					</a>
				</p>
			</div>

			<button
				type="button"
				data-chrome="print-trigger"
				aria-label="Print as PDF"
				onClick={triggerPrint}
				className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-accent bg-accent px-4 py-2.5 font-mono font-medium text-[13px] text-on-accent transition-[color,background-color,border-color,filter] duration-[var(--duration-120)] ease-out hover:brightness-[1.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
			>
				<span aria-hidden="true">⎙</span>
				./resume --pdf
			</button>
		</section>
	);
}
