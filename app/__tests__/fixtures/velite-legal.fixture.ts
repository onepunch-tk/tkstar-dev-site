// velite raw output shape for AppLegalDoc fixtures.
// app_slug 중복 검증용으로 moai에 terms+privacy 모두 포함, 그리고 별도 app(jagi) 추가.

export const moaiTerms = {
	app_slug: "moai",
	doc_type: "terms" as const,
	version: "1.0.0",
	effective_date: "2026-01-01",
	body: "",
};

export const moaiPrivacy = {
	app_slug: "moai",
	doc_type: "privacy" as const,
	version: "1.0.0",
	effective_date: "2026-01-01",
	body: "",
};

export const jagiTerms = {
	app_slug: "jagi",
	doc_type: "terms" as const,
	version: "1.2.0",
	effective_date: "2026-02-15",
	body: "",
};

export const fixtureLegal = [moaiTerms, moaiPrivacy, jagiTerms];
