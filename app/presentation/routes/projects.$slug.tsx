import { buildBreadcrumbListLd, buildCreativeWorkLd } from "~/presentation/lib/jsonld";
import { buildMeta } from "~/presentation/lib/meta";
import MdxRenderer from "../components/content/MdxRenderer";
import OnThisPageToc from "../components/project/OnThisPageToc";
import ProjectFooterNav from "../components/project/ProjectFooterNav";
import ProjectMetaSidebar from "../components/project/ProjectMetaSidebar";
import type { Route } from "./+types/projects.$slug";

export const loader = async ({ context, params, request }: Route.LoaderArgs) => {
	if (!params.slug) throw new Response("Not Found", { status: 404 });
	const detail = await context.container.getProjectDetail(params.slug);
	const url = new URL(request.url);
	const origin = url.origin;
	return {
		...detail,
		origin,
		canonicalUrl: `${origin}${url.pathname}`,
		ogImageUrl: `${origin}/og/projects/${params.slug}.png`,
	};
};

export const meta: Route.MetaFunction = ({ data }) => {
	if (!data) return [{ title: "Project — tkstar.dev" }];
	const { project, origin, canonicalUrl, ogImageUrl } = data;
	return [
		...buildMeta({
			title: `${project.title} — tkstar.dev`,
			description: project.summary,
			canonical: canonicalUrl,
			ogImage: ogImageUrl,
			ogType: "article",
		}),
		{
			"script:ld+json": buildCreativeWorkLd({ project, origin, ogImage: ogImageUrl }),
		},
		{
			"script:ld+json": buildBreadcrumbListLd({
				items: [
					{ name: "Home", url: `${origin}/` },
					{ name: "Projects", url: `${origin}/projects` },
					{ name: project.title, url: canonicalUrl },
				],
			}),
		},
	];
};

export default function ProjectDetail({ loaderData }: Route.ComponentProps) {
	const { project, prev, next } = loaderData;
	return (
		<main className="mx-auto flex max-w-[var(--container-measure)] flex-col gap-[22px] px-[var(--spacing-gutter)] pt-[22px] pb-20 min-[720px]:gap-7 min-[720px]:px-7 min-[720px]:pt-9 min-[720px]:pb-[120px]">
			<header className="flex flex-col gap-2">
				<h1 className="flex items-center gap-2 m-0 font-sans text-[11px] tracking-[0.12em] uppercase text-muted">
					<span aria-hidden="true" className="text-accent">
						$
					</span>
					<span>cat projects/{project.slug}.mdx</span>
					<span aria-hidden="true" className="h-px flex-1 bg-line" />
				</h1>
				<h2 className="m-0 text-[28px] font-semibold tracking-[-0.01em] text-fg min-[720px]:text-[34px]">
					{project.title}
				</h2>
				<p className="font-sans text-[12px] text-faint">{project.summary}</p>
			</header>

			<div className="flex flex-col gap-8 min-[880px]:grid min-[880px]:grid-cols-[minmax(0,1fr)_280px] min-[880px]:gap-10">
				<article className="project-body">
					{project.body ? <MdxRenderer code={project.body} /> : null}
				</article>
				<div className="flex flex-col gap-6 min-[880px]:sticky min-[880px]:top-[calc(var(--height-topbar)+36px)] min-[880px]:self-start min-[880px]:max-h-[calc(100dvh-var(--height-topbar)-48px)] min-[880px]:overflow-y-auto">
					<ProjectMetaSidebar date={project.date} role={project.role} stack={project.stack} />
					<OnThisPageToc toc={project.toc ?? []} />
				</div>
			</div>

			<ProjectFooterNav
				prev={prev ? { slug: prev.slug, title: prev.title } : null}
				next={next ? { slug: next.slug, title: next.title } : null}
			/>
		</main>
	);
}
