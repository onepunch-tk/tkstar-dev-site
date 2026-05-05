export const findAdjacent = <T extends { slug: string }>(
	items: T[],
	slug: string,
): { prev: T | null; next: T | null } => {
	const idx = items.findIndex((i) => i.slug === slug);
	if (idx === -1) return { prev: null, next: null };
	return {
		prev: idx > 0 ? items[idx - 1] : null,
		next: idx < items.length - 1 ? items[idx + 1] : null,
	};
};
