import type { Post } from "~/domain/post/post.entity";
import type { Project } from "~/domain/project/project.entity";

const SCHEMA_CONTEXT = "https://schema.org";
const PERSON_NAME = "김태곤";
const PERSON_EMAIL = "hello@tkstar.dev";
const PERSON_SAME_AS = ["https://github.com/onepunch-tk"];

const buildAuthor = (origin: string) => ({
	"@type": "Person",
	name: PERSON_NAME,
	url: origin,
});

export const buildPersonLd = ({ origin }: { origin: string }): Record<string, unknown> => ({
	"@context": SCHEMA_CONTEXT,
	"@type": "Person",
	name: PERSON_NAME,
	email: PERSON_EMAIL,
	url: origin,
	sameAs: PERSON_SAME_AS,
});

export const buildBlogPostingLd = ({
	post,
	origin,
	ogImage,
}: {
	post: Post;
	origin: string;
	ogImage: string;
}): Record<string, unknown> => ({
	"@context": SCHEMA_CONTEXT,
	"@type": "BlogPosting",
	headline: post.title,
	description: post.lede,
	datePublished: post.date,
	image: ogImage,
	mainEntityOfPage: `${origin}/blog/${post.slug}`,
	inLanguage: "ko",
	author: buildAuthor(origin),
});

export const buildCreativeWorkLd = ({
	project,
	origin,
	ogImage,
}: {
	project: Project;
	origin: string;
	ogImage: string;
}): Record<string, unknown> => ({
	"@context": SCHEMA_CONTEXT,
	"@type": "CreativeWork",
	name: project.title,
	description: project.summary,
	datePublished: project.date,
	image: ogImage,
	url: `${origin}/projects/${project.slug}`,
	inLanguage: "ko",
	author: buildAuthor(origin),
});

export const buildBreadcrumbListLd = ({
	items,
}: {
	items: { name: string; url: string }[];
}): Record<string, unknown> => ({
	"@context": SCHEMA_CONTEXT,
	"@type": "BreadcrumbList",
	itemListElement: items.map((item, index) => ({
		"@type": "ListItem",
		position: index + 1,
		name: item.name,
		item: item.url,
	})),
});
