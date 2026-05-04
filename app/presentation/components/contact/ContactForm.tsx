import { useState } from "react";
import { useFetcher } from "react-router";
import type { ContactActionData } from "~/presentation/routes/contact";
import MailtoFallback from "./MailtoFallback";
import SuccessScreen from "./SuccessScreen";
import TurnstileWidget from "./TurnstileWidget";

interface ContactFormProps {
	siteKey: string;
	contactEmail: string;
}

interface ClientErrors {
	email?: string;
	message?: string;
}

const validateEmail = (email: string): string | undefined => {
	if (!email) return "이메일을 입력해주세요.";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "올바른 이메일 형식이 아닙니다.";
	return undefined;
};

const validateMessage = (message: string): string | undefined => {
	if (message.length < 10) return "10자 이상 입력해주세요.";
	if (message.length > 5000) return "5000자 이하로 입력해주세요.";
	return undefined;
};

export default function ContactForm({ siteKey, contactEmail }: ContactFormProps) {
	const fetcher = useFetcher<ContactActionData>();
	const [turnstileToken, setTurnstileToken] = useState<string>("");
	const [clientErrors, setClientErrors] = useState<ClientErrors>({});

	const isSubmitting = fetcher.state !== "idle";
	const data = fetcher.data;

	if (data?.ok) {
		return <SuccessScreen />;
	}

	if (data && !data.ok && data.code === "EMAIL_DELIVERY_FAILED") {
		return <MailtoFallback contactEmail={contactEmail} prefillBody={data.mailtoBody ?? ""} />;
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		const form = event.currentTarget;
		const formData = new FormData(form);
		const email = String(formData.get("email") ?? "");
		const message = String(formData.get("message") ?? "");
		const errors: ClientErrors = {
			email: validateEmail(email),
			message: validateMessage(message),
		};
		if (errors.email || errors.message) {
			event.preventDefault();
			setClientErrors(errors);
		}
	};

	const submitDisabled = !turnstileToken || isSubmitting;

	return (
		<fetcher.Form method="post" onSubmit={handleSubmit} noValidate aria-label="contact form">
			<label>
				이름
				<input name="name" required />
			</label>

			<label>
				회사 (선택)
				<input name="company" />
			</label>

			<label>
				이메일
				<input name="email" type="email" required />
				{clientErrors.email && <span role="alert">{clientErrors.email}</span>}
			</label>

			<fieldset>
				<legend>의뢰 유형</legend>
				<label>
					<input type="radio" name="inquiry_type" value="B2B" defaultChecked /> B2B
				</label>
				<label>
					<input type="radio" name="inquiry_type" value="B2C" /> B2C
				</label>
				<label>
					<input type="radio" name="inquiry_type" value="etc" /> etc
				</label>
			</fieldset>

			<label>
				메시지
				<textarea name="message" minLength={10} maxLength={5000} required />
				{clientErrors.message && <span role="alert">{clientErrors.message}</span>}
			</label>

			<TurnstileWidget siteKey={siteKey} onToken={setTurnstileToken} />
			<input type="hidden" name="turnstile_token" value={turnstileToken} />

			{data && !data.ok && data.code === "RATE_LIMITED" && (
				<p role="alert">잠시 후 다시 시도해주세요. (1시간에 5회까지 가능)</p>
			)}
			{data && !data.ok && data.code === "INVALID_CAPTCHA" && (
				<p role="alert">캡차 검증 실패 — 다시 시도해주세요.</p>
			)}

			<button type="submit" disabled={submitDisabled}>
				{isSubmitting ? "전송 중…" : "보내기"}
			</button>
		</fetcher.Form>
	);
}
