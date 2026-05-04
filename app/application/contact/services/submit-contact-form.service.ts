import { render } from "@react-email/render";
import { createElement } from "react";
import type { CaptchaVerifier } from "~/application/contact/ports/captcha-verifier.port";
import type { EmailSender } from "~/application/contact/ports/email-sender.port";
import type { RateLimiter } from "~/application/contact/ports/rate-limiter.port";
import type { ContactSubmission } from "~/domain/contact/contact-submission.vo";
import { EmailDeliveryError, InvalidCaptchaError, RateLimitExceededError } from "../errors";
import AutoReplyEmail from "../templates/AutoReplyEmail";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SEC = 3600;

export interface SubmitContactFormParams {
	submission: ContactSubmission;
	ip: string;
	toEmail: string;
	emailSender: EmailSender;
	captchaVerifier: CaptchaVerifier;
	rateLimiter: RateLimiter;
}

const buildMainEmail = (s: ContactSubmission): { subject: string; html: string; text: string } => {
	const subject = `[tkstar.dev/${s.inquiry_type}] ${s.name} 님의 문의`;
	const lines = [
		`이름: ${s.name}`,
		s.company ? `회사: ${s.company}` : null,
		`이메일: ${s.email}`,
		`유형: ${s.inquiry_type}`,
		"",
		"메시지:",
		s.message,
	].filter((line): line is string => line !== null);
	const text = lines.join("\n");
	const html = `<pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
	return { subject, html, text };
};

const buildAutoReplyEmail = async (
	s: ContactSubmission,
): Promise<{ subject: string; html: string; text: string }> => {
	const subject = "[tkstar.dev] 문의 접수 확인";
	const html = await render(createElement(AutoReplyEmail, { name: s.name }));
	const text = await render(createElement(AutoReplyEmail, { name: s.name }), { plainText: true });
	return { subject, html, text };
};

const escapeHtml = (s: string): string =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

export const submitContactForm = async (params: SubmitContactFormParams): Promise<void> => {
	const { submission, ip, toEmail, emailSender, captchaVerifier, rateLimiter } = params;

	const allowed = await rateLimiter.check(`contact:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SEC);
	if (!allowed) throw new RateLimitExceededError();

	const captchaOk = await captchaVerifier.verify(submission.turnstile_token, ip);
	if (!captchaOk) throw new InvalidCaptchaError();

	const main = buildMainEmail(submission);
	const reply = await buildAutoReplyEmail(submission);

	try {
		await emailSender.send(toEmail, main.subject, main.html, main.text);
		await emailSender.send(submission.email, reply.subject, reply.html, reply.text);
	} catch (cause) {
		throw new EmailDeliveryError(cause);
	}
};
