import ProjectRow from "../components/project/ProjectRow";
import TagFilterChips from "../components/project/TagFilterChips";

import type { Route } from "./+types/projects._index";

export const meta: Route.MetaFunction = () => [{ title: "Projects — tkstar.dev" }];

export const loader = async ({ context, request }: Route.LoaderArgs) => {
	const url = new URL(request.url);
	const tag = url.searchParams.get("tag") ?? undefined;
	const [projects, all] = await Promise.all([
		context.container.listProjects({ tag }),
		context.container.listProjects(),
	]);
	const allTags = Array.from(new Set(all.flatMap((p) => p.tags))).sort();
	return { projects, allTags, activeTag: tag ?? null };
};

export default function ProjectsIndex({ loaderData }: Route.ComponentProps) {
	const { projects, allTags, activeTag } = loaderData;
	return (
		<main className="mx-auto flex max-w-[var(--container-measure)] flex-col gap-[22px] px-[var(--spacing-gutter)] pt-[22px] pb-20 min-[720px]:gap-7 min-[720px]:px-7 min-[720px]:pt-9 min-[720px]:pb-[120px]">
			<header className="flex flex-col gap-2">
				<h1 className="flex items-center gap-2 m-0 font-mono text-[11px] tracking-[0.12em] uppercase text-muted">
					<span aria-hidden="true" className="text-accent">
						$
					</span>
					<span>ls -la projects/</span>
					<span aria-hidden="true" className="h-px flex-1 bg-line" />
				</h1>
				<p className="font-mono text-[12px] text-faint">
					total {projects.length} · velite collection · sorted by date desc
				</p>
			</header>

			<TagFilterChips tags={allTags} activeTag={activeTag} />

			{projects.length === 0 ? (
				<div data-testid="empty-state" className="flex flex-col gap-1 font-mono text-[12px]">
					<div className="text-muted">$ grep -l 'tag:{activeTag ?? "*"}' projects/*.mdx</div>
					<div className="text-faint">No matches.</div>
				</div>
			) : (
				<div className="flex flex-col">
					<div
						aria-hidden="true"
						className="hidden border-line-strong border-b-[1.5px] py-1 font-mono text-[11px] text-faint tracking-[0.08em] uppercase min-[720px]:grid min-[720px]:grid-cols-[72px_140px_1fr_minmax(0,200px)] min-[720px]:gap-2.5"
					>
						<span>date</span>
						<span>slug</span>
						<span>title · summary</span>
						<span className="text-right">stack</span>
					</div>
					{projects.map((p) => (
						<ProjectRow key={p.slug} project={p} />
					))}
				</div>
			)}
		</main>
	);
}
