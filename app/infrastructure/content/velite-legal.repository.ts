import { legal } from "#content";
import type { LegalRepository } from "~/application/content/ports/legal-repository.port";
import type { AppLegalDoc } from "~/domain/legal/app-legal-doc.entity";
import { toAppLegalDoc } from "./mappers/legal.mapper";

const cache: readonly AppLegalDoc[] = Object.freeze(legal.map(toAppLegalDoc));

export const veliteLegalRepository: LegalRepository = {
	async findAppDoc(appSlug, docType) {
		return cache.find((d) => d.app_slug === appSlug && d.doc_type === docType) ?? null;
	},
	async listApps() {
		return [...new Set(cache.map((d) => d.app_slug))];
	},
};
