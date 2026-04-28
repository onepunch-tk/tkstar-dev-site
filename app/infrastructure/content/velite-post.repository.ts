import { posts } from "#content";
import type { PostRepository } from "~/application/content/ports/post-repository.port";
import type { Post } from "~/domain/post/post.entity";
import { findAdjacent } from "./_shared/find-adjacent";
import { sortByDateDesc } from "./_shared/sort-by-date-desc";
import { toPost } from "./mappers/post.mapper";

const cache: Post[] = sortByDateDesc(posts.map(toPost));

export const velitePostRepository: PostRepository = {
	async findAll() {
		return cache;
	},
	async findBySlug(slug) {
		return cache.find((p) => p.slug === slug) ?? null;
	},
	async findRecent(n) {
		return cache.slice(0, n);
	},
	async findByTag(tag) {
		return cache.filter((p) => p.tags.includes(tag));
	},
	async findRelated(slug) {
		return findAdjacent(cache, slug);
	},
};
