import { projects } from "#content";
import type { ProjectRepository } from "~/application/content/ports/project-repository.port";
import type { Project } from "~/domain/project/project.entity";
import { findAdjacent } from "./_shared/find-adjacent";
import { sortByDateDesc } from "./_shared/sort-by-date-desc";
import { toProject } from "./mappers/project.mapper";

const cache: readonly Project[] = Object.freeze(sortByDateDesc(projects.map(toProject)));

export const veliteProjectRepository: ProjectRepository = {
	async findAll() {
		return [...cache];
	},
	async findBySlug(slug) {
		return cache.find((p) => p.slug === slug) ?? null;
	},
	async findFeatured() {
		return cache.find((p) => p.featured === true) ?? null;
	},
	async findRelated(slug) {
		return findAdjacent([...cache], slug);
	},
	async findByTag(tag) {
		return cache.filter((p) => p.tags.includes(tag));
	},
};
