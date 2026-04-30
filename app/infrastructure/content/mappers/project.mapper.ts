import type { Project } from "~/domain/project/project.entity";

type VeliteProjectInput = {
	slug: string;
	title: string;
	summary: string;
	date: string;
	tags: string[];
	stack: string[];
	metrics: [string, string][];
	featured?: boolean;
	cover?: string;
	role?: string;
	body?: string;
	toc?: { slug: string; text: string }[];
};

export const toProject = (raw: VeliteProjectInput): Project => ({
	slug: raw.slug,
	title: raw.title,
	summary: raw.summary,
	date: raw.date,
	tags: raw.tags,
	stack: raw.stack,
	metrics: raw.metrics,
	featured: raw.featured,
	cover: raw.cover,
	role: raw.role,
	body: raw.body,
	toc: raw.toc,
});
