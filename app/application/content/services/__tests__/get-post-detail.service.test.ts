import { describe, expect, it, vi, beforeEach } from "vitest";
import type { PostRepository } from "~/application/content/ports/post-repository.port";
import { PostNotFoundError } from "~/domain/post/post.errors";
import { getPostDetail } from "../get-post-detail.service";
import {
	postAlpha,
	postBravo,
	postCharlie,
} from "../../../../__tests__/fixtures/velite-posts.fixture";

describe("getPostDetail", () => {
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

	it("존재하는 slug이면 { post, prev, next }를 반환한다", async () => {
		// Arrange
		const repo = mockRepo;
		vi.mocked(mockRepo.findBySlug).mockResolvedValue(postBravo as never);
		vi.mocked(mockRepo.findRelated).mockResolvedValue({
			prev: postCharlie as never,
			next: postAlpha as never,
		});

		// Act
		const result = await getPostDetail(repo, "bravo");

		// Assert
		expect(vi.mocked(mockRepo.findBySlug)).toHaveBeenCalledWith("bravo");
		expect(vi.mocked(mockRepo.findRelated)).toHaveBeenCalledWith("bravo");
		expect(result.post).toEqual(postBravo);
		expect(result.prev).toEqual(postCharlie);
		expect(result.next).toEqual(postAlpha);
	});

	it("findBySlug가 null을 반환하면 PostNotFoundError를 throw한다", async () => {
		// Arrange
		const repo = mockRepo;
		vi.mocked(mockRepo.findBySlug).mockResolvedValue(null);

		// Act & Assert
		await expect(getPostDetail(repo, "nonexistent")).rejects.toThrow(PostNotFoundError);
		expect(vi.mocked(mockRepo.findRelated)).not.toHaveBeenCalled();
	});

	it("인접 포스트 prev/next 모두 null인 경우도 정상 반환한다", async () => {
		// Arrange
		const repo = mockRepo;
		vi.mocked(mockRepo.findBySlug).mockResolvedValue(postAlpha as never);
		vi.mocked(mockRepo.findRelated).mockResolvedValue({ prev: null, next: null });

		// Act
		const result = await getPostDetail(repo, "alpha");

		// Assert
		expect(result.post).toEqual(postAlpha);
		expect(result.prev).toBeNull();
		expect(result.next).toBeNull();
	});
});
