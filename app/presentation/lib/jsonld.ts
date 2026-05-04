import type { Post } from "~/domain/post/post.entity";
import type { Project } from "~/domain/project/project.entity";

export const buildPersonLd = (_input: { origin: string }): Record<string, unknown> => {
	throw new Error("not implemented");
};

export const buildBlogPostingLd = (_input: {
	post: Post;
	origin: string;
	ogImage: string;
}): Record<string, unknown> => {
	throw new Error("not implemented");
};

export const buildCreativeWorkLd = (_input: {
	project: Project;
	origin: string;
	ogImage: string;
}): Record<string, unknown> => {
	throw new Error("not implemented");
};

export const buildBreadcrumbListLd = (_input: {
	items: { name: string; url: string }[];
}): Record<string, unknown> => {
	throw new Error("not implemented");
};

export const renderJsonLd = (_obj: Record<string, unknown>): string => {
	throw new Error("not implemented");
};
