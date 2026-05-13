import type { Root as HastRoot } from "hast";

export type CompileMarkdown = (rawMarkdown: string) => Promise<HastRoot>;
