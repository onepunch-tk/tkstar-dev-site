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

export const buildMeta = (_input: BuildMetaInput): MetaDescriptor[] => {
	throw new Error("not implemented");
};

export const getCanonicalUrl = (_origin: string, _pathname: string): string => {
	throw new Error("not implemented");
};
