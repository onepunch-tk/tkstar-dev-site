import { Link } from "react-router";

type Props = { slug: string };

const ROW_LINK_CLASS =
	"grid grid-cols-[1fr_auto] items-baseline gap-2.5 border-line border-b last:border-b-0 py-3 font-mono text-[13px] text-fg no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none [&>span:first-child]:col-span-2 [&>span:first-child]:text-[10px] min-[560px]:grid-cols-[88px_1fr_auto] min-[560px]:[&>span:first-child]:col-span-1 min-[560px]:[&>span:first-child]:text-[11px]";

export default function AppCard({ slug }: Props) {
	return (
		<div className="rounded-md border border-line bg-bg-elev px-4 py-3.5">
			<div className="mb-1.5 flex items-center gap-2">
				<span className="inline-block rounded-full border border-accent px-2 py-0.5 font-mono text-[11px] text-accent tracking-[0.02em]">
					app
				</span>
				<span className="inline-block rounded-full border border-line-strong px-2 py-0.5 font-mono text-[11px] text-muted tracking-[0.02em]">
					v1.0
				</span>
			</div>
			<div className="font-mono font-semibold text-[15px] text-fg">{slug}</div>
			<div className="mt-1 font-mono text-[12px] text-faint">/legal/apps/</div>
			<hr className="my-3 border-0 border-t border-line" />
			<div className="flex flex-col">
				<Link to={`/legal/${slug}/terms`} className={ROW_LINK_CLASS}>
					<span className="text-faint">terms.mdx</span>
					<span className="font-medium text-fg">이용약관</span>
					<span className="text-[11px] text-faint">→</span>
				</Link>
				<Link to={`/legal/${slug}/privacy`} className={ROW_LINK_CLASS}>
					<span className="text-faint">privacy.mdx</span>
					<span className="font-medium text-fg">개인정보 처리방침</span>
					<span className="text-[11px] text-faint">→</span>
				</Link>
			</div>
		</div>
	);
}
