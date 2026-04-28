import { posts } from "#content";
import type { PostRepository } from "~/application/content/ports/post-repository.port";
import type { Post } from "~/domain/post/post.entity";
import { toPost } from "./mappers/post.mapper";

const cache: Post[] = posts.map(toPost).sort((a, b) => b.date.localeCompare(a.date));

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
		const idx = cache.findIndex((p) => p.slug === slug);
		if (idx === -1) return { prev: null, next: null };
		return {
			prev: idx > 0 ? cache[idx - 1] : null,
			next: idx < cache.length - 1 ? cache[idx + 1] : null,
		};
	},
};
