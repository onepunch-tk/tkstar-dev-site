import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Projects — tkstar.dev" }];

export default function ProjectsIndex() {
	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-semibold">Projects</h1>
			<p>placeholder — list lands in T012.</p>
		</main>
	);
}
