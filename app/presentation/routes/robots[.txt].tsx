import type { Route } from "./+types/robots[.txt]";

export const loader = (_args: Route.LoaderArgs) => {
	const body = "User-agent: *\nAllow: /\n";
	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
