import type { Project } from "~/domain/project/project.entity";
import { ProjectNotFoundError } from "~/domain/project/project.errors";
import type { ProjectRepository } from "../ports/project-repository.port";

export const getProjectDetail = async (
	repo: ProjectRepository,
	slug: string,
): Promise<{ project: Project; prev: Project | null; next: Project | null }> => {
	const project = await repo.findBySlug(slug);
	if (!project) throw new ProjectNotFoundError(slug);
	const { prev, next } = await repo.findRelated(slug);
	return { project, prev, next };
};
