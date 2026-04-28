import type { z } from "zod";
import type { projectSchema } from "./project.schema";

export type Project = z.infer<typeof projectSchema>;
