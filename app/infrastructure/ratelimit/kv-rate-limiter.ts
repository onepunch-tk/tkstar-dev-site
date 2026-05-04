import type { RateLimiter } from "~/application/contact/ports/rate-limiter.port";

export const createKvRateLimiter = (_kv: KVNamespace): RateLimiter => ({
	check: async () => {
		throw new Error("createKvRateLimiter not yet implemented");
	},
});
