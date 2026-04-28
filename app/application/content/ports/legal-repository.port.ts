import type { AppLegalDoc } from "~/domain/legal/app-legal-doc.entity";

export interface LegalRepository {
	findAppDoc(appSlug: string, docType: "terms" | "privacy"): Promise<AppLegalDoc | null>;
	listApps(): Promise<string[]>;
}
