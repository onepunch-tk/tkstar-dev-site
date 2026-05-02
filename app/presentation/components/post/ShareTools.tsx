import { useEffect, useState } from "react";

type Props = { title: string; canonicalUrl: string };

export default function ShareTools({ title, canonicalUrl }: Props) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const id = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(id);
	}, [copied]);

	const onCopy = () => {
		navigator.clipboard.writeText(canonicalUrl).then(() => setCopied(true));
	};

	const xHref = `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(canonicalUrl)}`;

	return (
		<div className="flex flex-col gap-2 border-line border-t pt-4">
			<h2 className="m-0 font-mono text-[11px] tracking-[0.12em] uppercase text-muted">share</h2>
			<div className="flex flex-col gap-1">
				<button
					type="button"
					onClick={onCopy}
					className="inline-flex min-h-9 items-center justify-start font-mono text-[12px] text-muted no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
				>
					copy link
				</button>
				<a
					href={xHref}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="share on x"
					className="inline-flex min-h-9 items-center justify-start font-mono text-[12px] text-muted no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
				>
					share on X →
				</a>
				<span aria-live="polite" className="font-mono text-[11px] text-accent min-h-[1em]">
					{copied ? "copied" : ""}
				</span>
			</div>
		</div>
	);
}
