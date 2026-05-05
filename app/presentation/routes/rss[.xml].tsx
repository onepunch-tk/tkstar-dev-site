import type { Route } from "./+types/rss[.xml]";

export const loader = async ({ context }: Route.LoaderArgs) => {
	const xml = await context.container.buildRssFeed();
	return new Response(xml, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
};
