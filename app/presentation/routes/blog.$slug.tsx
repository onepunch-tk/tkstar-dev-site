import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Post — tkstar.dev" }];

export default function BlogDetail() {
	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-semibold">Blog Post</h1>
			<p>placeholder — content lands in T014b.</p>
		</main>
	);
}
