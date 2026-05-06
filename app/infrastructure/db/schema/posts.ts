import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	summary: text("summary"),
	raw_markdown: text("raw_markdown").notNull(),
	tags: text("tags").notNull(),
	date_published: text("date_published"),
	status: text("status", { enum: ["draft", "published"] })
		.notNull()
		.default("draft"),
	created_at: integer("created_at").notNull(),
	updated_at: integer("updated_at").notNull(),
});
