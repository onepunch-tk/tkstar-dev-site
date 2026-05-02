import { z } from "zod";
import { zIso8601Date, zNonEmptyString } from "../_shared/zod-helpers";

export const appLegalDocSchema = z.object({
	app_slug: zNonEmptyString(),
	doc_type: z.enum(["terms", "privacy"]),
	version: zNonEmptyString(),
	effective_date: zIso8601Date(),
	body: z.string().optional(),
});
