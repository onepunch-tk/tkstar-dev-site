import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createResendEmailSender } from "../resend-email-sender";

const apiKey = "re_test_key";
const fromEmail = "hello@tkstar.dev";

describe("createResendEmailSender", () => {
	const fetchMock = vi.fn();
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		fetchMock.mockReset();
		globalThis.fetch = fetchMock as unknown as typeof fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("Resend POST /emails 200 응답 시 정상 resolve", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
		const sender = createResendEmailSender(apiKey, fromEmail);

		await expect(
			sender.send("to@example.com", "subject", "<p>hi</p>", "hi"),
		).resolves.toBeUndefined();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("https://api.resend.com/emails");
		expect(init.method).toBe("POST");
		const headers = init.headers as Record<string, string>;
		expect(headers.Authorization).toBe(`Bearer ${apiKey}`);
		expect(headers["Content-Type"]).toBe("application/json");
		const body = JSON.parse(init.body as string);
		expect(body).toMatchObject({
			from: fromEmail,
			to: ["to@example.com"],
			subject: "subject",
			html: "<p>hi</p>",
			text: "hi",
		});
	});

	it("4xx/5xx 응답 시 throw", async () => {
		fetchMock.mockResolvedValue(new Response("err", { status: 502 }));
		const sender = createResendEmailSender(apiKey, fromEmail);

		await expect(sender.send("to@example.com", "subject", "<p>hi</p>", "hi")).rejects.toThrow();
	});
});
