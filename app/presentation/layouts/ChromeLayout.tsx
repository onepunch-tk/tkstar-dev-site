import type { ReactNode } from "react";
import Footer from "../components/chrome/Footer";
import Topbar from "../components/chrome/Topbar";

export default function ChromeLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<Topbar />
			{children}
			<Footer />
		</>
	);
}
