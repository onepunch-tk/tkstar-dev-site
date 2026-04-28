export const sortByDateDesc = <T extends { date: string }>(items: T[]): T[] =>
	[...items].sort((a, b) => b.date.localeCompare(a.date));
