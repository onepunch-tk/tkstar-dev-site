export type OgRenderInput = {
	kind: "project" | "post";
	title: string;
	date: string;
	tags: string[];
	origin: string;
};

export interface OgImageRenderer {
	render(input: OgRenderInput): Promise<Uint8Array>;
}
