import { z } from "zod";
import { zNonEmptyString } from "../_shared/zod-helpers";

export const projectSchema = z.object({
	slug: zNonEmptyString(),
	title: zNonEmptyString(),
	summary: zNonEmptyString(),
	date: zNonEmptyString(),
	tags: z.array(z.string()),
	stack: z.array(z.string()),
	metrics: z.array(z.tuple([z.string(), z.string()])),
	featured: z.boolean().optional(),
	cover: z.string().optional(),
});
