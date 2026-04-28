import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import ChromeFreeLayout from "./presentation/layouts/ChromeFreeLayout";
import ChromeLayout from "./presentation/layouts/ChromeLayout";
import "./app.css";

const CHROME_FREE_PATHNAME = /^\/legal\/[^/]+\/(terms|privacy)$/;

const themeScript = `(()=>{try{var s=localStorage.getItem('proto-theme');var t=s||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: FOIT 방지를 위한 동기 inline 부트 스크립트
					dangerouslySetInnerHTML={{ __html: themeScript }}
				/>
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const { pathname } = useLocation();
	if (CHROME_FREE_PATHNAME.test(pathname)) {
		return (
			<ChromeFreeLayout>
				<Outlet />
			</ChromeFreeLayout>
		);
	}
	return (
		<ChromeLayout>
			<Outlet />
		</ChromeLayout>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container mx-auto p-4 pt-16">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
