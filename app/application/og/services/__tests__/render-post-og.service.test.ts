import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OgImageRenderer } from "~/application/og/ports/og-image-renderer.port";
import type { PostRepository } from "~/application/content/ports/post-repository.port";
import { postAlpha } from "../../../../__tests__/fixtures/velite-posts.fixture";
import { renderPostOg } from "../render-post-og.service";

describe("renderPostOg", () => {
	let mockRepo: Partial<PostRepository>;
	let mockRenderer: OgImageRenderer;
	const fakePng = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

	beforeEach(() => {
		mockRepo = {
			findBySlug: vi.fn().mockResolvedValue(postAlpha),
		};
		mockRenderer = {
			render: vi.fn().mockResolvedValue(fakePng),
		};
	});

	it("정상 slug면 repo 조회 후 renderer.render({kind:'post'})로 호출하고 PNG 바이트를 반환한다", async () => {
		const repo = mockRepo as PostRepository;

		const bytes = await renderPostOg({ repo, renderer: mockRenderer, slug: "alpha" });

		expect(mockRepo.findBySlug).toHaveBeenCalledWith("alpha");
		expect(mockRenderer.render).toHaveBeenCalledWith({
			kind: "post",
			title: postAlpha.title,
			date: postAlpha.date,
			tags: postAlpha.tags,
		});
		expect(bytes).toBe(fakePng);
	});

	it("미존재 slug면 null을 반환하고 renderer.render는 호출하지 않는다", async () => {
		mockRepo.findBySlug = vi.fn().mockResolvedValue(null);
		const repo = mockRepo as PostRepository;

		const bytes = await renderPostOg({ repo, renderer: mockRenderer, slug: "missing" });

		expect(bytes).toBeNull();
		expect(mockRenderer.render).not.toHaveBeenCalled();
	});
});
