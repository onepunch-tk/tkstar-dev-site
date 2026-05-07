import type { Root as HastRoot } from "hast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createKvPostBodyCache } from "../kv-post-body-cache";

const makeFixture = (label: string): HastRoot => ({
	type: "root",
	children: [{ type: "text", value: label }],
});

type StoredValue = { value: string };

const buildKvMock = (): KVNamespace & {
	__store: Map<string, StoredValue>;
	__putCalls: Array<{ key: string; value: string; opts?: KVNamespacePutOptions }>;
} => {
	const store = new Map<string, StoredValue>();
	const putCalls: Array<{ key: string; value: string; opts?: KVNamespacePutOptions }> = [];

	const kv = {
		// "json" 타입 인자 지원: stored value 를 JSON.parse 해서 반환
		get: vi.fn(async (key: string, type?: "json" | "text" | "arrayBuffer" | "stream") => {
			const entry = store.get(key);
			if (entry === undefined) return null;
			if (type === "json") {
				return JSON.parse(entry.value) as unknown;
			}
			return entry.value;
		}),
		put: vi.fn(async (key: string, value: string, opts?: KVNamespacePutOptions) => {
			putCalls.push({ key, value, opts });
			store.set(key, { value });
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

describe("createKvPostBodyCache", () => {
	let kv: ReturnType<typeof buildKvMock>;

	beforeEach(() => {
		kv = buildKvMock();
	});

	it("set → get 라운드트립 — 동일 객체 반환", async () => {
		// Arrange
		const cache = createKvPostBodyCache(kv);
		const hast = makeFixture("roundtrip");

		// Act
		await cache.set("hello-world", "abc123def4567890", hast);
		const result = await cache.get("hello-world", "abc123def4567890");

		// Assert
		expect(result).toEqual(makeFixture("roundtrip"));
	});

	it("cache miss → null 반환", async () => {
		// Arrange
		const cache = createKvPostBodyCache(kv);

		// Act
		const result = await cache.get("nonexistent-slug", "deadbeefcafe1234");

		// Assert
		expect(result).toBeNull();
	});

	it("다른 slug — 별도 key 로 격리 (cross-contamination 없음)", async () => {
		// Arrange
		const cache = createKvPostBodyCache(kv);
		const hash = "hash000000000000";

		// Act
		await cache.set("a", hash, makeFixture("a-content"));
		await cache.set("b", hash, makeFixture("b-content"));
		const resultA = await cache.get("a", hash);
		const resultB = await cache.get("b", hash);

		// Assert
		expect(resultA).toEqual(makeFixture("a-content"));
		expect(resultB).toEqual(makeFixture("b-content"));
	});

	it("다른 hash — 별도 key 로 격리 (slug 같지만 hash 다름, 구버전이 신버전을 덮어쓰지 않음)", async () => {
		// Arrange
		const cache = createKvPostBodyCache(kv);
		const slug = "post-1";

		// Act
		await cache.set(slug, "h1aaaaaaaaaaaaaa", makeFixture("v1"));
		await cache.set(slug, "h2bbbbbbbbbbbbbb", makeFixture("v2"));
		const resultV1 = await cache.get(slug, "h1aaaaaaaaaaaaaa");
		const resultV2 = await cache.get(slug, "h2bbbbbbbbbbbbbb");

		// Assert
		expect(resultV1).toEqual(makeFixture("v1"));
		expect(resultV2).toEqual(makeFixture("v2"));
	});

	it("cache key 패턴 검증 — post:{slug}:body:v{hash} 형태로 저장됨", async () => {
		// Arrange
		const cache = createKvPostBodyCache(kv);

		// Act
		await cache.set("hello-world", "abc123def4567890", makeFixture("anything"));

		// Assert
		expect(kv.__store.has("post:hello-world:body:vabc123def4567890")).toBe(true);
	});

	it("kv.put 의 value 는 JSON.stringify 결과 (string equality)", async () => {
		// Arrange
		const cache = createKvPostBodyCache(kv);
		const hast = makeFixture("hi");

		// Act
		await cache.set("slug-x", "hash-x12345678", hast);

		// Assert
		const lastPut = kv.__putCalls.at(-1);
		expect(lastPut?.value).toBe(JSON.stringify(hast));
	});
});
