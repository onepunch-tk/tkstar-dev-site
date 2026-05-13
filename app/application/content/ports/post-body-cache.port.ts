import type { Root as HastRoot } from "hast";

export interface PostBodyCache {
	get(slug: string, hash: string): Promise<HastRoot | null>;
	set(slug: string, hash: string, hast: HastRoot): Promise<void>;
}
