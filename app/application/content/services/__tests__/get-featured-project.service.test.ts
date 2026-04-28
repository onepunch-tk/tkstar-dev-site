import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectRepository } from "~/application/content/ports/project-repository.port";
import { getFeaturedProject } from "../get-featured-project.service";
import { projectBeta } from "../../../../__tests__/fixtures/velite-projects.fixture";

describe("getFeaturedProject", () => {
	let mockRepo: ProjectRepository;

	beforeEach(() => {
		mockRepo = {
			findAll: vi.fn(),
			findBySlug: vi.fn(),
			findFeatured: vi.fn(),
			findRelated: vi.fn(),
			findByTag: vi.fn(),
		};
	});

	it("findFeatured가 project를 반환하면 그대로 반환한다", async () => {
		vi.mocked(mockRepo.findFeatured).mockResolvedValue(projectBeta as never);

		const result = await getFeaturedProject(mockRepo);

		expect(vi.mocked(mockRepo.findFeatured)).toHaveBeenCalledTimes(1);
		expect(result).toEqual(projectBeta);
	});

	it("findFeatured가 null을 반환하면 null을 반환한다 (throw 없음)", async () => {
		vi.mocked(mockRepo.findFeatured).mockResolvedValue(null);

		const result = await getFeaturedProject(mockRepo);

		expect(vi.mocked(mockRepo.findFeatured)).toHaveBeenCalledTimes(1);
		expect(result).toBeNull();
	});
});
