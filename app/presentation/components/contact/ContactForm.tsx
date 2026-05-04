import { useId, useState } from "react";
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

const INPUT_BASE =
	"rounded-md border border-line bg-bg-elev px-3 py-2.5 font-mono text-[13px] text-fg placeholder:text-faint outline-none transition-colors duration-[var(--duration-120)] ease-out focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[invalid=true]:border-warn motion-reduce:transition-none";

const LABEL_BASE = "font-mono text-[12px] text-muted";

const PILL_BASE =
	"inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-3 py-1 font-mono text-[12px] text-muted transition-colors duration-[var(--duration-120)] ease-out hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-bg-elev has-[:checked]:text-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent motion-reduce:transition-none";

const ALERT_BASE =
	"m-0 rounded-md border border-warn bg-bg-elev px-3 py-2 font-mono text-[12px] text-warn";

export default function ContactForm({ siteKey, contactEmail }: ContactFormProps) {
	const fetcher = useFetcher<ContactActionData>();
	const [turnstileToken, setTurnstileToken] = useState<string>("");
	const [clientErrors, setClientErrors] = useState<ClientErrors>({});
	const formId = useId();
	const fid = (k: string) => `${formId}-${k}`;

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
		<fetcher.Form
			method="post"
			onSubmit={handleSubmit}
			noValidate
			aria-label="contact form"
			className="flex flex-col gap-5"
		>
			<div className="flex flex-col gap-1.5">
				<label htmlFor={fid("name")} className={LABEL_BASE}>
					이름{" "}
					<span aria-hidden="true" className="text-accent">
						*
					</span>
				</label>
				<input
					id={fid("name")}
					name="name"
					required
					autoComplete="name"
					placeholder="홍길동"
					className={INPUT_BASE}
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor={fid("company")} className={LABEL_BASE}>
					회사 <span className="text-faint">(선택)</span>
				</label>
				<input
					id={fid("company")}
					name="company"
					autoComplete="organization"
					placeholder="회사명"
					className={INPUT_BASE}
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor={fid("email")} className={LABEL_BASE}>
					이메일{" "}
					<span aria-hidden="true" className="text-accent">
						*
					</span>
				</label>
				<input
					id={fid("email")}
					name="email"
					type="email"
					required
					autoComplete="email"
					placeholder="you@company.com"
					aria-invalid={Boolean(clientErrors.email)}
					aria-describedby={clientErrors.email ? fid("email-err") : undefined}
					className={INPUT_BASE}
				/>
				{clientErrors.email && (
					<span id={fid("email-err")} role="alert" className="font-mono text-[11px] text-warn">
						{clientErrors.email}
					</span>
				)}
			</div>

			<fieldset className="flex flex-col gap-2 border-0 p-0">
				<legend className={`mb-1 px-0 ${LABEL_BASE}`}>
					의뢰 유형{" "}
					<span aria-hidden="true" className="text-accent">
						*
					</span>
				</legend>
				<div className="flex flex-wrap gap-2">
					{(
						[
							["B2B", "B2B 채용·제안"],
							["B2C", "B2C 의뢰"],
							["etc", "기타"],
						] as const
					).map(([value, label], i) => (
						<label key={value} className={PILL_BASE}>
							<input
								type="radio"
								name="inquiry_type"
								value={value}
								defaultChecked={i === 0}
								className="sr-only"
							/>
							{label}
						</label>
					))}
				</div>
			</fieldset>

			<div className="flex flex-col gap-1.5">
				<label htmlFor={fid("message")} className={LABEL_BASE}>
					메시지{" "}
					<span aria-hidden="true" className="text-accent">
						*
					</span>
				</label>
				<textarea
					id={fid("message")}
					name="message"
					minLength={10}
					maxLength={5000}
					required
					rows={6}
					placeholder="프로젝트 개요, 일정, 예산 범위 등"
					aria-invalid={Boolean(clientErrors.message)}
					aria-describedby={clientErrors.message ? fid("message-err") : undefined}
					className={`${INPUT_BASE} resize-y leading-[1.6]`}
				/>
				{clientErrors.message && (
					<span id={fid("message-err")} role="alert" className="font-mono text-[11px] text-warn">
						{clientErrors.message}
					</span>
				)}
			</div>

			<TurnstileWidget siteKey={siteKey} onToken={setTurnstileToken} />
			<input type="hidden" name="turnstile_token" value={turnstileToken} />

			{data && !data.ok && data.code === "RATE_LIMITED" && (
				<p role="alert" className={ALERT_BASE}>
					잠시 후 다시 시도해주세요. (1시간에 5회까지 가능)
				</p>
			)}
			{data && !data.ok && data.code === "INVALID_CAPTCHA" && (
				<p role="alert" className={ALERT_BASE}>
					캡차 검증 실패 — 다시 시도해주세요.
				</p>
			)}
			{data && !data.ok && data.code === "VALIDATION_FAILED" && (
				<p role="alert" className={ALERT_BASE}>
					입력값에 문제가 있습니다. 항목을 다시 확인해주세요.
				</p>
			)}

			<div className="flex flex-wrap items-center gap-3">
				<button
					type="submit"
					disabled={submitDisabled}
					className="inline-flex items-center gap-2 rounded-md border border-accent bg-accent px-4 py-2.5 font-mono text-[13px] font-medium text-on-accent transition-[color,background-color,border-color,filter,opacity] duration-[var(--duration-120)] ease-out hover:brightness-[1.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
				>
					<span aria-hidden="true">↵</span>
					{isSubmitting ? "전송 중…" : "보내기"}
				</button>
				<span className="font-mono text-[11px] text-faint">Resend → {contactEmail}</span>
			</div>
		</fetcher.Form>
	);
}
