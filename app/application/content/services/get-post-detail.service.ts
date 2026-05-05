import type { Post } from "~/domain/post/post.entity";
import { PostNotFoundError } from "~/domain/post/post.errors";
import type { PostRepository } from "../ports/post-repository.port";
import { assertExists } from "./_shared/assert-exists";

export const getPostDetail = async (
	repo: PostRepository,
	slug: string,
): Promise<{ post: Post; prev: Post | null; next: Post | null }> => {
	const post = assertExists(await repo.findBySlug(slug), () => new PostNotFoundError(slug));
	const { prev, next } = await repo.findRelated(slug);
	return { post, prev, next };
};
