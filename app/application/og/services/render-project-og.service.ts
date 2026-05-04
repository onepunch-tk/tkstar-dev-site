import type { ProjectRepository } from "~/application/content/ports/project-repository.port";
import type { OgImageRenderer } from "~/application/og/ports/og-image-renderer.port";

export const renderProjectOg = async (params: {
	repo: ProjectRepository;
	renderer: OgImageRenderer;
	slug: string;
}): Promise<Uint8Array | null> => {
	const project = await params.repo.findBySlug(params.slug);
	if (!project) return null;

	return params.renderer.render({
		kind: "project",
		title: project.title,
		date: project.date,
		tags: project.tags,
	});
};
