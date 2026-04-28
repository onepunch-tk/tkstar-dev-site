import type { ReactNode } from "react";

export default function ChromeLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<header data-testid="topbar-slot" />
			{children}
			<footer data-testid="footer-slot" />
		</>
	);
}
