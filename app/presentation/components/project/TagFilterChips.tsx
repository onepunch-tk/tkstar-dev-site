import { useSearchParams } from "react-router";

type Props = { tags: string[]; activeTag: string | null };

export default function TagFilterChips({ tags, activeTag }: Props) {
	const [, setSearchParams] = useSearchParams();

	if (tags.length === 0) {
		return null;
	}

	const onChip = (t: string) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (prev.get("tag") === t) {
					next.delete("tag");
				} else {
					next.set("tag", t);
				}
				return next;
			},
			{ preventScrollReset: true },
		);
	};

	return (
		<div className="flex flex-wrap gap-2 py-2">
			{tags.map((t) => {
				const isActive = t === activeTag;
				return (
					<button
						key={t}
						type="button"
						data-testid="tag-chip"
						data-active={isActive}
						onClick={() => onChip(t)}
						className={
							isActive
								? "inline-block rounded-full border border-accent bg-accent px-2.5 py-0.5 font-mono text-[11px] text-bg tracking-[0.02em]"
								: "inline-block rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted tracking-[0.02em] transition-colors duration-[var(--duration-120)] ease-out hover:border-accent hover:text-accent motion-reduce:transition-none"
						}
					>
						{t}
					</button>
				);
			})}
		</div>
	);
}
