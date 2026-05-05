export interface EmailSender {
	send(to: string, subject: string, html: string, text: string): Promise<void>;
}
