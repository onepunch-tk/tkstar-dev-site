import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ProjectRepository } from "~/application/content/ports/project-repository.port";
import { ProjectNotFoundError } from "~/domain/project/project.errors";
import { getProjectDetail } from "../get-project-detail.service";
import {
	projectAlpha,
	projectBeta,
	projectGamma,
} from "../../../../__tests__/fixtures/velite-projects.fixture";

describe("getProjectDetail", () => {
	let mockRepo: Partial<ProjectRepository>;

	beforeEach(() => {
		mockRepo = {
			findBySlug: vi.fn(),
			findRelated: vi.fn(),
		};
	});

	it("존재하는 slug이면 { project, prev, next }를 반환한다", async () => {
		// Arrange
		const repo = mockRepo as ProjectRepository;
		vi.mocked(mockRepo.findBySlug!).mockResolvedValue(projectAlpha as never);
		vi.mocked(mockRepo.findRelated!).mockResolvedValue({
			prev: projectBeta as never,
			next: null,
		});

		// Act
		const result = await getProjectDetail(repo, "alpha");

		// Assert
		expect(mockRepo.findBySlug).toHaveBeenCalledWith("alpha");
		expect(mockRepo.findRelated).toHaveBeenCalledWith("alpha");
		expect(result.project).toEqual(projectAlpha);
		expect(result.prev).toEqual(projectBeta);
		expect(result.next).toBeNull();
	});

	it("findBySlug가 null을 반환하면 ProjectNotFoundError를 throw한다", async () => {
		// Arrange
		const repo = mockRepo as ProjectRepository;
		vi.mocked(mockRepo.findBySlug!).mockResolvedValue(null);

		// Act & Assert
		await expect(getProjectDetail(repo, "nonexistent")).rejects.toThrow(ProjectNotFoundError);
		expect(mockRepo.findRelated).not.toHaveBeenCalled();
	});

	it("인접 프로젝트 prev/next 모두 null인 경우도 반환한다", async () => {
		// Arrange
		const repo = mockRepo as ProjectRepository;
		vi.mocked(mockRepo.findBySlug!).mockResolvedValue(projectGamma as never);
		vi.mocked(mockRepo.findRelated!).mockResolvedValue({ prev: null, next: null });

		// Act
		const result = await getProjectDetail(repo, "gamma");

		// Assert
		expect(result.project).toEqual(projectGamma);
		expect(result.prev).toBeNull();
		expect(result.next).toBeNull();
	});
});
