import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectMetaSidebar from "../ProjectMetaSidebar";

describe("ProjectMetaSidebar", () => {
	it("date 의 UTC 연도(YYYY) 가 표시된다", () => {
		// Arrange
		const date = "2026-04-28T00:00:00.000Z";

		// Act
		render(<ProjectMetaSidebar date={date} stack={["TypeScript"]} />);

		// Assert
		expect(screen.getByText("2026")).toBeInTheDocument();
	});

	it("role 이 없으면 role 영역이 렌더되지 않는다", () => {
		// Arrange
		const date = "2026-04-28T00:00:00.000Z";

		// Act
		render(<ProjectMetaSidebar date={date} stack={["TypeScript"]} />);

		// Assert
		expect(screen.queryByTestId("project-meta-role")).toBeNull();
	});

	it("role 이 주어지면 role 텍스트가 표시된다", () => {
		// Arrange
		const date = "2026-04-28T00:00:00.000Z";
		const role = "Lead Engineer";

		// Act
		render(<ProjectMetaSidebar date={date} stack={["TypeScript"]} role={role} />);

		// Assert
		expect(screen.getByText("Lead Engineer")).toBeInTheDocument();
		expect(screen.getByTestId("project-meta-role")).toBeInTheDocument();
	});

	it("stack 길이만큼 항목이 렌더된다", () => {
		// Arrange
		const date = "2026-04-28T00:00:00.000Z";
		const stack = ["TypeScript", "React Router", "Cloudflare Workers"];

		// Act
		render(<ProjectMetaSidebar date={date} stack={stack} />);

		// Assert
		for (const item of stack) {
			expect(screen.getByText(item)).toBeInTheDocument();
		}
	});
});
