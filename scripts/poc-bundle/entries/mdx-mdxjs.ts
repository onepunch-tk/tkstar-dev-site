import { compile } from "@mdx-js/mdx";

export default {
	async fetch(): Promise<Response> {
		const out = await compile("# hello\n\n```ts\nconst x = 1;\n```");
		return new Response(String(out));
	},
};
