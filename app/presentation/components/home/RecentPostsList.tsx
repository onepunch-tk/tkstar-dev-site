import { Link } from "react-router";

import type { Post } from "../../../domain/post/post.entity";

const ROW_LINK_CLASS =
	"grid grid-cols-[1fr_auto] min-[560px]:grid-cols-[88px_1fr_auto] gap-2.5 py-3.5 border-b border-line font-mono text-[13px] items-baseline no-underline text-fg transition-colors duration-[var(--duration-120)] ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";

const ROW_DATE_CLASS =
	"text-muted text-[11px] min-[560px]:text-[11px] col-span-full min-[560px]:col-span-1";

const ROW_TITLE_CLASS = "text-fg font-medium";

const ROW_META_CLASS = "text-muted text-[11px]";

const GHOST_BTN_CLASS =
	"inline-flex items-center gap-2 rounded-md border border-line bg-transparent px-4 py-2.5 font-mono text-[13px] font-medium text-muted transition-colors duration-[var(--duration-120)] ease-out hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";

type Props = { posts: Post[] };

export default function RecentPostsList({ posts }: Props) {
	return (
		<>
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
						<span className={ROW_META_CLASS}>{p.read} min</span>
					</Link>
				))}
			</div>

			<div className="mt-4">
				<Link to="/blog" className={GHOST_BTN_CLASS}>
					모두 보기 →
				</Link>
			</div>
		</>
	);
}
