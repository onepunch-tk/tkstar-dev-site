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
	"flex items-center gap-2 mt-6 mb-2 font-mono text-[11px] tracking-[0.12em] uppercase text-faint before:content-['##'] before:text-accent after:content-[''] after:flex-1 after:h-px after:bg-line";

export default function Index({ loaderData }: Route.ComponentProps) {
	const { featured, posts } = loaderData;
	return (
		<main className="mx-auto max-w-[var(--container-measure)] px-[var(--spacing-gutter)] py-6">
			<HeroWhoami />

			<section data-testid="featured-section" aria-labelledby="featured-heading">
				<h2 id="featured-heading" className={SECTION_HEADER_CLASS}>
					<span>featured</span>
				</h2>
				{featured && <FeaturedProjectCard project={featured} />}
			</section>

			<section data-testid="recent-section" aria-labelledby="recent-heading">
				<h2 id="recent-heading" className={SECTION_HEADER_CLASS}>
					<span>recent posts</span>
				</h2>
				<RecentPostsList posts={posts} />
			</section>
		</main>
	);
}
