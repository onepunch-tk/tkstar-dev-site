import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ChromeLayout from "../ChromeLayout";

describe("ChromeLayout", () => {
	it("topbar-slot header를 렌더링한다", () => {
		// Arrange & Act
		render(
			<ChromeLayout>
				<p>main content</p>
			</ChromeLayout>,
		);

		// Assert
		const header = screen.getByTestId("topbar-slot");
		expect(header).toBeInTheDocument();
		expect(header.tagName).toBe("HEADER");
	});

	it("footer-slot footer를 렌더링한다", () => {
		// Arrange & Act
		render(
			<ChromeLayout>
				<p>main content</p>
			</ChromeLayout>,
		);

		// Assert
		const footer = screen.getByTestId("footer-slot");
		expect(footer).toBeInTheDocument();
		expect(footer.tagName).toBe("FOOTER");
	});

	it("children를 렌더링한다", () => {
		// Arrange & Act
		render(
			<ChromeLayout>
				<p>main content</p>
			</ChromeLayout>,
		);

		// Assert
		expect(screen.getByText("main content")).toBeInTheDocument();
	});

	it("header → children → footer 순서로 렌더링한다", () => {
		// Arrange & Act
		render(
			<ChromeLayout>
				<p>main content</p>
			</ChromeLayout>,
		);

		// Assert
		const header = screen.getByTestId("topbar-slot");
		const content = screen.getByText("main content");
		const footer = screen.getByTestId("footer-slot");

		expect(header.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});
});
