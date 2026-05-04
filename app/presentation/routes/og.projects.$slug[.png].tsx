import type { Route } from "./+types/og.projects.$slug[.png]";

const PNG_HEADERS = {
	"Content-Type": "image/png",
	"Cache-Control": "public, max-age=31536000, immutable",
} as const;

const toBody = (png: Uint8Array): ArrayBuffer =>
	png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;

export const loader = async ({ context, params }: Route.LoaderArgs) => {
	const { container } = context;
	const slug = params.slug;

	if (slug) {
		try {
			const png = await container.renderProjectOg(slug);
			if (png) {
				return new Response(toBody(png), { headers: PNG_HEADERS });
			}
		} catch (err) {
			console.error("[og:projects] render failed", err);
		}
	}

	const fallback = await container.loadFallbackOg();
	return new Response(toBody(fallback), { headers: PNG_HEADERS });
};
