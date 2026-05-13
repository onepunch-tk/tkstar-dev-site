import { getSiteOrigin, isLaunched } from "~/application/seo/launch-gate";
import type { Route } from "./+types/sitemap[.xml]";

const EMPTY_URLSET =
	'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';

export const loader = async ({ context }: Route.LoaderArgs) => {
	const env = context.cloudflare.env as Env;
	const xml = isLaunched(env)
		? await context.container.buildSitemap(getSiteOrigin(env))
		: EMPTY_URLSET;
	return new Response(xml, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
};
