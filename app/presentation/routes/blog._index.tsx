import { buildBreadcrumbListLd } from "~/presentation/lib/jsonld";
import { buildMeta } from "~/presentation/lib/meta";
import PostRow from "../components/post/PostRow";
import TagFilterChips from "../components/project/TagFilterChips";
import type { Route } from "./+types/blog._index";

export const loader = async ({ context, request }: Route.LoaderArgs) => {
	const url = new URL(request.url);
	const origin = url.origin;
	const tag = url.searchParams.get("tag") ?? undefined;
	const [posts, all] = await Promise.all([
		context.container.listPosts({ tag }),
		context.container.listPosts(),
	]);
	const allTags = Array.from(new Set(all.flatMap((p) => p.tags))).sort();
	return {
		posts,
		allTags,
		activeTag: tag ?? null,
		origin,
		canonicalUrl: `${origin}${url.pathname}`,
		ogImageUrl: `${origin}/og/fallback.png`,
	};
};

export const meta: Route.MetaFunction = ({ data }) => {
	if (!data) return [{ title: "Blog — tkstar.dev" }];
	return [
		...buildMeta({
			title: "Blog — tkstar.dev",
			description: "1인 개발자 김태곤의 기술 블로그 · 월 1편 운영.",
			canonical: data.canonicalUrl,
			ogImage: data.ogImageUrl,
		}),
		{
			"script:ld+json": buildBreadcrumbListLd({
				items: [
					{ name: "Home", url: `${data.origin}/` },
					{ name: "Blog", url: data.canonicalUrl },
				],
			}),
		},
	];
};

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
	const { posts, allTags, activeTag } = loaderData;
	return (
		<main className="mx-auto flex max-w-[var(--container-measure)] flex-col gap-[22px] px-[var(--spacing-gutter)] pt-[22px] pb-20 min-[720px]:gap-7 min-[720px]:px-7 min-[720px]:pt-9 min-[720px]:pb-[120px]">
			<header className="flex flex-col gap-2">
				<h1 className="flex items-center gap-2 m-0 font-sans text-[11px] tracking-[0.12em] uppercase text-muted">
					<span aria-hidden="true" className="text-accent">
						$
					</span>
					<span>ls -la blog/</span>
					<span aria-hidden="true" className="h-px flex-1 bg-line" />
				</h1>
				<p className="font-sans text-[12px] text-faint">
					total {posts.length} · D1 posts · sorted by date desc
				</p>
			</header>

			<TagFilterChips tags={allTags} activeTag={activeTag} />

			{posts.length === 0 ? (
				<div data-testid="empty-state" className="flex flex-col gap-1 font-sans text-[12px]">
					<div className="text-muted">$ grep -l 'tag:{activeTag ?? "*"}' posts/*.mdx</div>
					<div className="text-faint">No matches.</div>
				</div>
			) : (
				<div className="flex flex-col">
					<div
						aria-hidden="true"
						className="hidden border-line-strong border-b-[1.5px] py-1 font-sans text-[11px] text-faint tracking-[0.08em] uppercase min-[720px]:grid min-[720px]:grid-cols-[72px_1fr_minmax(0,200px)_60px] min-[720px]:gap-2.5"
					>
						<span>date</span>
						<span>title · summary</span>
						<span className="text-right">tags</span>
						<span className="text-right">updated</span>
					</div>
					{posts.map((p) => (
						<PostRow key={p.slug} post={p} />
					))}
				</div>
			)}
		</main>
	);
}
