import { marked } from "marked";

export default {
	async fetch(): Promise<Response> {
		const html = await marked.parse("# hello\n\n```ts\nconst x = 1;\n```");
		return new Response(html);
	},
};
