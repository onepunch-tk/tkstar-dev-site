import type { Root as HastRoot } from "hast";
import type { PostBodyCache } from "~/application/content/ports/post-body-cache.port";

const buildKey = (slug: string, hash: string) => `post:${slug}:body:v${hash}`;

// KV 는 system boundary — 수동 `wrangler kv put` / schema 마이그레이션 잔존으로 잘못된 shape 가 들어올 수 있어
// `type === "root"` 만 빠르게 확인. 실패 시 null 반환 → caller 는 cache miss 와 동일하게 재컴파일.
const isHastRoot = (value: unknown): value is HastRoot =>
	typeof value === "object" && value !== null && (value as { type?: unknown }).type === "root";

export const createKvPostBodyCache = (kv: KVNamespace): PostBodyCache => ({
	get: async (slug, hash) => {
		const cached = await kv.get(buildKey(slug, hash), "json");
		return isHastRoot(cached) ? cached : null;
	},
	set: async (slug, hash, hast) => {
		await kv.put(buildKey(slug, hash), JSON.stringify(hast));
	},
});
