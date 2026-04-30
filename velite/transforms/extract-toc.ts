import GithubSlugger from "github-slugger";

export const extractToc = (markdown: string): { slug: string; text: string }[] => {
	const slugger = new GithubSlugger();
	const toc: { slug: string; text: string }[] = [];
	let inFence = false;

	for (const line of markdown.split("\n")) {
		if (/^\s*```/.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		const match = /^##\s+(.+?)\s*$/.exec(line);
		if (!match) continue;
		const text = match[1].trim();
		toc.push({ slug: slugger.slug(text), text });
	}

	return toc;
};
