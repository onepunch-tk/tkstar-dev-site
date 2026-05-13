import { createRequestHandler } from "react-router";
import { buildContainer } from "~/infrastructure/config/container";

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const isTkstarDomain = url.host === "tkstar.dev" || url.host === "www.tkstar.dev";
		const isApexHttps = url.host === "tkstar.dev" && url.protocol === "https:";
		if (isTkstarDomain && !isApexHttps) {
			return Response.redirect(`https://tkstar.dev${url.pathname}${url.search}`, 301);
		}
		return requestHandler(request, {
			cloudflare: { env, ctx },
			container: buildContainer(env),
		});
	},
} satisfies ExportedHandler<Env>;
