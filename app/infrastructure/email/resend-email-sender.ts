import type { EmailSender } from "~/application/contact/ports/email-sender.port";

export const createResendEmailSender = (_apiKey: string, _fromEmail: string): EmailSender => ({
	send: async () => {
		throw new Error("createResendEmailSender not yet implemented");
	},
});
