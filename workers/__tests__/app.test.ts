import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock 팩토리는 호이스팅되므로 모듈 스코프 const는 TDZ 상태.
// vi.hoisted()로 선언한 변수만 호이스팅된 팩토리 안에서 안전하게 참조할 수 있다.
const { mockRequestHandler } = vi.hoisted(() => ({
	mockRequestHandler: vi.fn(),
}));

vi.mock("react-router", () => ({
	createRequestHandler: () => mockRequestHandler,
}));

vi.mock("~/infrastructure/config/container", () => ({
	buildContainer: vi.fn().mockReturnValue({}),
}));

// vi.mock은 호이스팅되므로 모킹 선언 이후에 import
import handler from "../app";

// ExecContext 최소 stub
const makeCtx = () =>
	({
		waitUntil: vi.fn(),
		passThroughOnException: vi.fn(),
	}) as never;

const callFetch = (url: string) => handler.fetch(new Request(url) as never, {} as never, makeCtx());

describe("workers/app.ts fetch handler — host 정규화", () => {
	beforeEach(() => {
		// 각 테스트 전 requestHandler가 200 통과 응답을 반환하도록 초기화
		mockRequestHandler.mockResolvedValue(new Response("ok", { status: 200 }));
	});

	it("https://tkstar.dev 정규 URL은 그대로 통과한다", async () => {
		// Arrange
		const url = "https://tkstar.dev/path?q=1";

		// Act
		const res = await callFetch(url);

		// Assert
		expect(res.status).toBe(200);
	});

	it("https://www.tkstar.dev → https://tkstar.dev 301 리다이렉트", async () => {
		// Arrange
		const url = "https://www.tkstar.dev/path?q=1";

		// Act
		const res = await callFetch(url);

		// Assert
		expect(res.status).toBe(301);
		expect(res.headers.get("Location")).toBe("https://tkstar.dev/path?q=1");
	});

	it("http://tkstar.dev → https://tkstar.dev 301 리다이렉트", async () => {
		// Arrange
		const url = "http://tkstar.dev/path?q=1";

		// Act
		const res = await callFetch(url);

		// Assert
		expect(res.status).toBe(301);
		expect(res.headers.get("Location")).toBe("https://tkstar.dev/path?q=1");
	});

	it("http://www.tkstar.dev → https://tkstar.dev 301 리다이렉트", async () => {
		// Arrange
		const url = "http://www.tkstar.dev/path?q=1";

		// Act
		const res = await callFetch(url);

		// Assert
		expect(res.status).toBe(301);
		expect(res.headers.get("Location")).toBe("https://tkstar.dev/path?q=1");
	});

	it("https://tkstar.dev/ 루트(쿼리 없음)는 그대로 통과한다", async () => {
		// Arrange
		const url = "https://tkstar.dev/";

		// Act
		const res = await callFetch(url);

		// Assert
		expect(res.status).toBe(200);
	});

	it("https://www.tkstar.dev/ 루트 → https://tkstar.dev/ (trailing slash 보존) 301 리다이렉트", async () => {
		// Arrange
		const url = "https://www.tkstar.dev/";

		// Act
		const res = await callFetch(url);

		// Assert
		expect(res.status).toBe(301);
		expect(res.headers.get("Location")).toBe("https://tkstar.dev/");
	});

	it("http://localhost:5173 개발 환경 URL은 그대로 통과한다", async () => {
		// Arrange
		const url = "http://localhost:5173/path";

		// Act
		const res = await callFetch(url);

		// Assert
		expect(res.status).toBe(200);
	});

	it("https://staging.tkstar.dev (www 외 서브도메인)는 그대로 통과한다", async () => {
		// Arrange
		const url = "https://staging.tkstar.dev/path";

		// Act
		const res = await callFetch(url);

		// Assert
		expect(res.status).toBe(200);
	});
});
