import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ProjectRepository } from "~/application/content/ports/project-repository.port";
import { getFeaturedProject } from "../get-featured-project.service";
import { projectBeta } from "../../../../__tests__/fixtures/velite-projects.fixture";

describe("getFeaturedProject", () => {
	let mockRepo: Partial<ProjectRepository>;

	beforeEach(() => {
		mockRepo = {
			findFeatured: vi.fn(),
		};
	});

	it("findFeatured가 project를 반환하면 그대로 반환한다", async () => {
		// Arrange
		const repo = mockRepo as ProjectRepository;
		vi.mocked(mockRepo.findFeatured!).mockResolvedValue(projectBeta as never);

		// Act
		const result = await getFeaturedProject(repo);

		// Assert
		expect(mockRepo.findFeatured).toHaveBeenCalledTimes(1);
		expect(result).toEqual(projectBeta);
	});

	it("findFeatured가 null을 반환하면 null을 반환한다 (throw 없음)", async () => {
		// Arrange
		const repo = mockRepo as ProjectRepository;
		vi.mocked(mockRepo.findFeatured!).mockResolvedValue(null);

		// Act
		const result = await getFeaturedProject(repo);

		// Assert
		expect(mockRepo.findFeatured).toHaveBeenCalledTimes(1);
		expect(result).toBeNull();
	});
});
