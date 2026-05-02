import AppCard from "../components/legal/AppCard";

import type { Route } from "./+types/legal._index";

export const meta: Route.MetaFunction = () => [{ title: "Legal — tkstar.dev" }];

export const loader = async ({ context }: Route.LoaderArgs) => {
	const apps = await context.container.listApps();
	return { apps };
};

export default function LegalIndex({ loaderData }: Route.ComponentProps) {
	const { apps } = loaderData;
	return (
		<main className="mx-auto flex max-w-[var(--container-measure)] flex-col gap-4 px-[var(--spacing-gutter)] pt-[22px] pb-20">
			<header className="flex flex-col gap-2">
				<h1 className="flex items-center gap-2 m-0 font-mono text-[11px] tracking-[0.12em] uppercase text-muted">
					<span aria-hidden="true" className="text-accent">
						$
					</span>
					<span>ls legal/apps/</span>
					<span aria-hidden="true" className="h-px flex-1 bg-line" />
				</h1>
				<p className="font-mono text-[13px] text-muted">
					각 앱은 자체 약관과 개인정보 처리방침을 가집니다.
				</p>
			</header>
			{apps.length === 0 ? (
				<p className="font-mono text-[13px] text-faint">등록된 앱이 없습니다.</p>
			) : (
				<ul className="flex flex-col gap-3 list-none p-0">
					{apps.map((slug) => (
						<li key={slug}>
							<AppCard slug={slug} />
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
