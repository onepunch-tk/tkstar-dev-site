import { getSiteOrigin } from "~/application/seo/launch-gate";
import { buildBreadcrumbListLd } from "~/presentation/lib/jsonld";
import { buildMeta } from "~/presentation/lib/meta";
import { legalTermsModules } from "../components/content/mdx-modules";
import LegalDocLayout from "../components/legal/LegalDocLayout";
import type { Route } from "./+types/legal.$app.terms";

export const loader = async ({ context, params, request }: Route.LoaderArgs) => {
	if (!params.app) throw new Response(null, { status: 404 });
	const doc = await context.container.findAppDoc(params.app, "terms");
	if (!doc) throw new Response(null, { status: 404 });
	const env = context.cloudflare.env as Env;
	const url = new URL(request.url);
	const origin = getSiteOrigin(env);
	return {
		doc,
		origin,
		canonicalUrl: `${origin}${url.pathname}`,
		ogImageUrl: `${origin}/og/fallback.png`,
	};
};

export const meta: Route.MetaFunction = ({ data }) => {
	if (!data) return [{ title: "Terms — tkstar.dev" }];
	const { doc, origin, canonicalUrl, ogImageUrl } = data;
	const docTitle = `${doc.app_slug} 서비스 이용약관`;
	return [
		...buildMeta({
			title: `${docTitle} — tkstar.dev`,
			description: `${doc.app_slug} 앱의 서비스 이용약관 (v${doc.version}, 시행일 ${doc.effective_date}).`,
			canonical: canonicalUrl,
			ogImage: ogImageUrl,
			robots: "noindex, follow",
		}),
		{
			"script:ld+json": buildBreadcrumbListLd({
				items: [
					{ name: "Home", url: `${origin}/` },
					{ name: "Legal", url: `${origin}/legal` },
					{ name: docTitle, url: canonicalUrl },
				],
			}),
		},
	];
};

export default function AppTerms({ loaderData }: Route.ComponentProps) {
	const { doc } = loaderData;
	const Content =
		legalTermsModules[`../../../../content/legal/apps/${doc.app_slug}/terms.mdx`]?.default;
	return (
		<LegalDocLayout
			title={`${doc.app_slug} 서비스 이용약관`}
			version={doc.version}
			effectiveDate={doc.effective_date}
		>
			{Content ? <Content /> : null}
		</LegalDocLayout>
	);
}
