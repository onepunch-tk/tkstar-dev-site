import { Link } from "react-router";

import type { Post } from "../../../domain/post/post.entity";

// 정본 매핑 정리:
// - prototype.css:319-340 .row-link → grid grid-cols-[88px_1fr_auto] gap-2.5 py-3.5 border-b border-line
//   font-mono text-[13px] items-baseline no-underline text-fg + transition-colors 120ms + hover:text-accent
//   모바일(<560px) → grid-cols-[1fr_auto] + .date col-span-full font-size 10px
// - .row-link 내부: .date faint 11px / .title fg font-medium / .meta faint 11px
// - prototype.css:479 .stack default 12px gap, 본 컴포넌트는 row-link border-b로 구분되므로 gap-0
// - .btn.ghost (prototype.css) → inline-flex items-center gap-2 px-4 py-2.5 border border-line rounded-md
//   bg-transparent text-muted font-mono text-[13px] font-medium + transition-colors 120ms
//   hover → border-accent text-accent
//
// className은 module top-level 상수로 추출 — per-render allocation 회피 (§3.0).
// HeroWhoami / FeaturedProjectCard 패턴과 동일.

const ROW_LINK_CLASS =
	"grid grid-cols-[1fr_auto] sm:grid-cols-[88px_1fr_auto] gap-2.5 py-3.5 border-b border-line font-mono text-[13px] items-baseline no-underline text-fg transition-colors duration-120 ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";

const ROW_DATE_CLASS = "text-faint text-[10px] sm:text-[11px] col-span-full sm:col-span-1";

const ROW_TITLE_CLASS = "text-fg font-medium";

const ROW_META_CLASS = "text-faint text-[11px]";

const GHOST_BTN_CLASS =
	"inline-flex items-center gap-2 rounded-sm border border-line bg-transparent px-4 py-2.5 font-mono text-[13px] font-medium text-muted transition-colors duration-120 ease-out hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";

type Props = { posts: Post[] };

export default function RecentPostsList({ posts }: Props) {
	return (
		<>
			{/* .stack { gap: 0 } — row-link border-b가 구분선 역할 */}
			<div className="flex flex-col gap-0">
				{posts.map((p) => (
					<Link
						key={p.slug}
						to={`/blog/${p.slug}`}
						data-testid="post-row"
						className={ROW_LINK_CLASS}
					>
						<span className={ROW_DATE_CLASS}>{p.date}</span>
						<span className={ROW_TITLE_CLASS}>{p.title}</span>
						<span className={ROW_META_CLASS}>{p.read}</span>
					</Link>
				))}
			</div>

			{/* "모두 보기 →" 링크는 posts 길이와 무관하게 항상 렌더 (테스트 5) */}
			<div className="mt-4">
				<Link to="/blog" className={GHOST_BTN_CLASS}>
					모두 보기 →
				</Link>
			</div>
		</>
	);
}
