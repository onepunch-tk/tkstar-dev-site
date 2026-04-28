import type { Project } from "~/domain/project/project.entity";
import type { ProjectRepository } from "../ports/project-repository.port";

export const getFeaturedProject = async (repo: ProjectRepository): Promise<Project | null> => {
	return repo.findFeatured();
};
