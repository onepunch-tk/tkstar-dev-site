import type { MetaDescriptor } from "react-router";

type BuildMetaInput = {
	title: string;
	description: string;
	canonical: string;
	ogImage: string;
	ogType?: "website" | "article" | "profile";
	robots?: "noindex, follow" | "noindex, nofollow";
	ogImageWidth?: number;
	ogImageHeight?: number;
};

export const buildMeta = ({
	title,
	description,
	canonical,
	ogImage,
	ogType = "website",
	robots,
	ogImageWidth = 1200,
	ogImageHeight = 630,
}: BuildMetaInput): MetaDescriptor[] => {
	const tags: MetaDescriptor[] = [
		{ title },
		{ name: "description", content: description },
		{ tagName: "link", rel: "canonical", href: canonical },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:url", content: canonical },
		{ property: "og:image", content: ogImage },
		{ property: "og:image:width", content: String(ogImageWidth) },
		{ property: "og:image:height", content: String(ogImageHeight) },
		{ property: "og:type", content: ogType },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: ogImage },
	];
	if (robots) tags.push({ name: "robots", content: robots });
	return tags;
};

export const getCanonicalUrl = (origin: string, pathname: string): string => `${origin}${pathname}`;
