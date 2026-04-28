import { Link } from "react-router";
import { useCommandPalette } from "../../hooks/useCommandPalette";

const BTN_BASE =
	"inline-flex items-center gap-2 rounded-md border px-4 py-2.5 font-mono text-[13px] font-medium duration-[var(--duration-120)] ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const BTN_DEFAULT = `${BTN_BASE} transition-colors border-line-strong bg-transparent text-fg hover:border-accent hover:text-accent`;

const BTN_PRIMARY = `${BTN_BASE} transition-[color,background-color,border-color,filter] border-accent bg-accent text-bg hover:brightness-[1.08]`;

const BTN_GHOST = `${BTN_BASE} transition-colors border-line bg-transparent text-muted hover:border-accent hover:text-accent`;

export default function HeroWhoami() {
	const { open } = useCommandPalette();

	return (
		<section aria-labelledby="hero-heading" className="flex flex-col gap-3 sm:gap-[22px]">
			<div className="flex items-baseline gap-0 font-mono text-faint text-xs">
				<span className="text-accent">tkstar@dev</span>
				<span className="text-faint">:</span>
				<span className="text-accent-warm">~</span>
				<span className="mr-1.5 text-faint">$</span>
				<span className="text-fg">whoami</span>
			</div>

			<h1
				id="hero-heading"
				className="m-0 font-mono font-bold leading-[1.1] tracking-[-0.02em] text-[clamp(1.75rem,6vw,2.75rem)]"
			>
				ship <span className="text-accent">solo</span>.<br />
				<span className="text-muted">ship </span>fast<span className="text-muted">.</span>
			</h1>

			<p className="m-0 max-w-[540px] text-muted text-sm leading-[1.7]">
				1인 개발자 김태곤. 풀스택 · 제품 설계부터 운영까지 혼자서. 웹/앱을 처음부터 끝까지 짓고
				굴립니다.
			</p>

			<div className="mt-2 flex flex-wrap items-center gap-2">
				<button type="button" onClick={open} className={BTN_PRIMARY}>
					›&nbsp;&nbsp;검색해서 이동
				</button>
				<Link to="/about" className={BTN_DEFAULT}>
					/about
				</Link>
				<Link to="/projects" className={BTN_GHOST}>
					/projects
				</Link>
			</div>
		</section>
	);
}
