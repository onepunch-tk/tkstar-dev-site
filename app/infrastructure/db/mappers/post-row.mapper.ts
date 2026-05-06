import type { Post } from "~/domain/post/post.entity";

export interface PostRow {
	slug: string;
	title: string;
	summary: string | null;
	tags: string;
	date_published: string | null;
	status: "draft" | "published";
	created_at: number;
	updated_at: number;
}

const parseTags = (raw: string): string[] => {
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) && parsed.every((t) => typeof t === "string") ? parsed : [];
	} catch {
		return [];
	}
};

export const toPost = (row: PostRow): Post => ({
	slug: row.slug,
	title: row.title,
	summary: row.summary,
	datePublished: row.date_published,
	tags: parseTags(row.tags),
	status: row.status,
	createdAt: row.created_at,
	updatedAt: row.updated_at,
});
