export interface RateLimiter {
	check(key: string, max: number, windowSec: number): Promise<boolean>;
}
