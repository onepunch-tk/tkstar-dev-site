import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ChromeFreeLayout from "../ChromeFreeLayout";

describe("ChromeFreeLayout", () => {
	it("children를 렌더링한다", () => {
		// Arrange & Act
		render(
			<ChromeFreeLayout>
				<p>body content</p>
			</ChromeFreeLayout>,
		);

		// Assert
		expect(screen.getByText("body content")).toBeInTheDocument();
	});

	it("<header> 요소를 렌더링하지 않는다", () => {
		// Arrange & Act
		const { container } = render(
			<ChromeFreeLayout>
				<p>body content</p>
			</ChromeFreeLayout>,
		);

		// Assert
		expect(container.querySelector("header")).toBeNull();
	});

	it("<footer> 요소를 렌더링하지 않는다", () => {
		// Arrange & Act
		const { container } = render(
			<ChromeFreeLayout>
				<p>body content</p>
			</ChromeFreeLayout>,
		);

		// Assert
		expect(container.querySelector("footer")).toBeNull();
	});

	it("children을 max-width 680px가 적용된 legal-container로 감싼다", () => {
		// Arrange & Act
		const { container } = render(
			<ChromeFreeLayout>
				<p>body content</p>
			</ChromeFreeLayout>,
		);

		// Assert
		const legalContainer = container.querySelector(".legal-container");
		expect(legalContainer).not.toBeNull();
		expect(legalContainer).toHaveClass("max-w-[680px]");
	});
});
