import { Link } from "react-router";
import { useCommandPalette } from "../../hooks/useCommandPalette";

// 정본 prototype.css의 .btn / .btn.primary / .btn.ghost 클래스를 Tailwind v4 토큰으로 1:1 포팅.
// module top-level 상수로 두어 per-render allocation 회피 (§3.0).
const BTN_BASE =
	"inline-flex items-center gap-2 rounded-sm border px-4 py-2.5 font-mono text-[13px] font-medium transition-colors duration-120 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const BTN_DEFAULT = `${BTN_BASE} border-line-strong bg-transparent text-fg hover:border-accent hover:text-accent`;

// .btn.primary — 다크/라이트 양쪽에서 정본 색 분배 (text-bg는 토큰이 자동 반전: dark #0d0f12, light #f4f1ea).
const BTN_PRIMARY = `${BTN_BASE} border-accent bg-accent text-bg hover:brightness-110`;

// .btn.ghost — text-muted + border-line (정본 .btn.ghost와 1:1).
const BTN_GHOST = `${BTN_BASE} border-line bg-transparent text-muted hover:border-accent hover:text-accent`;

export default function HeroWhoami() {
	const { open } = useCommandPalette();

	return (
		<section aria-labelledby="hero-heading" className="flex flex-col">
			{/* PromptLine — 정본 .prompt 1:1 (tkstar@dev:~$ whoami) */}
			<div className="mb-3 flex items-baseline gap-0 font-mono text-faint text-xs">
				<span className="text-accent">tkstar@dev</span>
				<span className="text-faint">:</span>
				<span className="text-accent-warm">~</span>
				<span className="mr-1.5 text-faint">$</span>
				<span className="text-fg">whoami</span>
			</div>

			{/* .h1 — clamp(28px,6vw,44px), letter-spacing -0.02em, line-height 1.1 */}
			<h1
				id="hero-heading"
				className="m-0 font-mono font-bold leading-[1.1] tracking-[-0.02em] text-[clamp(1.75rem,6vw,2.75rem)]"
			>
				ship <span className="text-accent">solo</span>.<br />
				<span className="text-muted">ship </span>fast<span className="text-muted">.</span>
			</h1>

			{/* .body.dim — fg→muted, 14px, line-height 1.7, maxWidth 540px */}
			<p className="mt-3 max-w-[540px] text-muted text-sm leading-[1.7]">
				1인 개발자 김태곤. 풀스택 · 제품 설계부터 운영까지 혼자서. 웹/앱을 처음부터 끝까지 짓고
				굴립니다.
			</p>

			{/* .cluster + gap 8 */}
			<div className="mt-5 flex flex-wrap items-center gap-2">
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
