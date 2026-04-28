import type { ReactNode } from "react";

export default function ChromeFreeLayout({ children }: { children: ReactNode }) {
	return <div className="legal-container mx-auto max-w-[680px]">{children}</div>;
}
