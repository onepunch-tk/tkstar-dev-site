import { projects } from "#content";
import type { ProjectRepository } from "~/application/content/ports/project-repository.port";
import type { Project } from "~/domain/project/project.entity";
import { toProject } from "./mappers/project.mapper";

const cache: Project[] = projects.map(toProject).sort((a, b) => b.date.localeCompare(a.date));

export const veliteProjectRepository: ProjectRepository = {
	async findAll() {
		return cache;
	},
	async findBySlug(slug) {
		return cache.find((p) => p.slug === slug) ?? null;
	},
	async findFeatured() {
		return cache.find((p) => p.featured === true) ?? null;
	},
	async findRelated(slug) {
		const idx = cache.findIndex((p) => p.slug === slug);
		if (idx === -1) return { prev: null, next: null };
		return {
			prev: idx > 0 ? cache[idx - 1] : null,
			next: idx < cache.length - 1 ? cache[idx + 1] : null,
		};
	},
	async findByTag(tag) {
		return cache.filter((p) => p.tags.includes(tag));
	},
};
