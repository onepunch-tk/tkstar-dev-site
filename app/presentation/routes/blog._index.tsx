import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Blog — tkstar.dev" }];

export default function BlogIndex() {
	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-semibold">Blog</h1>
			<p>placeholder — list lands in T014a.</p>
		</main>
	);
}
