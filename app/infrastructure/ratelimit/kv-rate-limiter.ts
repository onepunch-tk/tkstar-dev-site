import type { RateLimiter } from "~/application/contact/ports/rate-limiter.port";

const formatHourKey = (now: Date): string => {
	const yyyy = now.getUTCFullYear();
	const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
	const dd = String(now.getUTCDate()).padStart(2, "0");
	const hh = String(now.getUTCHours()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}-${hh}`;
};

export const createKvRateLimiter = (kv: KVNamespace): RateLimiter => ({
	check: async (key, max, windowSec) => {
		const fullKey = `${key}:${formatHourKey(new Date())}`;
		const current = Number((await kv.get(fullKey)) ?? "0");
		if (current >= max) return false;
		await kv.put(fullKey, String(current + 1), { expirationTtl: windowSec });
		return true;
	},
});
