import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ProjectRepository } from "~/application/content/ports/project-repository.port";
import { listProjects } from "../list-projects.service";
import {
	projectAlpha,
	projectBeta,
	projectGamma,
} from "../../../../__tests__/fixtures/velite-projects.fixture";

describe("listProjects", () => {
	let mockRepo: Partial<ProjectRepository>;

	beforeEach(() => {
		mockRepo = {
			findAll: vi.fn().mockResolvedValue([projectAlpha, projectBeta, projectGamma]),
			findByTag: vi.fn().mockResolvedValue([projectGamma]),
		};
	});

	it("opts 없으면 findAll을 호출하고 전체 목록을 반환한다", async () => {
		// Arrange
		const repo = mockRepo as ProjectRepository;

		// Act
		const result = await listProjects(repo);

		// Assert
		expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
		expect(mockRepo.findByTag).not.toHaveBeenCalled();
		expect(result).toHaveLength(3);
	});

	it("빈 객체 opts 전달 시 findAll을 호출한다", async () => {
		// Arrange
		const repo = mockRepo as ProjectRepository;

		// Act
		const result = await listProjects(repo, {});

		// Assert
		expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
		expect(mockRepo.findByTag).not.toHaveBeenCalled();
		expect(result).toHaveLength(3);
	});

	it("opts.tag 있으면 findByTag를 호출하고 findAll은 호출하지 않는다", async () => {
		// Arrange
		const repo = mockRepo as ProjectRepository;

		// Act
		const result = await listProjects(repo, { tag: "infra" });

		// Assert
		expect(mockRepo.findByTag).toHaveBeenCalledTimes(1);
		expect(mockRepo.findByTag).toHaveBeenCalledWith("infra");
		expect(mockRepo.findAll).not.toHaveBeenCalled();
		expect(result).toHaveLength(1);
	});
});
