import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LegalDocLayout from "../LegalDocLayout";

describe("LegalDocLayout", () => {
	it("title 을 h1 으로 렌더한다", () => {
		// Arrange & Act
		render(
			<LegalDocLayout
				title="moai 서비스 이용약관"
				version="1.0.0"
				effectiveDate="2026-04-28T00:00:00.000Z"
			>
				<p>본문</p>
			</LegalDocLayout>,
		);

		// Assert
		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("moai 서비스 이용약관");
	});

	it("version 을 노출한다", () => {
		// Arrange & Act
		render(
			<LegalDocLayout title="t" version="1.2.3" effectiveDate="2026-04-28T00:00:00.000Z">
				<p>본문</p>
			</LegalDocLayout>,
		);

		// Assert
		expect(screen.getByText(/1\.2\.3/)).toBeInTheDocument();
	});

	it("effectiveDate 를 노출한다", () => {
		// Arrange & Act
		render(
			<LegalDocLayout title="t" version="1.0.0" effectiveDate="2026-04-28T00:00:00.000Z">
				<p>본문</p>
			</LegalDocLayout>,
		);

		// Assert
		expect(screen.getByText("시행 2026-04-28")).toBeInTheDocument();
	});

	it("children 을 article 안에 렌더한다", () => {
		// Arrange & Act
		render(
			<LegalDocLayout title="t" version="1.0.0" effectiveDate="2026-04-28T00:00:00.000Z">
				<p data-testid="legal-body">본문 컨텐츠</p>
			</LegalDocLayout>,
		);

		// Assert
		const article = screen.getByRole("article");
		expect(article).toContainElement(screen.getByTestId("legal-body"));
	});
});
