import type { Route } from "./+types/sitemap[.xml]";

export const loader = async ({ context, request }: Route.LoaderArgs) => {
	const origin = new URL(request.url).origin;
	const xml = await context.container.buildSitemap(origin);
	return new Response(xml, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
};
