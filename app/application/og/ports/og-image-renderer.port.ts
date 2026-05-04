export type OgRenderInput = {
	kind: "project" | "post";
	title: string;
	date: string;
	tags: string[];
};

export interface OgImageRenderer {
	render(input: OgRenderInput): Promise<Uint8Array>;
}
