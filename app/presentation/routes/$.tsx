import type { MetaFunction } from "react-router";
import { useLocation } from "react-router";

export const meta: MetaFunction = () => [{ title: "Not Found — tkstar.dev" }];

export default function NotFound() {
	const { pathname } = useLocation();
	return (
		<main className="container mx-auto p-4 font-mono">
			<pre>cd: no such route: {pathname}</pre>
		</main>
	);
}
