import { describe, expect, it, vi, beforeEach } from "vitest";
import type { PostRepository } from "~/application/content/ports/post-repository.port";
import { getRecentPosts } from "../get-recent-posts.service";
import { postCharlie, postDelta } from "../../../../__tests__/fixtures/velite-posts.fixture";

describe("getRecentPosts", () => {
	let mockRepo: PostRepository;

	beforeEach(() => {
		mockRepo = {
			findAll: vi.fn(),
			findBySlug: vi.fn(),
			findRecent: vi.fn(),
			findByTag: vi.fn(),
			findRelated: vi.fn(),
		};
	});

	it("getRecentPosts(repo, 3) 호출 시 findRecent(3)에 위임하고 결과를 그대로 반환한다", async () => {
		// Arrange
		const repo = mockRepo;
		vi.mocked(mockRepo.findRecent).mockResolvedValue([postDelta, postCharlie] as never);

		// Act
		const result = await getRecentPosts(repo, 3);

		// Assert
		expect(vi.mocked(mockRepo.findRecent)).toHaveBeenCalledTimes(1);
		expect(vi.mocked(mockRepo.findRecent)).toHaveBeenCalledWith(3);
		expect(result).toEqual([postDelta, postCharlie]);
	});

	it("getRecentPosts(repo, 1) 호출 시 findRecent(1)을 1회 호출한다", async () => {
		// Arrange
		const repo = mockRepo;
		vi.mocked(mockRepo.findRecent).mockResolvedValue([postDelta] as never);

		// Act
		const result = await getRecentPosts(repo, 1);

		// Assert
		expect(vi.mocked(mockRepo.findRecent)).toHaveBeenCalledTimes(1);
		expect(vi.mocked(mockRepo.findRecent)).toHaveBeenCalledWith(1);
		expect(result).toHaveLength(1);
	});
});
