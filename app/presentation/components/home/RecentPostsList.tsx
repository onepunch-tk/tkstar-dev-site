import { Link } from "react-router";

import type { Post } from "../../../domain/post/post.entity";

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
						className="grid grid-cols-[1fr_auto] min-[560px]:grid-cols-[88px_1fr_auto] items-baseline gap-2.5 border-line border-b py-3.5 font-mono text-[13px] text-fg no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
					>
						<span className="col-span-full text-[11px] text-muted min-[560px]:col-span-1 min-[560px]:text-[11px]">
							{p.date}
						</span>
						<span className="font-medium text-fg">{p.title}</span>
						<span className="text-[11px] text-muted">{p.read} min</span>
					</Link>
				))}
			</div>

			<div className="mt-4">
				<Link
					to="/blog"
					className="inline-flex items-center gap-2 rounded-md border border-line bg-transparent px-4 py-2.5 font-medium font-mono text-[13px] text-muted transition-colors duration-[var(--duration-120)] ease-out hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
				>
					모두 보기 →
				</Link>
			</div>
		</>
	);
}
