import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLocation,
	useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { getSiteOrigin, isLaunched } from "./application/seo/launch-gate";
import { getAnalyticsScriptProps } from "./infrastructure/analytics/cloudflare-web-analytics";
import ChromeFreeLayout from "./presentation/layouts/ChromeFreeLayout";
import ChromeLayout from "./presentation/layouts/ChromeLayout";
import ThemeProvider from "./presentation/providers/ThemeProvider";
import "./app.css";

const CHROME_FREE_PATHNAME = /^\/legal\/[^/]+\/(terms|privacy)$/;

export const links: Route.LinksFunction = () => [
	{ rel: "alternate", type: "application/rss+xml", href: "/rss.xml", title: "tkstar.dev — Posts" },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
	const env = context.cloudflare.env as Env;
	return {
		appCount: (await context.container.listApps()).length,
		googleVerification: env.GOOGLE_SITE_VERIFICATION ?? "",
		naverVerification: env.NAVER_SITE_VERIFICATION ?? "",
		analyticsToken: env.CLOUDFLARE_ANALYTICS_TOKEN ?? "",
		siteLaunched: isLaunched(env),
		siteOrigin: getSiteOrigin(env),
	};
};

// localStorage 값 화이트리스트 — 잘못된 값(브라우저 확장 / 콘솔 조작)이 들어와도 dark/light로만 좁힌다.
const themeScript = `(()=>{try{var s=localStorage.getItem('proto-theme');var t=(s==='dark'||s==='light')?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData("root") as Awaited<ReturnType<typeof loader>> | undefined;
	const googleVerification = data?.googleVerification ?? "";
	const naverVerification = data?.naverVerification ?? "";
	const analyticsScript = getAnalyticsScriptProps(data?.analyticsToken);
	// 방어적 default: data 가 undefined (ErrorBoundary) 이거나 siteLaunched=false 면 noindex.
	// launch 상태 불명일 때 색인 노출 방지가 안전.
	const shouldNoIndex = !data?.siteLaunched;

	return (
		<html lang="ko">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{shouldNoIndex && <meta name="robots" content="noindex,nofollow" />}
				{googleVerification && (
					<meta name="google-site-verification" content={googleVerification} />
				)}
				{naverVerification && <meta name="naver-site-verification" content={naverVerification} />}
				<link
					rel="preload"
					href="/fonts/Pretendard-Regular.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: theme FOUC 방지를 위한 동기 inline 부트 스크립트 (정적 문자열, 사용자 입력 미주입)
					dangerouslySetInnerHTML={{ __html: themeScript }}
				/>
				<Meta />
				<Links />
			</head>
			<body>
				<a
					href="#main"
					className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:border focus:border-accent focus:bg-bg focus:px-3 focus:py-2 focus:text-accent"
				>
					본문으로 건너뛰기
				</a>
				{children}
				<ScrollRestoration />
				<Scripts />
				{analyticsScript && <script {...analyticsScript} />}
			</body>
		</html>
	);
}

export default function App() {
	const { pathname } = useLocation();
	const inner = CHROME_FREE_PATHNAME.test(pathname) ? (
		<ChromeFreeLayout>
			<Outlet />
		</ChromeFreeLayout>
	) : (
		<ChromeLayout>
			<Outlet />
		</ChromeLayout>
	);
	return <ThemeProvider>{inner}</ThemeProvider>;
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
