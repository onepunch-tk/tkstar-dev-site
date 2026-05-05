import type { CaptchaVerifier } from "~/application/contact/ports/captcha-verifier.port";

const TURNSTILE_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const createTurnstileVerifier = (secret: string): CaptchaVerifier => ({
	verify: async (token, ip) => {
		const body = new FormData();
		body.set("secret", secret);
		body.set("response", token);
		body.set("remoteip", ip);
		const res = await fetch(TURNSTILE_ENDPOINT, { method: "POST", body });
		if (!res.ok) return false;
		const data = (await res.json()) as { success?: boolean };
		return data.success === true;
	},
});
