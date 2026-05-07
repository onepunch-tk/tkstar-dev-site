import type { Root as HastRoot } from "hast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { CompileMarkdown } from "~/application/content/ports/markdown-compiler.port";

export const compileMarkdownToHast: CompileMarkdown = async (rawMarkdown) => {
	const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);
	const mdast = processor.parse(rawMarkdown);
	return (await processor.run(mdast)) as HastRoot;
};
