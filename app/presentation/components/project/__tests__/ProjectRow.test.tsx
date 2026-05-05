import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Project } from "../../../../domain/project/project.entity";

import ProjectRow from "../ProjectRow";

const mockProject: Project = {
	slug: "example-project",
	title: "Example Project",
	summary: "A short summary of the project.",
	date: "2026-04-28",
	tags: ["web", "react"],
	stack: ["TypeScript", "React Router"],
	metrics: [["users", "1000"]],
};

describe("ProjectRow", () => {
	it("date(YYYY-MM-DD), slug/, title, summary, stack pills를 모두 렌더한다", () => {
		// Arrange / Act
		render(
			<MemoryRouter>
				<ProjectRow project={mockProject} />
			</MemoryRouter>,
		);

		// Assert
		expect(screen.getByText("2026-04-28")).toBeInTheDocument();
		expect(screen.getAllByText("example-project/")).not.toHaveLength(0);
		expect(screen.getByText("Example Project")).toBeInTheDocument();
		expect(screen.getByText(/A short summary/)).toBeInTheDocument();
		expect(screen.getByText("TypeScript")).toBeInTheDocument();
		expect(screen.getByText("React Router")).toBeInTheDocument();
	});

	it("행 컨테이너가 /projects/{slug}로 향하는 Link이다", () => {
		// Arrange / Act
		render(
			<MemoryRouter>
				<ProjectRow project={mockProject} />
			</MemoryRouter>,
		);

		// Assert
		const row = screen.getByTestId("project-row");
		expect(row.tagName).toBe("A");
		expect(row).toHaveAttribute("href", "/projects/example-project");
	});
});
