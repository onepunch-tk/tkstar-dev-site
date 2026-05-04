import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OgImageRenderer } from "~/application/og/ports/og-image-renderer.port";
import type { ProjectRepository } from "~/application/content/ports/project-repository.port";
import { projectAlpha } from "../../../../__tests__/fixtures/velite-projects.fixture";
import { renderProjectOg } from "../render-project-og.service";

describe("renderProjectOg", () => {
	let mockRepo: Partial<ProjectRepository>;
	let mockRenderer: OgImageRenderer;
	const fakePng = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

	beforeEach(() => {
		mockRepo = {
			findBySlug: vi.fn().mockResolvedValue(projectAlpha),
		};
		mockRenderer = {
			render: vi.fn().mockResolvedValue(fakePng),
		};
	});

	it("정상 slug면 repo 조회 후 renderer.render({kind:'project'})로 호출하고 PNG 바이트를 반환한다", async () => {
		const repo = mockRepo as ProjectRepository;

		const bytes = await renderProjectOg({
			repo,
			renderer: mockRenderer,
			slug: "alpha",
			origin: "https://example.com",
		});

		expect(mockRepo.findBySlug).toHaveBeenCalledWith("alpha");
		expect(mockRenderer.render).toHaveBeenCalledWith({
			kind: "project",
			title: projectAlpha.title,
			date: projectAlpha.date,
			tags: projectAlpha.tags,
			origin: "https://example.com",
		});
		expect(bytes).toBe(fakePng);
	});

	it("미존재 slug면 null을 반환하고 renderer.render는 호출하지 않는다", async () => {
		mockRepo.findBySlug = vi.fn().mockResolvedValue(null);
		const repo = mockRepo as ProjectRepository;

		const bytes = await renderProjectOg({
			repo,
			renderer: mockRenderer,
			slug: "missing",
			origin: "https://example.com",
		});

		expect(bytes).toBeNull();
		expect(mockRenderer.render).not.toHaveBeenCalled();
	});
});
