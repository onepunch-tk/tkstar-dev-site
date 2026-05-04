import { beforeEach, describe, expect, it, vi } from "vitest";
import { createKvRateLimiter } from "../kv-rate-limiter";

type StoredValue = { value: string; ttl?: number };

const buildKvMock = (): KVNamespace & {
	__store: Map<string, StoredValue>;
	__putCalls: Array<{ key: string; value: string; opts?: KVNamespacePutOptions }>;
} => {
	const store = new Map<string, StoredValue>();
	const putCalls: Array<{ key: string; value: string; opts?: KVNamespacePutOptions }> = [];
	const kv = {
		get: vi.fn(async (key: string) => store.get(key)?.value ?? null),
		put: vi.fn(async (key: string, value: string, opts?: KVNamespacePutOptions) => {
			putCalls.push({ key, value, opts });
			store.set(key, { value, ttl: opts?.expirationTtl });
		}),
		delete: vi.fn(async (key: string) => {
			store.delete(key);
		}),
		list: vi.fn(),
		getWithMetadata: vi.fn(),
	} as unknown as KVNamespace & {
		__store: Map<string, StoredValue>;
		__putCalls: typeof putCalls;
	};
	(kv as { __store: typeof store }).__store = store;
	(kv as { __putCalls: typeof putCalls }).__putCalls = putCalls;
	return kv;
};

describe("createKvRateLimiter", () => {
	let kv: ReturnType<typeof buildKvMock>;

	beforeEach(() => {
		kv = buildKvMock();
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-04T14:23:00Z"));
	});

	it("같은 IP 5회 OK + 6번째 false (max=5, window=3600s)", async () => {
		const limiter = createKvRateLimiter(kv);
		const key = "contact:1.2.3.4";

		for (let i = 0; i < 5; i += 1) {
			expect(await limiter.check(key, 5, 3600)).toBe(true);
		}
		expect(await limiter.check(key, 5, 3600)).toBe(false);
	});

	it("KV put 호출 시 expirationTtl: 3600 인자가 전달됨 + key 패턴 contact:{ip}:{yyyy-mm-dd-hh}", async () => {
		const limiter = createKvRateLimiter(kv);

		await limiter.check("contact:1.2.3.4", 5, 3600);

		expect(kv.__putCalls.length).toBeGreaterThanOrEqual(1);
		const lastPut = kv.__putCalls.at(-1);
		expect(lastPut?.opts?.expirationTtl).toBe(3600);
		expect(lastPut?.key).toBe("contact:1.2.3.4:2026-05-04-14");
	});
});
