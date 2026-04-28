export class ProjectNotFoundError extends Error {
	constructor(slug: string) {
		super(`Project not found: ${slug}`);
		this.name = "ProjectNotFoundError";
	}
}

export class InvalidProjectFrontmatterError extends Error {
	constructor(slug: string, issues: string) {
		super(`Invalid project frontmatter (${slug}): ${issues}`);
		this.name = "InvalidProjectFrontmatterError";
	}
}
