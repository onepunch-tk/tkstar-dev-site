import type { Post } from "~/domain/post/post.entity";
import type { Project } from "~/domain/project/project.entity";

type SitemapInput = {
	origin: string;
	projects: Pick<Project, "slug" | "date">[];
	posts: Pick<Post, "slug" | "datePublished" | "updatedAt">[];
	generatedAt: Date;
};

const STATIC_PATHS = ["/", "/about", "/projects", "/blog", "/contact", "/legal"] as const;

const escapeXml = (s: string): string =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const toDateOnly = (s: string): string => s.slice(0, 10);

export const buildSitemap = ({ origin, projects, posts, generatedAt }: SitemapInput): string => {
	const staticLastmod = toDateOnly(generatedAt.toISOString());

	const staticEntries = STATIC_PATHS.map(
		(path) =>
			`  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>${staticLastmod}</lastmod>\n  </url>`,
	);

	const projectEntries = projects.map(
		(p) =>
			`  <url>\n    <loc>${origin}/projects/${escapeXml(p.slug)}</loc>\n    <lastmod>${toDateOnly(p.date)}</lastmod>\n  </url>`,
	);

	const postEntries = posts.map((p) => {
		const lastmod = p.datePublished ?? new Date(p.updatedAt * 1000).toISOString();
		return `  <url>\n    <loc>${origin}/blog/${escapeXml(p.slug)}</loc>\n    <lastmod>${toDateOnly(lastmod)}</lastmod>\n  </url>`;
	});

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...staticEntries,
		...projectEntries,
		...postEntries,
		"</urlset>",
	].join("\n");
};
