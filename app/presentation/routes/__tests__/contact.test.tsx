import { fireEvent, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

vi.mock("~/presentation/components/contact/TurnstileWidget", () => ({
	default: () => <div data-testid="turnstile-widget" />,
}));

import Contact, { action, loader } from "../contact";
import {
	EmailDeliveryError,
	InvalidCaptchaError,
	RateLimitExceededError,
} from "~/application/contact/errors";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeFormDataRequest = (overrides: Record<string, string> = {}): Request => {
	const fd = new FormData();
	const defaults: Record<string, string> = {
		name: "홍길동",
		company: "Acme",
		email: "test@example.com",
		inquiry_type: "B2B",
		message: "안녕하세요. 채용 관련 문의 드립니다.",
		turnstile_token: "valid-token",
	};
	for (const [k, v] of Object.entries({ ...defaults, ...overrides })) {
		fd.set(k, v);
	}
	return new Request("http://localhost/contact", {
		method: "POST",
		body: fd,
		headers: { "CF-Connecting-IP": "1.2.3.4" },
	});
};

const makeMockContext = (
	submitContactForm: ReturnType<typeof vi.fn>,
): {
	context: {
		container: { submitContactForm: typeof submitContactForm };
		cloudflare: { env: Partial<Env>; ctx: Record<string, unknown> };
	};
} => ({
	context: {
		container: { submitContactForm },
		cloudflare: {
			env: {
				CONTACT_TO_EMAIL: "hello@tkstar.dev",
				TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
			} as Partial<Env>,
			ctx: {},
		},
	},
});

// ---------------------------------------------------------------------------
// Group A — loader
// ---------------------------------------------------------------------------

describe("Group A — contact loader", () => {
	it("env 의 TURNSTILE_SITE_KEY / CONTACT_TO_EMAIL 만 client 로 노출", () => {
		const { context } = makeMockContext(vi.fn());
		const result = loader({
			context: context as never,
			params: {},
			request: new Request("http://localhost/contact"),
		} as never);
		expect(result).toEqual({
			siteKey: "1x00000000000000000000AA",
			contactEmail: "hello@tkstar.dev",
		});
	});
});

// ---------------------------------------------------------------------------
// Group B — action 분기
// ---------------------------------------------------------------------------

describe("Group B — contact action", () => {
	it("AC-F008-1 happy path: submitContactForm 1회 호출 + { ok: true }", async () => {
		const submit = vi.fn().mockResolvedValue(undefined);
		const { context } = makeMockContext(submit);
		const result = await action({
			context: context as never,
			params: {},
			request: makeFormDataRequest(),
		} as never);

		expect(submit).toHaveBeenCalledTimes(1);
		const arg = submit.mock.calls[0][0];
		expect(arg.submission.email).toBe("test@example.com");
		expect(arg.submission.inquiry_type).toBe("B2B");
		expect(arg.ip).toBe("1.2.3.4");
		expect(result).toEqual({ ok: true });
	});

	it("AC-F009-3 RATE_LIMITED: RateLimitExceededError → ok=false code=RATE_LIMITED", async () => {
		const submit = vi.fn().mockRejectedValue(new RateLimitExceededError());
		const { context } = makeMockContext(submit);
		const result = await action({
			context: context as never,
			params: {},
			request: makeFormDataRequest(),
		} as never);
		expect(result).toMatchObject({ ok: false, code: "RATE_LIMITED" });
	});

	it("AC-F009-2 INVALID_CAPTCHA: InvalidCaptchaError → ok=false code=INVALID_CAPTCHA", async () => {
		const submit = vi.fn().mockRejectedValue(new InvalidCaptchaError());
		const { context } = makeMockContext(submit);
		const result = await action({
			context: context as never,
			params: {},
			request: makeFormDataRequest(),
		} as never);
		expect(result).toMatchObject({ ok: false, code: "INVALID_CAPTCHA" });
	});

	it("AC-F008-4 EMAIL_DELIVERY_FAILED: EmailDeliveryError → ok=false code=EMAIL_DELIVERY_FAILED + mailtoBody 포함", async () => {
		const submit = vi.fn().mockRejectedValue(new EmailDeliveryError(new Error("Resend 5xx")));
		const { context } = makeMockContext(submit);
		const result = await action({
			context: context as never,
			params: {},
			request: makeFormDataRequest({ message: "원문 메시지 본문입니다." }),
		} as never);
		expect(result).toMatchObject({ ok: false, code: "EMAIL_DELIVERY_FAILED" });
		if (result.ok === false) {
			expect(result.mailtoBody).toContain("원문 메시지 본문입니다.");
		}
	});

	it("AC-F008-2/3 VALIDATION_FAILED: 잘못된 이메일 → ok=false code=VALIDATION_FAILED + submitContactForm 미호출", async () => {
		const submit = vi.fn();
		const { context } = makeMockContext(submit);
		const result = await action({
			context: context as never,
			params: {},
			request: makeFormDataRequest({ email: "not-an-email" }),
		} as never);
		expect(result).toMatchObject({ ok: false, code: "VALIDATION_FAILED" });
		expect(submit).not.toHaveBeenCalled();
	});
});

// ---------------------------------------------------------------------------
// Group C — 컴포넌트
// ---------------------------------------------------------------------------

describe("Group C — Contact component", () => {
	it("AC-F009-1: Turnstile 토큰 미수령 → submit 버튼 disabled", async () => {
		const Stub = createRoutesStub([
			{
				path: "/contact",
				Component: Contact,
				loader: () => ({
					siteKey: "1x00000000000000000000AA",
					contactEmail: "hello@tkstar.dev",
				}),
			},
		]);
		render(<Stub initialEntries={["/contact"]} />);
		const submitButton = await screen.findByRole("button", { name: /보내기/ });
		expect(submitButton).toBeDisabled();
	});

	it("AC-F008-2 client: 잘못된 이메일 → 인라인 에러 (submit 시도 시 onSubmit 검증 트리거)", async () => {
		const Stub = createRoutesStub([
			{
				path: "/contact",
				Component: Contact,
				loader: () => ({
					siteKey: "1x00000000000000000000AA",
					contactEmail: "hello@tkstar.dev",
				}),
				action: () => ({ ok: true }),
			},
		]);
		render(<Stub initialEntries={["/contact"]} />);

		const emailInput = await screen.findByLabelText(/이메일/);
		fireEvent.change(emailInput, { target: { value: "not-an-email" } });

		const form = await screen.findByRole("form", { name: /contact form/ });
		fireEvent.submit(form);

		expect(await screen.findByText(/올바른 이메일/)).toBeInTheDocument();
	});
});
