import type { Project } from "~/domain/project/project.entity";
import type { ProjectRepository } from "../ports/project-repository.port";

export const listProjects = async (
	repo: ProjectRepository,
	opts?: { tag?: string },
): Promise<Project[]> => {
	if (opts?.tag) return repo.findByTag(opts.tag);
	return repo.findAll();
};
