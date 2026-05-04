import type { CaptchaVerifier } from "~/application/contact/ports/captcha-verifier.port";

export const createTurnstileVerifier = (_secret: string): CaptchaVerifier => ({
	verify: async () => {
		throw new Error("createTurnstileVerifier not yet implemented");
	},
});
