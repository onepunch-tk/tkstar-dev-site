import type { Post } from "~/domain/post/post.entity";

export type PostStatusFilter = "draft" | "published" | "all";

export interface PostQueryOptions {
	status?: PostStatusFilter;
}

export interface TocEntry {
	slug: string;
	text: string;
}

export interface PostRepository {
	findAll(options?: PostQueryOptions): Promise<Post[]>;
	findBySlug(slug: string, options?: PostQueryOptions): Promise<Post | null>;
	findRecent(n: number, options?: PostQueryOptions): Promise<Post[]>;
	findByTag(tag: string, options?: PostQueryOptions): Promise<Post[]>;
	findRelated(
		slug: string,
		options?: PostQueryOptions,
	): Promise<{ prev: Post | null; next: Post | null }>;
	findBodyBySlug(
		slug: string,
		options?: PostQueryOptions,
	): Promise<{ body: string; toc: TocEntry[] } | null>;
}
