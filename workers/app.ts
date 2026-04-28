import { createRequestHandler } from "react-router";
import { buildContainer } from "~/infrastructure/config/container";

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		return requestHandler(request, {
			cloudflare: { env, ctx },
			container: buildContainer(env),
		});
	},
} satisfies ExportedHandler<Env>;
