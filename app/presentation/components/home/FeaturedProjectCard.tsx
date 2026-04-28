import { Link } from "react-router";

import type { Project } from "../../../domain/project/project.entity";

// 정본 매핑 정리:
// - prototype.css:257-264 .card / .card.hover → bg-bg-elev border-line rounded-lg p-4 + hover:border-accent (transition-colors 120ms)
// - prototype.css:287-302 .cover → 16:9 비율 + repeating-linear-gradient(45deg, hatch) + var(--proto-elev) 배경 + line border + faint 텍스트 "cover · 16:9"
// - prototype.css:209-218 .pill2 → border line-strong + rounded-full + font-mono text-[11px] text-muted tracking-[0.02em] + px-2 py-0.5
// - prototype.css:163-170 .h2 → font-mono font-semibold clamp(1.25rem,3.4vw,1.5rem) leading-[1.2] tracking-[-0.01em]
// - prototype.css:177-181 .body + .dim → text-muted text-sm leading-[1.7]
// 가이드라인은 a11y 측면에서 cover 이미지 alt=""(decorative)로 두고 h2 title이 의미 전달.

type Props = { project: Project };

// .cover hatch 패턴 — 정본의 var(--hatch)는 dark/light에서 각각 rgba(232,235,239,0.04) / rgba(26,28,32,0.05).
// app.css 토큰에 --hatch가 아직 없어 Tailwind arbitrary 값으로 직접 expressed (oklab color-mix로 토큰 친화적 톤).
// Tailwind v4 arbitrary CSS image 문법으로 module-scope 상수에 고정 — per-render allocation 회피 (§3.0).
const COVER_HATCH_CLASS =
	"bg-bg-elev bg-[image:repeating-linear-gradient(45deg,color-mix(in_oklab,var(--color-fg)_4%,transparent)_0_8px,transparent_8px_16px)]";

export default function FeaturedProjectCard({ project }: Props) {
	return (
		<Link
			to={`/projects/${project.slug}`}
			className="block rounded-lg border border-line bg-bg-elev p-4 text-fg no-underline transition-colors duration-120 ease-out hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
		>
			{/* .cover — 16:9, hatch 패턴 placeholder. cover URL 존재 시 img로 대체하되 항상 testid='cover' wrapper 유지. */}
			<div
				data-testid="cover"
				className="mb-3 aspect-video w-full overflow-hidden rounded-sm border border-line"
			>
				{project.cover ? (
					<img src={project.cover} alt="" className="h-full w-full object-cover" />
				) : (
					<div
						className={`flex h-full w-full items-center justify-center font-mono text-[11px] text-faint tracking-[0.06em] ${COVER_HATCH_CLASS}`}
					>
						cover · 16:9
					</div>
				)}
			</div>

			{/* .cluster — pill2 stack tags (mb-1.5는 정본 marginBottom: 6) */}
			<div className="mb-1.5 flex flex-wrap gap-2">
				{project.stack.map((s) => (
					<span
						key={s}
						className="inline-block rounded-full border border-line-strong px-2 py-0.5 font-mono text-[11px] text-muted tracking-[0.02em]"
					>
						{s}
					</span>
				))}
			</div>

			{/* .h2 — 정본의 line-height 1.2 + tracking -0.01em */}
			<h2 className="m-0 font-mono font-semibold text-[clamp(1.25rem,3.4vw,1.5rem)] leading-[1.2] tracking-[-0.01em]">
				{project.title}
			</h2>

			{/* .body.dim — margin: '6px 0 0' */}
			<p className="m-0 mt-1.5 text-muted text-sm leading-[1.7]">{project.summary}</p>
		</Link>
	);
}
