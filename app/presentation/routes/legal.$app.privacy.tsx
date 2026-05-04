import { buildBreadcrumbListLd } from "~/presentation/lib/jsonld";
import { buildMeta } from "~/presentation/lib/meta";
import MdxRenderer from "../components/content/MdxRenderer";
import LegalDocLayout from "../components/legal/LegalDocLayout";
import type { Route } from "./+types/legal.$app.privacy";

export const loader = async ({ context, params, request }: Route.LoaderArgs) => {
	if (!params.app) throw new Response(null, { status: 404 });
	const doc = await context.container.findAppDoc(params.app, "privacy");
	if (!doc) throw new Response(null, { status: 404 });
	const url = new URL(request.url);
	const origin = url.origin;
	return {
		doc,
		origin,
		canonicalUrl: `${origin}${url.pathname}`,
		ogImageUrl: `${origin}/og/fallback.png`,
	};
};

export const meta: Route.MetaFunction = ({ data }) => {
	if (!data) return [{ title: "Privacy — tkstar.dev" }];
	const { doc, origin, canonicalUrl, ogImageUrl } = data;
	const docTitle = `${doc.app_slug} 개인정보 처리방침`;
	return [
		...buildMeta({
			title: `${docTitle} — tkstar.dev`,
			description: `${doc.app_slug} 앱의 개인정보 처리방침 (v${doc.version}, 시행일 ${doc.effective_date}).`,
			canonical: canonicalUrl,
			ogImage: ogImageUrl,
			robots: "noindex, follow",
		}),
		{
			"script:ld+json": 				buildBreadcrumbListLd({
					items: [
						{ name: "Home", url: `${origin}/` },
						{ name: "Legal", url: `${origin}/legal` },
						{ name: docTitle, url: canonicalUrl },
					],
				}),
		},
	];
};

export default function AppPrivacy({ loaderData }: Route.ComponentProps) {
	const { doc } = loaderData;
	return (
		<LegalDocLayout
			title={`${doc.app_slug} 개인정보 처리방침`}
			version={doc.version}
			effectiveDate={doc.effective_date}
		>
			{doc.body ? <MdxRenderer code={doc.body} /> : null}
		</LegalDocLayout>
	);
}
