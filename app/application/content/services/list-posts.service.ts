import type { Post } from "~/domain/post/post.entity";
import type { PostRepository } from "../ports/post-repository.port";

export const listPosts = async (repo: PostRepository, opts?: { tag?: string }): Promise<Post[]> => {
	if (opts?.tag) return repo.findByTag(opts.tag);
	return repo.findAll();
};
