import FeaturedProjectCard from "../components/home/FeaturedProjectCard";
import HeroWhoami from "../components/home/HeroWhoami";
import RecentPostsList from "../components/home/RecentPostsList";
import type { Route } from "./+types/_index";

export const meta: Route.MetaFunction = () => [
	{ title: "tkstar.dev" },
	{ name: "description", content: "1인 개발자 김태곤의 풀스택 작업물 · 글 · 이력." },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
	const [featured, posts] = await Promise.all([
		context.container.getFeaturedProject(),
		context.container.getRecentPosts(3),
	]);
	return { featured, posts };
};

const SECTION_HEADER_CLASS =
	"flex items-center gap-2 m-0 font-mono text-[11px] tracking-[0.12em] uppercase text-muted";

export default function Index({ loaderData }: Route.ComponentProps) {
	const { featured, posts } = loaderData;
	return (
		<main className="mx-auto flex max-w-[var(--container-measure)] flex-col gap-[22px] px-[var(--spacing-gutter)] pt-[22px] pb-20 min-[720px]:gap-7 min-[720px]:px-7 min-[720px]:pt-9 min-[720px]:pb-[120px]">
			<HeroWhoami />

			<section
				data-testid="featured-section"
				aria-labelledby="featured-heading"
				className="flex flex-col gap-1.5"
			>
				<h2 id="featured-heading" className={SECTION_HEADER_CLASS}>
					<span aria-hidden="true" className="text-accent">
						##
					</span>
					<span>featured</span>
					<span aria-hidden="true" className="h-px flex-1 bg-line" />
				</h2>
				{featured && <FeaturedProjectCard project={featured} />}
			</section>

			<section
				data-testid="recent-section"
				aria-labelledby="recent-heading"
				className="flex flex-col gap-1.5"
			>
				<h2 id="recent-heading" className={SECTION_HEADER_CLASS}>
					<span aria-hidden="true" className="text-accent">
						##
					</span>
					<span>recent posts</span>
					<span aria-hidden="true" className="h-px flex-1 bg-line" />
				</h2>
				<RecentPostsList posts={posts} />
			</section>
		</main>
	);
}
