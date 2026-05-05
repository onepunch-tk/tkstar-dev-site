import type { Post } from "~/domain/post/post.entity";

export interface PostRepository {
	findAll(): Promise<Post[]>;
	findBySlug(slug: string): Promise<Post | null>;
	findRecent(n: number): Promise<Post[]>;
	findByTag(tag: string): Promise<Post[]>;
	findRelated(slug: string): Promise<{ prev: Post | null; next: Post | null }>;
}
