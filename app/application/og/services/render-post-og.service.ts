import type { PostRepository } from "~/application/content/ports/post-repository.port";
import type { OgImageRenderer } from "~/application/og/ports/og-image-renderer.port";

export const renderPostOg = async (params: {
	repo: PostRepository;
	renderer: OgImageRenderer;
	slug: string;
}): Promise<Uint8Array | null> => {
	const post = await params.repo.findBySlug(params.slug);
	if (!post) return null;

	return params.renderer.render({
		kind: "post",
		title: post.title,
		date: post.date,
		tags: post.tags,
	});
};
