export class PostNotFoundError extends Error {
	constructor(slug: string) {
		super(`Post not found: ${slug}`);
		this.name = "PostNotFoundError";
	}
}

export class InvalidPostFrontmatterError extends Error {
	constructor(slug: string, issues: string) {
		super(`Invalid post frontmatter (${slug}): ${issues}`);
		this.name = "InvalidPostFrontmatterError";
	}
}
