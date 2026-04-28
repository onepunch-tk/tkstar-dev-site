import type { z } from "zod";
import type { postSchema } from "./post.schema";

export type Post = z.infer<typeof postSchema>;
