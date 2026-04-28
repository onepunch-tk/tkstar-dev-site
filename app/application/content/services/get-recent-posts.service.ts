import type { Post } from "~/domain/post/post.entity";
import type { PostRepository } from "../ports/post-repository.port";

export const getRecentPosts = async (repo: PostRepository, n: number): Promise<Post[]> => {
	return repo.findRecent(n);
};
