import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "About — tkstar.dev" }];

export default function About() {
	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-semibold">About</h1>
			<p>placeholder — content lands in T011.</p>
		</main>
	);
}
