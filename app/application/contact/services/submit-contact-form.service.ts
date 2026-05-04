import type { CaptchaVerifier } from "~/application/contact/ports/captcha-verifier.port";
import type { EmailSender } from "~/application/contact/ports/email-sender.port";
import type { RateLimiter } from "~/application/contact/ports/rate-limiter.port";
import type { ContactSubmission } from "~/domain/contact/contact-submission.vo";

export interface SubmitContactFormParams {
	submission: ContactSubmission;
	ip: string;
	toEmail: string;
	emailSender: EmailSender;
	captchaVerifier: CaptchaVerifier;
	rateLimiter: RateLimiter;
}

export const submitContactForm = async (_params: SubmitContactFormParams): Promise<void> => {
	throw new Error("submitContactForm not yet implemented");
};
