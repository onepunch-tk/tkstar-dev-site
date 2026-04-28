import type { Project } from "~/domain/project/project.entity";

export interface ProjectRepository {
	findAll(): Promise<Project[]>;
	findBySlug(slug: string): Promise<Project | null>;
	findFeatured(): Promise<Project | null>;
	findRelated(slug: string): Promise<{ prev: Project | null; next: Project | null }>;
	findByTag(tag: string): Promise<Project[]>;
}
