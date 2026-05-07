import type { Element, Node, Text } from "hast";
import { describe, expect, it } from "vitest";
import { compileMarkdownToHast } from "~/infrastructure/content/markdown-compiler";

const isElement = (n: Node): n is Element => n.type === "element";
const isText = (n: Node): n is Text => n.type === "text";

const walkHast = (node: Node, predicate: (n: Node) => boolean): Node[] => {
	const results: Node[] = [];
	if (predicate(node)) results.push(node);
	const children = (node as { children?: Node[] }).children;
	for (const child of children ?? []) {
		results.push(...walkHast(child, predicate));
	}
	return results;
};

describe("compileMarkdownToHast", () => {
	it("기본 heading — root 첫 번째 element 가 h1 이어야 한다", async () => {
		// Arrange
		const input = "# heading\n\nhello";

		// Act
		const result = await compileMarkdownToHast(input);

		// Assert
		expect(result.type).toBe("root");
		const h1Nodes = walkHast(result, (n) => isElement(n) && n.tagName === "h1");
		expect(h1Nodes.length).toBeGreaterThan(0);
	});

	it("paragraph — p 태그 안에 text node 'hello world' 가 존재해야 한다", async () => {
		// Arrange
		const input = "hello world";

		// Act
		const result = await compileMarkdownToHast(input);

		// Assert
		const pNodes = walkHast(result, (n) => isElement(n) && n.tagName === "p");
		expect(pNodes.length).toBeGreaterThan(0);

		const textInP = walkHast(pNodes[0], (n) => isText(n) && n.value === "hello world");
		expect(textInP.length).toBeGreaterThan(0);
	});

	it("GFM task list — input[type=checkbox] element 가 hast 트리 안에 존재해야 한다", async () => {
		// Arrange
		const input = "- [x] task done\n- [ ] task todo";

		// Act
		const result = await compileMarkdownToHast(input);

		// Assert
		const checkboxes = walkHast(
			result,
			(n) => isElement(n) && n.tagName === "input" && n.properties?.type === "checkbox",
		);
		expect(checkboxes.length).toBeGreaterThan(0);
	});

	it("GFM strikethrough — del element 가 존재해야 한다", async () => {
		// Arrange
		const input = "~~strike~~";

		// Act
		const result = await compileMarkdownToHast(input);

		// Assert
		const delNodes = walkHast(result, (n) => isElement(n) && n.tagName === "del");
		expect(delNodes.length).toBeGreaterThan(0);
	});

	it("raw HTML — script element 가 hast 트리 어디에도 없어야 한다 (XSS 차단 첫 단계)", async () => {
		// Arrange — remark-rehype 기본값 allowDangerousHtml: false → raw HTML 은 escape 처리
		const input = "<script>alert(1)</script>";

		// Act
		const result = await compileMarkdownToHast(input);

		// Assert
		const scriptNodes = walkHast(result, (n) => isElement(n) && n.tagName === "script");
		expect(scriptNodes.length).toBe(0);
	});

	it("fenced code block — code element 에 language-ts className 이 포함되어야 하고 부모 pre 도 존재해야 한다", async () => {
		// Arrange
		const input = "```ts\nconst x = 1;\n```";

		// Act
		const result = await compileMarkdownToHast(input);

		// Assert
		const preNodes = walkHast(result, (n) => isElement(n) && n.tagName === "pre");
		expect(preNodes.length).toBeGreaterThan(0);

		const codeNodes = walkHast(result, (n) => isElement(n) && n.tagName === "code");
		expect(codeNodes.length).toBeGreaterThan(0);

		const codeNode = codeNodes[0] as Element;
		const className = codeNode.properties?.className;
		expect(Array.isArray(className)).toBe(true);
		expect((className as string[]).includes("language-ts")).toBe(true);
	});
});
