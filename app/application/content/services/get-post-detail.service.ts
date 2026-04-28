import type { Post } from "~/domain/post/post.entity";
import { PostNotFoundError } from "~/domain/post/post.errors";
import type { PostRepository } from "../ports/post-repository.port";

export const getPostDetail = async (
	repo: PostRepository,
	slug: string,
): Promise<{ post: Post; prev: Post | null; next: Post | null }> => {
	const post = await repo.findBySlug(slug);
	if (!post) throw new PostNotFoundError(slug);
	const { prev, next } = await repo.findRelated(slug);
	return { post, prev, next };
};
