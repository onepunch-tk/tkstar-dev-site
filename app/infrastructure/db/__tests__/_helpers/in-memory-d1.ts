import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

export type InMemoryDb = ReturnType<typeof drizzle>;

const MIGRATIONS_DIR = resolve(process.cwd(), "migrations");

export const createInMemoryD1 = (): InMemoryDb => {
	const sqlite = new Database(":memory:");
	const files = readdirSync(MIGRATIONS_DIR)
		.filter((f) => f.endsWith(".sql"))
		.sort();
	for (const file of files) {
		const sql = readFileSync(resolve(MIGRATIONS_DIR, file), "utf8");
		for (const stmt of sql.split("--> statement-breakpoint")) {
			const trimmed = stmt.trim();
			if (trimmed) sqlite.exec(trimmed);
		}
	}
	return drizzle(sqlite);
};
