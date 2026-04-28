import { z } from "zod";
import { zNonEmptyString, zRfc5322Email } from "../_shared/zod-helpers";

export const contactSubmissionSchema = z.object({
	name: zNonEmptyString(),
	company: z.string().optional(),
	email: zRfc5322Email(),
	inquiry_type: z.enum(["B2B", "B2C", "etc"]),
	message: z.string().min(10).max(5000),
	turnstile_token: zNonEmptyString(),
});
