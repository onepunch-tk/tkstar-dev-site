export const formatDate = (date: string): string => {
	if (!date || Number.isNaN(Date.parse(date))) {
		throw new Error(`Invalid date: ${date}`);
	}
	return date.substring(0, 10);
};
