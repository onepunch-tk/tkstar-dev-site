import type { Root as HastRoot } from "hast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export type CompileMarkdown = (rawMarkdown: string) => Promise<HastRoot>;

export const compileMarkdownToHast: CompileMarkdown = async (rawMarkdown) => {
	const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);
	const mdast = processor.parse(rawMarkdown);
	return (await processor.run(mdast)) as HastRoot;
};
