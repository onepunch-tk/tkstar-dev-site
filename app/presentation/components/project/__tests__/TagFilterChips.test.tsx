import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useSearchParams } from "react-router";
import { describe, expect, it } from "vitest";

import TagFilterChips from "../TagFilterChips";

function CurrentTagProbe() {
	const [params] = useSearchParams();
	return <span data-testid="current-tag">{params.get("tag") ?? "(none)"}</span>;
}

function renderWithRouter(props: { tags: string[]; activeTag: string | null }, initialUrl: string) {
	return render(
		<MemoryRouter initialEntries={[initialUrl]}>
			<Routes>
				<Route
					path="/projects"
					element={
						<>
							<TagFilterChips tags={props.tags} activeTag={props.activeTag} />
							<CurrentTagProbe />
						</>
					}
				/>
			</Routes>
		</MemoryRouter>,
	);
}

describe("TagFilterChips", () => {
	it("tags 길이만큼 칩이 렌더되고 active 칩만 data-active=true이다", () => {
		// Arrange / Act
		renderWithRouter({ tags: ["a", "b", "c"], activeTag: "b" }, "/projects?tag=b");

		// Assert
		const chips = screen.getAllByTestId("tag-chip");
		expect(chips).toHaveLength(3);
		const activeChip = screen.getByRole("button", { name: "b" });
		expect(activeChip).toHaveAttribute("data-active", "true");
		const inactiveChip = screen.getByRole("button", { name: "a" });
		expect(inactiveChip).toHaveAttribute("data-active", "false");
	});

	it("active 칩 재클릭 시 ?tag 파라미터가 제거된다", () => {
		// Arrange
		renderWithRouter({ tags: ["a", "b"], activeTag: "b" }, "/projects?tag=b");

		// Act
		fireEvent.click(screen.getByRole("button", { name: "b" }));

		// Assert
		expect(screen.getByTestId("current-tag")).toHaveTextContent("(none)");
	});

	it("다른 칩 클릭 시 ?tag가 해당 태그로 교체된다", () => {
		// Arrange
		renderWithRouter({ tags: ["a", "b"], activeTag: "b" }, "/projects?tag=b");

		// Act
		fireEvent.click(screen.getByRole("button", { name: "a" }));

		// Assert
		expect(screen.getByTestId("current-tag")).toHaveTextContent("a");
	});

	it("tags가 빈 배열이면 null을 반환한다", () => {
		// Arrange / Act
		const { container } = renderWithRouter({ tags: [], activeTag: null }, "/projects");

		// Assert
		expect(container.querySelectorAll("[data-testid='tag-chip']")).toHaveLength(0);
	});
});
