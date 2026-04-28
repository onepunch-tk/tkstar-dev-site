import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Terms — tkstar.dev" }];

export default function AppTerms() {
	return (
		<article>
			<h1 className="text-2xl font-semibold">App Terms</h1>
			<p>placeholder — content lands in T015.</p>
		</article>
	);
}
