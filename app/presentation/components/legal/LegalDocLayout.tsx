import type { ReactNode } from "react";

import { formatDate } from "../../lib/format";

type Props = {
	title: string;
	version: string;
	effectiveDate: string;
	children: ReactNode;
};

export default function LegalDocLayout({ title, version, effectiveDate, children }: Props) {
	return (
		<div className="bg-bg font-mono text-[14px] text-fg leading-[1.75]">
			<header className="border-line border-b px-[var(--spacing-gutter)] pt-[22px] pb-3">
				<h1 className="m-0 font-mono font-semibold text-[20px] text-fg tracking-[-0.01em]">
					{title}
				</h1>
				<div className="mt-2 flex flex-wrap gap-2.5 font-mono text-[11px] text-faint">
					<span>버전 {version}</span>
					<span aria-hidden="true">·</span>
					<span>시행 {formatDate(effectiveDate)}</span>
				</div>
			</header>
			<article
				className="px-[var(--spacing-gutter)] pt-[22px] pb-20
					[&>h2]:mt-7 [&>h2]:mb-2 [&>h2]:font-mono [&>h2]:font-semibold [&>h2]:text-[14px] [&>h2]:text-fg
					[&>h3]:mt-[18px] [&>h3]:mb-1.5 [&>h3]:font-mono [&>h3]:font-semibold [&>h3]:text-[13px] [&>h3]:text-muted
					[&>p]:mb-3 [&>p]:text-fg
					[&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-[22px]
					[&>ol]:mb-3 [&>ol]:list-decimal [&>ol]:pl-[22px]
					[&_li]:my-1
					[&>hr]:my-6 [&>hr]:border-0 [&>hr]:border-line [&>hr]:border-t
					[&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline"
			>
				{children}
			</article>
		</div>
	);
}
