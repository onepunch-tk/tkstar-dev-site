import type { Root as HastRoot } from "hast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { CompileMarkdown } from "~/application/content/ports/markdown-compiler.port";

export const compileMarkdownToHast: CompileMarkdown = async (rawMarkdown) => {
	const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);
	const mdast = processor.parse(rawMarkdown);
	// remark-rehype transformer 가 끝단인 한 runtime 결과는 항상 hast Root — unified 의 declarative 타입이
	// chained transformer 의 출력 타입을 추적하지 못해서 명시 cast 필요.
	return (await processor.run(mdast)) as HastRoot;
};
