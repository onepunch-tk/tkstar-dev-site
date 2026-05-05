import { describe, expect, it, vi, beforeEach } from "vitest";
import type { PostRepository } from "~/application/content/ports/post-repository.port";
import { listPosts } from "../list-posts.service";
import {
	postAlpha,
	postBravo,
	postCharlie,
	postDelta,
} from "../../../../__tests__/fixtures/velite-posts.fixture";

describe("listPosts", () => {
	let mockRepo: PostRepository;

	beforeEach(() => {
		mockRepo = {
			findAll: vi.fn().mockResolvedValue([postAlpha, postBravo, postCharlie, postDelta]),
			findBySlug: vi.fn(),
			findRecent: vi.fn(),
			findByTag: vi.fn().mockResolvedValue([postDelta]),
			findRelated: vi.fn(),
		};
	});

	it("opts 없으면 findAll을 호출하고 전체 목록을 반환한다", async () => {
		// Arrange
		const repo = mockRepo;

		// Act
		const result = await listPosts(repo);

		// Assert
		expect(vi.mocked(mockRepo.findAll)).toHaveBeenCalledTimes(1);
		expect(vi.mocked(mockRepo.findByTag)).not.toHaveBeenCalled();
		expect(result).toHaveLength(4);
	});

	it("opts.tag 있으면 findByTag를 호출하고 findAll은 호출하지 않는다", async () => {
		// Arrange
		const repo = mockRepo;

		// Act
		const result = await listPosts(repo, { tag: "react" });

		// Assert
		expect(vi.mocked(mockRepo.findByTag)).toHaveBeenCalledTimes(1);
		expect(vi.mocked(mockRepo.findByTag)).toHaveBeenCalledWith("react");
		expect(vi.mocked(mockRepo.findAll)).not.toHaveBeenCalled();
		expect(result).toHaveLength(1);
	});
});
