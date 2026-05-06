import { and, asc, desc, eq, gt, like, lt } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type {
	PostQueryOptions,
	PostRepository,
} from "~/application/content/ports/post-repository.port";
import { extractToc } from "./mappers/extract-toc";
import { type PostRow, toPost } from "./mappers/post-row.mapper";
import { posts } from "./schema/posts";

// biome-ignore lint/suspicious/noExplicitAny: Drizzle BaseSQLiteDatabase third generic (schema) is invariant; both d1 and better-sqlite3 wrappers must satisfy without conflict
type SQLiteDb = BaseSQLiteDatabase<"async" | "sync", unknown, any>;

const POST_META_COLS = {
	slug: posts.slug,
	title: posts.title,
	summary: posts.summary,
	tags: posts.tags,
	date_published: posts.date_published,
	status: posts.status,
	created_at: posts.created_at,
	updated_at: posts.updated_at,
};

const statusCondition = (options?: PostQueryOptions) => {
	const status = options?.status ?? "published";
	if (status === "all") return undefined;
	return eq(posts.status, status);
};

export const createD1PostRepository = (db: SQLiteDb): PostRepository => ({
	async findAll(options) {
		const where = statusCondition(options);
		const rows = await (where
			? db.select(POST_META_COLS).from(posts).where(where).orderBy(desc(posts.created_at))
			: db.select(POST_META_COLS).from(posts).orderBy(desc(posts.created_at)));
		return (rows as PostRow[]).map(toPost);
	},

	async findBySlug(slug, options) {
		const where = statusCondition(options);
		const rows = await (where
			? db
					.select(POST_META_COLS)
					.from(posts)
					.where(and(eq(posts.slug, slug), where))
					.limit(1)
			: db.select(POST_META_COLS).from(posts).where(eq(posts.slug, slug)).limit(1));
		const row = (rows as PostRow[])[0];
		return row ? toPost(row) : null;
	},

	async findRecent(n, options) {
		const where = statusCondition(options);
		const rows = await (where
			? db.select(POST_META_COLS).from(posts).where(where).orderBy(desc(posts.created_at)).limit(n)
			: db.select(POST_META_COLS).from(posts).orderBy(desc(posts.created_at)).limit(n));
		return (rows as PostRow[]).map(toPost);
	},

	async findByTag(tag, options) {
		const where = statusCondition(options);
		const tagPattern = `%"${tag}"%`;
		const rows = await (where
			? db
					.select(POST_META_COLS)
					.from(posts)
					.where(and(like(posts.tags, tagPattern), where))
					.orderBy(desc(posts.created_at))
			: db
					.select(POST_META_COLS)
					.from(posts)
					.where(like(posts.tags, tagPattern))
					.orderBy(desc(posts.created_at)));
		return (rows as PostRow[]).map(toPost);
	},

	async findRelated(slug, options) {
		const where = statusCondition(options);
		const currentRows = await (where
			? db
					.select(POST_META_COLS)
					.from(posts)
					.where(and(eq(posts.slug, slug), where))
					.limit(1)
			: db.select(POST_META_COLS).from(posts).where(eq(posts.slug, slug)).limit(1));
		const current = (currentRows as PostRow[])[0];
		if (!current) return { prev: null, next: null };

		const prevWhere = where
			? and(gt(posts.created_at, current.created_at), where)
			: gt(posts.created_at, current.created_at);
		const nextWhere = where
			? and(lt(posts.created_at, current.created_at), where)
			: lt(posts.created_at, current.created_at);

		const [prevRows, nextRows] = await Promise.all([
			db
				.select(POST_META_COLS)
				.from(posts)
				.where(prevWhere)
				.orderBy(asc(posts.created_at))
				.limit(1),
			db
				.select(POST_META_COLS)
				.from(posts)
				.where(nextWhere)
				.orderBy(desc(posts.created_at))
				.limit(1),
		]);
		return {
			prev: (prevRows as PostRow[])[0] ? toPost((prevRows as PostRow[])[0]) : null,
			next: (nextRows as PostRow[])[0] ? toPost((nextRows as PostRow[])[0]) : null,
		};
	},

	async findBodyBySlug(slug, options) {
		const where = statusCondition(options);
		const rows = await (where
			? db
					.select({ raw_markdown: posts.raw_markdown })
					.from(posts)
					.where(and(eq(posts.slug, slug), where))
					.limit(1)
			: db
					.select({ raw_markdown: posts.raw_markdown })
					.from(posts)
					.where(eq(posts.slug, slug))
					.limit(1));
		const row = (rows as { raw_markdown: string }[])[0];
		if (!row) return null;
		return { body: row.raw_markdown, toc: extractToc(row.raw_markdown) };
	},
});
