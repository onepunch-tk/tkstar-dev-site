import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OnThisPageToc from "../OnThisPageToc";

describe("OnThisPageToc", () => {
	it("toc 길이만큼 anchor 가 렌더링된다", () => {
		// Arrange
		const toc = [
			{ slug: "problem", text: "Problem" },
			{ slug: "approach", text: "Approach" },
			{ slug: "results", text: "Results" },
		];

		// Act
		render(<OnThisPageToc toc={toc} />);

		// Assert
		const links = screen.getAllByRole("link");
		expect(links).toHaveLength(3);
		for (let i = 0; i < toc.length; i++) {
			expect(links[i]).toHaveAttribute("href", `#${toc[i].slug}`);
			expect(links[i]).toHaveTextContent(toc[i].text);
		}
	});

	it("빈 배열은 null 을 반환한다 (마운트되지 않음)", () => {
		// Arrange & Act
		const { container } = render(<OnThisPageToc toc={[]} />);

		// Assert
		expect(screen.queryByTestId("on-this-page-toc")).toBeNull();
		expect(container.firstChild).toBeNull();
	});

	it("anchor href 는 정확히 #slug 형식이다", () => {
		// Arrange
		const toc = [{ slug: "문제-정의", text: "문제 정의" }];

		// Act
		render(<OnThisPageToc toc={toc} />);

		// Assert
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "#문제-정의");
		expect(link).toHaveTextContent("문제 정의");
	});
});
