import { createHighlighter } from "shiki";

export default {
	async fetch(): Promise<Response> {
		const hl = await createHighlighter({
			themes: ["github-dark"],
			langs: ["typescript", "javascript", "shell"],
		});
		const html = hl.codeToHtml("const x = 1;", {
			theme: "github-dark",
			lang: "typescript",
		});
		return new Response(html);
	},
};
