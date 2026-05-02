import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

// useRouteLoaderData 를 모킹하되 나머지 react-router 는 실제 구현 유지
vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return { ...actual, useRouteLoaderData: vi.fn() };
});

import { useRouteLoaderData } from "react-router";
import Footer from "../Footer";

// createRoutesStub 으로 RR 컨텍스트 제공 (Footer 내부 <Link> 가 RouterContext 필요)
const buildStub = () => createRoutesStub([{ path: "/", Component: () => <Footer /> }]);

describe("Footer", () => {
	beforeEach(() => {
		vi.mocked(useRouteLoaderData).mockReset();
	});

	it("appCount > 0 이면 Legal 링크가 href='/legal' 로 노출된다", () => {
		// Arrange
		vi.mocked(useRouteLoaderData).mockReturnValue({ appCount: 1 });
		const Stub = buildStub();

		// Act
		render(<Stub initialEntries={["/"]} />);

		// Assert
		const legalLink = screen.getByRole("link", { name: /legal/i });
		expect(legalLink).toHaveAttribute("href", "/legal");
	});

	it("appCount === 0 이면 Legal 링크가 노출되지 않는다", () => {
		// Arrange
		vi.mocked(useRouteLoaderData).mockReturnValue({ appCount: 0 });
		const Stub = buildStub();

		// Act
		render(<Stub initialEntries={["/"]} />);

		// Assert
		expect(screen.queryByRole("link", { name: /legal/i })).toBeNull();
	});

	it("appCount === undefined 이면 Legal 링크가 노출되지 않는다", () => {
		// Arrange
		vi.mocked(useRouteLoaderData).mockReturnValue(undefined);
		const Stub = buildStub();

		// Act
		render(<Stub initialEntries={["/"]} />);

		// Assert
		expect(screen.queryByRole("link", { name: /legal/i })).toBeNull();
	});

	it("appCount > 0 일 때 기존 4개 링크(GitHub / X / RSS / Contact)가 여전히 노출된다", () => {
		// Arrange
		vi.mocked(useRouteLoaderData).mockReturnValue({ appCount: 1 });
		const Stub = buildStub();

		// Act
		render(<Stub initialEntries={["/"]} />);

		// Assert — 기존 링크 회귀 방지
		expect(screen.getByRole("link", { name: /github/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /^x$/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /rss/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
	});
});
