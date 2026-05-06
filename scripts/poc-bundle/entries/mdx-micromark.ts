import { micromark } from "micromark";

export default {
	async fetch(): Promise<Response> {
		const html = micromark("# hello\n\n```ts\nconst x = 1;\n```");
		return new Response(html);
	},
};
