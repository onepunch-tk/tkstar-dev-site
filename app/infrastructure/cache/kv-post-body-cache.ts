import type { Root as HastRoot } from "hast";
import type { PostBodyCache } from "~/application/content/ports/post-body-cache.port";

const buildKey = (slug: string, hash: string) => `post:${slug}:body:v${hash}`;

export const createKvPostBodyCache = (kv: KVNamespace): PostBodyCache => ({
	get: async (slug, hash) => {
		const cached = await kv.get(buildKey(slug, hash), "json");
		return cached === null ? null : (cached as HastRoot);
	},
	set: async (slug, hash, hast) => {
		await kv.put(buildKey(slug, hash), JSON.stringify(hast));
	},
});
