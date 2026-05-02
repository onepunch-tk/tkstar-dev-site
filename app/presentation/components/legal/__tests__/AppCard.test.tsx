import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import AppCard from "../AppCard";

// createRoutesStub 으로 RR 컨텍스트 제공 (AppCard 내부 <Link> 가 RouterContext 필요)
const renderWithRouter = (slug: string) => {
	const Stub = createRoutesStub([{ path: "/", Component: () => <AppCard slug={slug} /> }]);
	return render(<Stub initialEntries={["/"]} />);
};

describe("AppCard", () => {
	it("slug 텍스트를 표시한다", () => {
		// Arrange & Act
		renderWithRouter("moai");

		// Assert
		expect(screen.getByText(/moai/i)).toBeInTheDocument();
	});

	it("terms 링크가 /legal/{slug}/terms 로 라우팅된다", () => {
		// Arrange & Act
		renderWithRouter("moai");

		// Assert
		const link = screen.getByRole("link", { name: /terms/i });
		expect(link).toHaveAttribute("href", "/legal/moai/terms");
	});

	it("privacy 링크가 /legal/{slug}/privacy 로 라우팅된다", () => {
		// Arrange & Act
		renderWithRouter("moai");

		// Assert
		const link = screen.getByRole("link", { name: /privacy/i });
		expect(link).toHaveAttribute("href", "/legal/moai/privacy");
	});

	it("다른 slug 로도 동작한다", () => {
		// Arrange & Act
		renderWithRouter("jagi");

		// Assert
		expect(screen.getByRole("link", { name: /terms/i })).toHaveAttribute(
			"href",
			"/legal/jagi/terms",
		);
		expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute(
			"href",
			"/legal/jagi/privacy",
		);
	});
});
