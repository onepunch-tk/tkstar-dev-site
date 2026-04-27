import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => [
	{ title: "tkstar-dev" },
	{ name: "description", content: "tkstar-dev" },
];

export default function Home() {
	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-semibold">tkstar-dev</h1>
		</main>
	);
}
