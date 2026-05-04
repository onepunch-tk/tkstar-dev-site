import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import {
	EmailDeliveryError,
	InvalidCaptchaError,
	RateLimitExceededError,
} from "~/application/contact/errors";
import ContactForm from "~/presentation/components/contact/ContactForm";
import { contactSubmissionSchema } from "~/domain/contact/contact-submission.schema";

export const meta: MetaFunction = () => [
	{ title: "Contact — tkstar.dev" },
	{
		name: "description",
		content: "tkstar.dev 컨택 — 채용 / 의뢰 / 그 외 문의 모두 환영합니다.",
	},
];

export type ContactActionData =
	| { ok: true }
	| {
			ok: false;
			code: "VALIDATION_FAILED" | "INVALID_CAPTCHA" | "RATE_LIMITED" | "EMAIL_DELIVERY_FAILED";
			message?: string;
			mailtoBody?: string;
	  };

interface LoaderData {
	siteKey: string;
	contactEmail: string;
}

export const loader = ({ context }: LoaderFunctionArgs): LoaderData => {
	const env = context.cloudflare.env as Env;
	return {
		siteKey: env.TURNSTILE_SITE_KEY,
		contactEmail: env.CONTACT_TO_EMAIL,
	};
};

const buildMailtoBody = (raw: Record<string, string>): string =>
	[
		`이름: ${raw.name ?? ""}`,
		raw.company ? `회사: ${raw.company}` : null,
		`이메일: ${raw.email ?? ""}`,
		`유형: ${raw.inquiry_type ?? ""}`,
		"",
		"메시지:",
		raw.message ?? "",
	]
		.filter((line): line is string => line !== null)
		.join("\n");

export const action = async ({
	context,
	request,
}: ActionFunctionArgs): Promise<ContactActionData> => {
	const formData = await request.formData();
	const raw: Record<string, string> = {};
	for (const [k, v] of formData.entries()) {
		if (typeof v === "string") raw[k] = v;
	}

	const parsed = contactSubmissionSchema.safeParse(raw);
	if (!parsed.success) {
		return { ok: false, code: "VALIDATION_FAILED", message: parsed.error.message };
	}

	const ip = request.headers.get("CF-Connecting-IP");
	if (!ip) {
		return { ok: false, code: "VALIDATION_FAILED", message: "CF-Connecting-IP header missing" };
	}

	try {
		await context.container.submitContactForm({ submission: parsed.data, ip });
		return { ok: true };
	} catch (err) {
		if (err instanceof RateLimitExceededError) {
			return { ok: false, code: "RATE_LIMITED" };
		}
		if (err instanceof InvalidCaptchaError) {
			return { ok: false, code: "INVALID_CAPTCHA" };
		}
		if (err instanceof EmailDeliveryError) {
			return {
				ok: false,
				code: "EMAIL_DELIVERY_FAILED",
				mailtoBody: buildMailtoBody(raw),
			};
		}
		throw err;
	}
};

export default function Contact() {
	const { siteKey, contactEmail } = useLoaderData<typeof loader>();
	return (
		<main className="mx-auto flex max-w-[var(--container-measure)] flex-col gap-6 px-[var(--spacing-gutter)] pt-[22px] pb-20 min-[720px]:gap-8 min-[720px]:px-7 min-[720px]:pt-9 min-[720px]:pb-[120px]">
			<header className="flex flex-col gap-2">
				<p
					aria-hidden="true"
					className="m-0 font-mono text-[12px] text-muted before:mr-1 before:text-accent before:content-['$']"
				>
					./contact --new
				</p>
				<h1 className="m-0 font-mono font-bold leading-[1.1] tracking-[-0.02em] text-[clamp(1.5rem,5vw,2rem)]">
					메시지를 보내주세요
				</h1>
				<p className="m-0 font-mono text-[13px] leading-[1.7] text-muted">
					평균 회신 24시간 이내. 또는{" "}
					<a
						href={`mailto:${contactEmail}`}
						className="text-accent underline-offset-4 transition-colors duration-[var(--duration-120)] ease-out hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
					>
						{contactEmail}
					</a>
				</p>
			</header>
			<ContactForm siteKey={siteKey} contactEmail={contactEmail} />
		</main>
	);
}
