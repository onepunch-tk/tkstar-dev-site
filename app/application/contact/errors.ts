export class InvalidCaptchaError extends Error {
	constructor() {
		super("Invalid Turnstile captcha token");
		this.name = "InvalidCaptchaError";
	}
}

export class RateLimitExceededError extends Error {
	constructor() {
		super("Contact form rate limit exceeded");
		this.name = "RateLimitExceededError";
	}
}

export class EmailDeliveryError extends Error {
	constructor(cause: unknown) {
		super(`Email delivery failed: ${cause instanceof Error ? cause.message : String(cause)}`);
		this.name = "EmailDeliveryError";
	}
}
