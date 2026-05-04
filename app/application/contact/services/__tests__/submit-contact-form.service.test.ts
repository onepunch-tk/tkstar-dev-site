import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CaptchaVerifier } from "~/application/contact/ports/captcha-verifier.port";
import type { EmailSender } from "~/application/contact/ports/email-sender.port";
import type { RateLimiter } from "~/application/contact/ports/rate-limiter.port";
import type { ContactSubmission } from "~/domain/contact/contact-submission.vo";
import { EmailDeliveryError, InvalidCaptchaError, RateLimitExceededError } from "../../errors";
import { submitContactForm } from "../submit-contact-form.service";

const validSubmission: ContactSubmission = {
	name: "홍길동",
	company: "Acme",
	email: "test@example.com",
	inquiry_type: "B2B",
	message: "안녕하세요. 채용 관련 문의 드립니다.",
	turnstile_token: "valid-token",
};

const ip = "1.2.3.4";

describe("submitContactForm", () => {
	let emailSender: EmailSender;
	let captchaVerifier: CaptchaVerifier;
	let rateLimiter: RateLimiter;

	beforeEach(() => {
		emailSender = { send: vi.fn().mockResolvedValue(undefined) };
		captchaVerifier = { verify: vi.fn().mockResolvedValue(true) };
		rateLimiter = { check: vi.fn().mockResolvedValue(true) };
	});

	it("AC-F008-1 — happy path: rate-limit OK + captcha OK → 메인 메일 + 자동응답 메일 2회 발신", async () => {
		await submitContactForm({
			submission: validSubmission,
			ip,
			toEmail: "hello@tkstar.dev",
			emailSender,
			captchaVerifier,
			rateLimiter,
		});

		expect(rateLimiter.check).toHaveBeenCalledTimes(1);
		expect(captchaVerifier.verify).toHaveBeenCalledTimes(1);
		expect(captchaVerifier.verify).toHaveBeenCalledWith("valid-token", ip);
		expect(emailSender.send).toHaveBeenCalledTimes(2);
		const firstCall = (emailSender.send as ReturnType<typeof vi.fn>).mock.calls[0];
		const secondCall = (emailSender.send as ReturnType<typeof vi.fn>).mock.calls[1];
		expect(firstCall[0]).toBe("hello@tkstar.dev");
		expect(secondCall[0]).toBe("test@example.com");
	});

	it("AC-F009-3 — rate limit exceeded: rate-limit false → RateLimitExceededError + captcha/email 미호출", async () => {
		rateLimiter.check = vi.fn().mockResolvedValue(false);

		await expect(
			submitContactForm({
				submission: validSubmission,
				ip,
				toEmail: "hello@tkstar.dev",
				emailSender,
				captchaVerifier,
				rateLimiter,
			}),
		).rejects.toBeInstanceOf(RateLimitExceededError);

		expect(captchaVerifier.verify).not.toHaveBeenCalled();
		expect(emailSender.send).not.toHaveBeenCalled();
	});

	it("AC-F009-2 — invalid captcha: captcha false → InvalidCaptchaError + email 미호출", async () => {
		captchaVerifier.verify = vi.fn().mockResolvedValue(false);

		await expect(
			submitContactForm({
				submission: validSubmission,
				ip,
				toEmail: "hello@tkstar.dev",
				emailSender,
				captchaVerifier,
				rateLimiter,
			}),
		).rejects.toBeInstanceOf(InvalidCaptchaError);

		expect(emailSender.send).not.toHaveBeenCalled();
	});

	it("AC-F008-4 — email delivery failure: emailSender throw → EmailDeliveryError 전파", async () => {
		emailSender.send = vi.fn().mockRejectedValue(new Error("Resend 5xx"));

		await expect(
			submitContactForm({
				submission: validSubmission,
				ip,
				toEmail: "hello@tkstar.dev",
				emailSender,
				captchaVerifier,
				rateLimiter,
			}),
		).rejects.toBeInstanceOf(EmailDeliveryError);
	});
});
