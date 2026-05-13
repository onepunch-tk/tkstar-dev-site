import { getSiteOrigin, isLaunched } from "~/application/seo/launch-gate";
import type { Route } from "./+types/robots[.txt]";

export const loader = ({ context }: Route.LoaderArgs) => {
	const env = context.cloudflare.env as Env;
	const body = isLaunched(env)
		? `User-agent: *\nAllow: /\nSitemap: ${getSiteOrigin(env)}/sitemap.xml\n`
		: "User-agent: *\nDisallow: /\n";
	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
