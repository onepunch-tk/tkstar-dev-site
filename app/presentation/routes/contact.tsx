import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Contact — tkstar.dev" }];

export default function Contact() {
	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-semibold">Contact</h1>
			<p>placeholder — form lands in a later phase.</p>
		</main>
	);
}
