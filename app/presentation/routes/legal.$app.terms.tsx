import MdxRenderer from "../components/content/MdxRenderer";
import LegalDocLayout from "../components/legal/LegalDocLayout";

import type { Route } from "./+types/legal.$app.terms";

export const meta: Route.MetaFunction = () => [{ title: "Terms — tkstar.dev" }];

export const loader = async ({ context, params }: Route.LoaderArgs) => {
	if (!params.app) throw new Response(null, { status: 404 });
	const doc = await context.container.findAppDoc(params.app, "terms");
	if (!doc) throw new Response(null, { status: 404 });
	return { doc };
};

export default function AppTerms({ loaderData }: Route.ComponentProps) {
	const { doc } = loaderData;
	return (
		<LegalDocLayout
			title={`${doc.app_slug} 서비스 이용약관`}
			version={doc.version}
			effectiveDate={doc.effective_date}
		>
			{doc.body ? <MdxRenderer code={doc.body} /> : null}
		</LegalDocLayout>
	);
}
