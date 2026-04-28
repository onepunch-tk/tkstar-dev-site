import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MdxRenderer from "../MdxRenderer";

const buildMdxBody = (innerJsx: string) => `
const {Fragment, jsx, jsxs} = arguments[0];
function MDXContent() {
  return ${innerJsx};
}
return {default: MDXContent};
`;

describe("MdxRenderer", () => {
	it("velite 형식의 MDX function-body를 평가하여 React 트리로 렌더한다", () => {
		const code = buildMdxBody(`jsx('p', {children: 'hello mdx'})`);

		render(<MdxRenderer code={code} />);

		expect(screen.getByText("hello mdx")).toBeInTheDocument();
	});

	it("shiki가 주입한 inline style span을 dangerouslySetInnerHTML로 보존한다", () => {
		const shikiHtml =
			'<span style="color:#79C0FF">const</span> <span style="color:#D2A8FF">x</span>';
		const code = buildMdxBody(
			`jsx('pre', {'data-testid': 'code', dangerouslySetInnerHTML: {__html: ${JSON.stringify(shikiHtml)}}})`,
		);

		render(<MdxRenderer code={code} />);

		const pre = screen.getByTestId("code");
		expect(pre.innerHTML).toContain('<span style="color:#79C0FF">const</span>');
	});
});
