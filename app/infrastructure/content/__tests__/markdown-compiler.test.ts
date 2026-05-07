import { describe, expect, it } from "vitest";
import { compileMarkdownToHast } from "~/infrastructure/content/markdown-compiler";

// hast 타입 패키지가 deps 에 없을 수 있으므로 ad-hoc minimal interface 사용
type HastNode = {
	type: string;
	tagName?: string;
	children?: HastNode[];
	properties?: Record<string, unknown>;
	value?: string;
};

/**
 * hast 트리를 재귀 순회하며 조건을 만족하는 모든 노드를 반환한다.
 * DOM querySelector 가 아닌 hast 트리용 walker.
 */
function walkHast(node: HastNode, predicate: (n: HastNode) => boolean): HastNode[] {
	const results: HastNode[] = [];
	if (predicate(node)) {
		results.push(node);
	}
	for (const child of node.children ?? []) {
		results.push(...walkHast(child, predicate));
	}
	return results;
}

describe("compileMarkdownToHast", () => {
	it("기본 heading — root 첫 번째 element 가 h1 이어야 한다", async () => {
		// Arrange
		const input = "# heading\n\nhello";

		// Act
		const result = (await compileMarkdownToHast(input)) as unknown as HastNode;

		// Assert
		expect(result.type).toBe("root");
		const h1Nodes = walkHast(result, (n) => n.type === "element" && n.tagName === "h1");
		expect(h1Nodes.length).toBeGreaterThan(0);
	});

	it("paragraph — p 태그 안에 text node 'hello world' 가 존재해야 한다", async () => {
		// Arrange
		const input = "hello world";

		// Act
		const result = (await compileMarkdownToHast(input)) as unknown as HastNode;

		// Assert
		const pNodes = walkHast(result, (n) => n.type === "element" && n.tagName === "p");
		expect(pNodes.length).toBeGreaterThan(0);

		const textInP = walkHast(pNodes[0], (n) => n.type === "text" && n.value === "hello world");
		expect(textInP.length).toBeGreaterThan(0);
	});

	it("GFM task list — input[type=checkbox] element 가 hast 트리 안에 존재해야 한다", async () => {
		// Arrange
		const input = "- [x] task done\n- [ ] task todo";

		// Act
		const result = (await compileMarkdownToHast(input)) as unknown as HastNode;

		// Assert
		const checkboxes = walkHast(
			result,
			(n) => n.type === "element" && n.tagName === "input" && n.properties?.type === "checkbox",
		);
		expect(checkboxes.length).toBeGreaterThan(0);
	});

	it("GFM strikethrough — del element 가 존재해야 한다", async () => {
		// Arrange
		const input = "~~strike~~";

		// Act
		const result = (await compileMarkdownToHast(input)) as unknown as HastNode;

		// Assert
		const delNodes = walkHast(result, (n) => n.type === "element" && n.tagName === "del");
		expect(delNodes.length).toBeGreaterThan(0);
	});

	it("raw HTML — script element 가 hast 트리 어디에도 없어야 한다 (XSS 차단 첫 단계)", async () => {
		// Arrange
		// remark-rehype 기본값 allowDangerousHtml: false → raw HTML 은 escape 처리
		const input = "<script>alert(1)</script>";

		// Act
		const result = (await compileMarkdownToHast(input)) as unknown as HastNode;

		// Assert
		const scriptNodes = walkHast(result, (n) => n.type === "element" && n.tagName === "script");
		expect(scriptNodes.length).toBe(0);
	});

	it("fenced code block — code element 에 language-ts className 이 포함되어야 하고 부모 pre 도 존재해야 한다", async () => {
		// Arrange
		const input = "```ts\nconst x = 1;\n```";

		// Act
		const result = (await compileMarkdownToHast(input)) as unknown as HastNode;

		// Assert
		const preNodes = walkHast(result, (n) => n.type === "element" && n.tagName === "pre");
		expect(preNodes.length).toBeGreaterThan(0);

		const codeNodes = walkHast(result, (n) => n.type === "element" && n.tagName === "code");
		expect(codeNodes.length).toBeGreaterThan(0);

		const codeNode = codeNodes[0];
		const className = codeNode.properties?.className;
		// className 은 string[] 로 올 수 있음
		expect(Array.isArray(className)).toBe(true);
		expect((className as string[]).includes("language-ts")).toBe(true);
	});
});
