import { buildBreadcrumbListLd, buildPersonLd } from "~/presentation/lib/jsonld";
import { buildMeta } from "~/presentation/lib/meta";
import AboutHeader from "../components/about/AboutHeader";
import AwardsCard from "../components/about/AwardsCard";
import CareerTimeline from "../components/about/CareerTimeline";
import EducationCard from "../components/about/EducationCard";
import StackCards from "../components/about/StackCards";
import type { Route } from "./+types/about";

export const loader = ({ request }: Route.LoaderArgs) => {
	const url = new URL(request.url);
	const origin = url.origin;
	return {
		origin,
		canonicalUrl: `${origin}${url.pathname}`,
		ogImageUrl: `${origin}/og/fallback.png`,
	};
};

export const meta: Route.MetaFunction = ({ data }) => {
	if (!data) return [{ title: "About — tkstar.dev" }];
	return [
		...buildMeta({
			title: "About — tkstar.dev",
			description: "1인 개발자 김태곤 — 풀스택 · 제품 설계부터 운영까지.",
			canonical: data.canonicalUrl,
			ogImage: data.ogImageUrl,
		}),
		{ "script:ld+json": buildPersonLd({ origin: data.origin }) },
		{
			"script:ld+json": 				buildBreadcrumbListLd({
					items: [
						{ name: "Home", url: `${data.origin}/` },
						{ name: "About", url: data.canonicalUrl },
					],
				}),
		},
	];
};

export default function About() {
	return (
		<main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 sm:gap-14 sm:py-12">
			<AboutHeader />
			<StackCards />
			<CareerTimeline />
			<EducationCard />
			<AwardsCard />
		</main>
	);
}
