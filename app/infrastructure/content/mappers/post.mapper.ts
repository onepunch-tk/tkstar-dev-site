import type { Post } from "~/domain/post/post.entity";

type VelitePostInput = {
	slug: string;
	title: string;
	lede: string;
	date: string;
	tags: string[];
	read: number;
	body?: string;
};

export const toPost = (raw: VelitePostInput): Post => ({
	slug: raw.slug,
	title: raw.title,
	lede: raw.lede,
	date: raw.date,
	tags: raw.tags,
	read: raw.read,
});
