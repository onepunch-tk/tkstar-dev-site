import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Project } from "../../../../domain/project/project.entity";

import FeaturedProjectCard from "../FeaturedProjectCard";

// 테스트 픽스처
const mockProject: Project = {
	slug: "whiteboard-rt",
	title: "Realtime Whiteboard",
	summary: "다인원 실시간 화이트보드 with CRDT.",
	date: "2026-03-01",
	tags: ["b2c"],
	stack: ["ts", "react", "cf-do"],
	metrics: [],
	featured: true,
	cover: "/images/whiteboard-cover.png",
};
const mockProjectNoCover: Project = { ...mockProject, cover: undefined };

describe("FeaturedProjectCard", () => {
	it("카드 전체가 /projects/:slug 링크로 감싸진다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<FeaturedProjectCard project={mockProject} />
			</MemoryRouter>,
		);

		// Act
		const links = screen.getAllByRole("link");

		// Assert — 링크가 정확히 1개이고 href가 올바르다
		expect(links).toHaveLength(1);
		expect(links[0]).toHaveAttribute("href", "/projects/whiteboard-rt");
	});

	it("h2 heading으로 프로젝트 제목이 렌더된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<FeaturedProjectCard project={mockProject} />
			</MemoryRouter>,
		);

		// Act & Assert
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Realtime Whiteboard");
	});

	it("프로젝트 summary가 렌더된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<FeaturedProjectCard project={mockProject} />
			</MemoryRouter>,
		);

		// Act & Assert
		expect(screen.getByText(/다인원 실시간 화이트보드/)).toBeInTheDocument();
	});

	it("stack pill이 3개 모두 렌더된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<FeaturedProjectCard project={mockProject} />
			</MemoryRouter>,
		);

		// Act & Assert
		expect(screen.getByText("ts")).toBeInTheDocument();
		expect(screen.getByText("react")).toBeInTheDocument();
		expect(screen.getByText("cf-do")).toBeInTheDocument();
	});

	it("cover가 있을 때 cover 영역이 렌더된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<FeaturedProjectCard project={mockProject} />
			</MemoryRouter>,
		);

		// Act & Assert — cover testid 영역 존재 확인
		expect(screen.getByTestId("cover")).toBeInTheDocument();
	});

	it("cover가 없을 때도 placeholder cover 영역이 렌더된다", () => {
		// Arrange
		render(
			<MemoryRouter>
				<FeaturedProjectCard project={mockProjectNoCover} />
			</MemoryRouter>,
		);

		// Act & Assert — cover 없어도 16:9 placeholder 영역 유지
		expect(screen.getByTestId("cover")).toBeInTheDocument();
	});
});
