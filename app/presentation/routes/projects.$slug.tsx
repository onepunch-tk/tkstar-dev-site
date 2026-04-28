import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Project — tkstar.dev" }];

export default function ProjectDetail() {
	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-semibold">Project Detail</h1>
			<p>placeholder — content lands in T013.</p>
		</main>
	);
}
