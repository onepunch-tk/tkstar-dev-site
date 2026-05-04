import { PNG_HEADERS, toPngBody } from "~/presentation/lib/png-response";
import type { Route } from "./+types/og.projects.$slug[.png]";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
	const { container } = context;
	const slug = params.slug;

	if (slug) {
		try {
			const png = await container.renderProjectOg(slug);
			if (png) {
				return new Response(toPngBody(png), { headers: PNG_HEADERS });
			}
		} catch (err) {
			console.error("[og:projects] render failed", err);
		}
	}

	const fallback = await container.loadFallbackOg();
	return new Response(toPngBody(fallback), { headers: PNG_HEADERS });
};
