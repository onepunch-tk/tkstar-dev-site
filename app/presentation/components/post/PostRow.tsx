import { Link } from "react-router";

import type { Post } from "../../../domain/post/post.entity";
import { formatDate } from "../../lib/format";

type Props = { post: Post };

export default function PostRow({ post }: Props) {
	const date = formatDate(post.date);
	return (
		<Link
			to={`/blog/${post.slug}`}
			data-testid="post-row"
			className="grid grid-cols-[1fr_auto] items-baseline gap-2.5 border-line border-b border-dashed py-3.5 font-mono text-[13px] text-fg no-underline transition-colors duration-[var(--duration-120)] ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none min-[720px]:grid-cols-[72px_1fr_minmax(0,200px)_60px]"
		>
			<span className="hidden text-[11px] text-muted min-[720px]:inline">{date}</span>
			<div className="flex flex-col gap-0.5">
				<span className="font-mono text-[11px] text-accent min-[720px]:hidden">{date}</span>
				<span className="font-semibold text-fg">{post.title}</span>
				<span className="text-[11px] text-muted">{post.lede}</span>
			</div>
			<div className="flex flex-wrap justify-end gap-1.5">
				{post.tags.map((t) => (
					<span
						key={t}
						className="inline-block rounded-full border border-line-strong px-2 py-0.5 font-mono text-[11px] text-muted tracking-[0.02em]"
					>
						{t}
					</span>
				))}
			</div>
			<span className="hidden text-right text-[11px] text-muted min-[720px]:inline">
				{post.read} min
			</span>
		</Link>
	);
}
