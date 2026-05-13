const MINUTE = 60;
const HOUR = 60 * 60;
const DAY = 60 * 60 * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export const formatRelativeTime = (
	ts: number,
	now: number = Math.floor(Date.now() / 1000),
): string => {
	const diff = now - ts;
	if (diff < MINUTE) return "just now";
	if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
	if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
	if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
	if (diff < MONTH) return `${Math.floor(diff / WEEK)}w ago`;
	if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo ago`;
	return `${Math.floor(diff / YEAR)}y ago`;
};
