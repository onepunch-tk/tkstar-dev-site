// @ts-nocheck — PoC measurement entry; D1Database type lives in worker-configuration.d.ts which this script doesn't import.
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";

export default {
	async fetch(_req: Request, env: { DB: unknown }): Promise<Response> {
		const db = drizzle(env.DB);
		const rows = await db.run(sql`select 1`);
		return new Response(JSON.stringify(rows));
	},
};
