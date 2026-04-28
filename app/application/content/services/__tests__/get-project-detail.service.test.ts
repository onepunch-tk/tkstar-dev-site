import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectRepository } from "~/application/content/ports/project-repository.port";
import { ProjectNotFoundError } from "~/domain/project/project.errors";
import { getProjectDetail } from "../get-project-detail.service";
import {
	projectAlpha,
	projectBeta,
	projectGamma,
} from "../../../../__tests__/fixtures/velite-projects.fixture";

describe("getProjectDetail", () => {
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

	it("존재하는 slug이면 { project, prev, next }를 반환한다", async () => {
		vi.mocked(mockRepo.findBySlug).mockResolvedValue(projectAlpha as never);
		vi.mocked(mockRepo.findRelated).mockResolvedValue({
			prev: projectBeta as never,
			next: null,
		});

		const result = await getProjectDetail(mockRepo, "alpha");

		expect(vi.mocked(mockRepo.findBySlug)).toHaveBeenCalledWith("alpha");
		expect(vi.mocked(mockRepo.findRelated)).toHaveBeenCalledWith("alpha");
		expect(result.project).toEqual(projectAlpha);
		expect(result.prev).toEqual(projectBeta);
		expect(result.next).toBeNull();
	});

	it("findBySlug가 null을 반환하면 ProjectNotFoundError를 throw한다", async () => {
		vi.mocked(mockRepo.findBySlug).mockResolvedValue(null);

		await expect(getProjectDetail(mockRepo, "nonexistent")).rejects.toThrow(ProjectNotFoundError);
		expect(vi.mocked(mockRepo.findRelated)).not.toHaveBeenCalled();
	});

	it("인접 프로젝트 prev/next 모두 null인 경우도 반환한다", async () => {
		vi.mocked(mockRepo.findBySlug).mockResolvedValue(projectGamma as never);
		vi.mocked(mockRepo.findRelated).mockResolvedValue({ prev: null, next: null });

		const result = await getProjectDetail(mockRepo, "gamma");

		expect(result.project).toEqual(projectGamma);
		expect(result.prev).toBeNull();
		expect(result.next).toBeNull();
	});
});
