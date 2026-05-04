import { useLocation } from "react-router";
import { buildMeta } from "~/presentation/lib/meta";
import type { Route } from "./+types/$";

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
	if (!data) {
		return [{ title: "Not Found — tkstar.dev" }, { name: "robots", content: "noindex, nofollow" }];
	}
	return buildMeta({
		title: "Not Found — tkstar.dev",
		description: "요청한 경로를 찾을 수 없습니다.",
		canonical: data.canonicalUrl,
		ogImage: data.ogImageUrl,
		robots: "noindex, nofollow",
	});
};

export default function NotFound() {
	const { pathname } = useLocation();
	return (
		<main className="container mx-auto p-4 font-sans">
			<pre>cd: no such route: {pathname}</pre>
		</main>
	);
}
