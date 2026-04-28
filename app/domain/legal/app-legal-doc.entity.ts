import type { z } from "zod";
import type { appLegalDocSchema } from "./app-legal-doc.schema";

export type AppLegalDoc = z.infer<typeof appLegalDocSchema>;
