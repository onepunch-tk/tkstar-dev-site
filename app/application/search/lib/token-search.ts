export type SearchableItem = {
	slug: string;
	title: string;
	tags?: string[];
	summary?: string;
};

const TITLE_WEIGHT = 3;
const TAG_WEIGHT = 2;
const SUMMARY_WEIGHT = 1;

export const tokenSearch = <T extends SearchableItem>(items: T[], query: string): T[] => {
	const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return [...items];

	const scored: { item: T; score: number; index: number }[] = [];
	for (let index = 0; index < items.length; index++) {
		const item = items[index];
		const title = item.title.toLowerCase();
		const tagsText = (item.tags ?? []).join(" ").toLowerCase();
		const summary = (item.summary ?? "").toLowerCase();

		let score = 0;
		let allMatched = true;
		for (const token of tokens) {
			let tokenScore = 0;
			if (title.includes(token)) tokenScore += TITLE_WEIGHT;
			if (tagsText.includes(token)) tokenScore += TAG_WEIGHT;
			if (summary.includes(token)) tokenScore += SUMMARY_WEIGHT;
			if (tokenScore === 0) {
				allMatched = false;
				break;
			}
			score += tokenScore;
		}

		if (allMatched) scored.push({ item, score, index });
	}

	scored.sort((a, b) => b.score - a.score || a.index - b.index);
	return scored.map((s) => s.item);
};
