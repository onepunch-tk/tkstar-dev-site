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

	const ip =
		request.headers.get("CF-Connecting-IP") ?? request.headers.get("x-forwarded-for") ?? "unknown";

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
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-semibold">Contact</h1>
			<ContactForm siteKey={siteKey} contactEmail={contactEmail} />
		</main>
	);
}
