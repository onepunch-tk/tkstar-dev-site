import type { Post } from "~/domain/post/post.entity";
import { PostNotFoundError } from "~/domain/post/post.errors";
import type { PostRepository, TocEntry } from "../ports/post-repository.port";
import { assertExists } from "./_shared/assert-exists";

export const getPostDetail = async (
	repo: PostRepository,
	slug: string,
): Promise<{
	post: Post;
	toc: TocEntry[];
	prev: Post | null;
	next: Post | null;
}> => {
	const post = assertExists(await repo.findBySlug(slug), () => new PostNotFoundError(slug));
	const [bodyResult, related] = await Promise.all([
		repo.findBodyBySlug(slug),
		repo.findRelated(slug),
	]);
	return { post, toc: bodyResult?.toc ?? [], prev: related.prev, next: related.next };
};
