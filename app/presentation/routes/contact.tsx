import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import ContactForm from "~/presentation/components/contact/ContactForm";

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

// Stub — Green 단계에서 실제 submitContactForm 호출 + 에러 매핑으로 교체
export const action = async (_args: ActionFunctionArgs): Promise<ContactActionData> => {
	throw new Error("contact action not yet implemented");
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
