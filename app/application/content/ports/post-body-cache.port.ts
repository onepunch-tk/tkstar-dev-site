export type CachedHast = unknown;

export interface PostBodyCache {
	get(slug: string, hash: string): Promise<CachedHast | null>;
	set(slug: string, hash: string, hast: CachedHast): Promise<void>;
}
