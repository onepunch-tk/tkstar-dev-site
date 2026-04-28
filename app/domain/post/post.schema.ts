import { z } from "zod";
import { zIso8601Date, zNonEmptyString } from "../_shared/zod-helpers";

export const postSchema = z.object({
	slug: zNonEmptyString(),
	title: zNonEmptyString(),
	lede: zNonEmptyString(),
	date: zIso8601Date(),
	tags: z.array(z.string()),
	read: z.number(),
});
