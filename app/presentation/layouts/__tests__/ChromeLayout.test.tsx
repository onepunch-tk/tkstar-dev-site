import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../components/chrome/Topbar", () => ({
	default: () => <header data-testid="topbar-mock" />,
}));
vi.mock("../../components/chrome/Footer", () => ({
	default: () => <footer data-testid="footer-mock" />,
}));

import ChromeLayout from "../ChromeLayout";

describe("ChromeLayout", () => {
	it("Topbar를 렌더링한다", () => {
		render(
			<ChromeLayout>
				<p>main content</p>
			</ChromeLayout>,
		);

		expect(screen.getByTestId("topbar-mock")).toBeInTheDocument();
	});

	it("Footer를 렌더링한다", () => {
		render(
			<ChromeLayout>
				<p>main content</p>
			</ChromeLayout>,
		);

		expect(screen.getByTestId("footer-mock")).toBeInTheDocument();
	});

	it("children를 렌더링한다", () => {
		render(
			<ChromeLayout>
				<p>main content</p>
			</ChromeLayout>,
		);

		expect(screen.getByText("main content")).toBeInTheDocument();
	});

	it("Topbar → children → Footer 순서로 렌더링한다", () => {
		render(
			<ChromeLayout>
				<p>main content</p>
			</ChromeLayout>,
		);

		const header = screen.getByTestId("topbar-mock");
		const content = screen.getByText("main content");
		const footer = screen.getByTestId("footer-mock");

		expect(header.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});
});
