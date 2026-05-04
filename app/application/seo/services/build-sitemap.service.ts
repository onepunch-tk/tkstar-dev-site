import type { Post } from "~/domain/post/post.entity";
import type { Project } from "~/domain/project/project.entity";

type SitemapInput = {
	origin: string;
	projects: Pick<Project, "slug" | "date">[];
	posts: Pick<Post, "slug" | "date">[];
	generatedAt: Date;
};

export const buildSitemap = (_input: SitemapInput): string => {
	throw new Error("not implemented");
};
