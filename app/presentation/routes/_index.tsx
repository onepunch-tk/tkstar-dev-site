import type { Route } from "./+types/_index";

export const meta: Route.MetaFunction = () => [
	{ title: "tkstar.dev" },
	{ name: "description", content: "tkstar.dev — coming soon" },
];

export default function Index() {
	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-semibold">tkstar.dev — coming soon</h1>
		</main>
	);
}
