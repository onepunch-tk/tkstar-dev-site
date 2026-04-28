import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Legal — tkstar.dev" }];

export default function LegalIndex() {
	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-semibold">Legal</h1>
			<p>placeholder — index lands in T015.</p>
		</main>
	);
}
