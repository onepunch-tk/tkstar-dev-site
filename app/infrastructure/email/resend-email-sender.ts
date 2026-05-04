import type { EmailSender } from "~/application/contact/ports/email-sender.port";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const createResendEmailSender = (apiKey: string, fromEmail: string): EmailSender => ({
	send: async (to, subject, html, text) => {
		const res = await fetch(RESEND_ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: fromEmail,
				to: [to],
				subject,
				html,
				text,
			}),
		});
		if (!res.ok) {
			const detail = await res.text().catch(() => "");
			throw new Error(`Resend send failed: ${res.status} ${detail}`);
		}
	},
});
