import type { z } from "zod";
import type { contactSubmissionSchema } from "./contact-submission.schema";

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
