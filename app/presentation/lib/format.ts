const ISO_DATE_PREFIX_RE = /^\d{4}-\d{2}-\d{2}/;

export const formatDate = (date: string): string => {
	if (!ISO_DATE_PREFIX_RE.test(date) || Number.isNaN(Date.parse(date))) {
		throw new Error(`Invalid date: ${date}`);
	}
	return date.substring(0, 10);
};
