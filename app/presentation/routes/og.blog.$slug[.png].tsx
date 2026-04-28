const EMPTY_PNG_B64 =
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export const loader = () => {
	const bytes = Uint8Array.from(atob(EMPTY_PNG_B64), (c) => c.charCodeAt(0));
	return new Response(bytes, {
		headers: {
			"Content-Type": "image/png",
			// TODO(T018): flip to `public, max-age=..., immutable` once Satori-generated
			"Cache-Control": "no-store",
		},
	});
};
