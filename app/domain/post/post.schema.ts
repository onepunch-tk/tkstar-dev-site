import { z } from "zod";
import { zIso8601Date, zNonEmptyString } from "../_shared/zod-helpers";

export const postStatusSchema = z.enum(["draft", "published"]);

export const postSchema = z.object({
	slug: zNonEmptyString(),
	title: zNonEmptyString(),
	summary: zNonEmptyString().nullable(),
	datePublished: zIso8601Date().nullable(),
	tags: z.array(z.string()),
	status: postStatusSchema,
	createdAt: z.number().int(),
	updatedAt: z.number().int(),
});
