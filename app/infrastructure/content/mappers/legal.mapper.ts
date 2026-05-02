import type { AppLegalDoc } from "~/domain/legal/app-legal-doc.entity";

type VeliteLegalInput = {
	app_slug: string;
	doc_type: "terms" | "privacy";
	version: string;
	effective_date: string;
	body?: string;
};

export const toAppLegalDoc = (raw: VeliteLegalInput): AppLegalDoc => ({
	app_slug: raw.app_slug,
	doc_type: raw.doc_type,
	version: raw.version,
	effective_date: raw.effective_date,
	body: raw.body,
});
