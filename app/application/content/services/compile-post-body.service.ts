import type { Root as HastRoot } from "hast";
import type { CompileMarkdown } from "~/application/content/ports/markdown-compiler.port";
import type { PostBodyCache } from "~/application/content/ports/post-body-cache.port";

export const computeBodyHash = async (rawMarkdown: string): Promise<string> => {
	const encoded = new TextEncoder().encode(rawMarkdown);
	const buffer = await crypto.subtle.digest("SHA-256", encoded);
	const hex = Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hex.slice(0, 16);
};

export const compilePostBody = async (
	cache: PostBodyCache,
	compile: CompileMarkdown,
	args: { slug: string; rawMarkdown: string },
): Promise<{ hast: HastRoot; hash: string; cacheHit: boolean }> => {
	const hash = await computeBodyHash(args.rawMarkdown);
	const cached = await cache.get(args.slug, hash);
	if (cached !== null) {
		return { hast: cached, hash, cacheHit: true };
	}
	const hast = await compile(args.rawMarkdown);
	await cache.set(args.slug, hash, hast);
	return { hast, hash, cacheHit: false };
};
