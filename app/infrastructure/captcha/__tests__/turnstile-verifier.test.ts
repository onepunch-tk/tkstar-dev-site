import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTurnstileVerifier } from "../turnstile-verifier";

const secret = "1x0000000000000000000000000000000AA";

describe("createTurnstileVerifier", () => {
	const fetchMock = vi.fn();
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		fetchMock.mockReset();
		globalThis.fetch = fetchMock as unknown as typeof fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("siteverify success=true → true 반환 + FormData(secret, response, remoteip) 전송", async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
		const verifier = createTurnstileVerifier(secret);

		const result = await verifier.verify("client-token", "1.2.3.4");

		expect(result).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
		expect(init.method).toBe("POST");
		const body = init.body as FormData;
		expect(body.get("secret")).toBe(secret);
		expect(body.get("response")).toBe("client-token");
		expect(body.get("remoteip")).toBe("1.2.3.4");
	});

	it("siteverify success=false → false 반환", async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 }));
		const verifier = createTurnstileVerifier(secret);

		const result = await verifier.verify("bad-token", "1.2.3.4");

		expect(result).toBe(false);
	});
});
