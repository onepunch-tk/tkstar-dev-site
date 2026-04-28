import { useEffect, useState } from "react";

// SSR 시 mac으로 가정(라벨 길이 ⌘K=2자 vs Ctrl+K=6자 — 첫 paint hydration 폭 변동 최소화).
// mount 후 navigator.platform으로 보정한다.
export const useKbdHint = (): string => {
	const [isMac, setIsMac] = useState(true);
	useEffect(() => {
		if (typeof navigator === "undefined") return;
		setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
	}, []);
	return isMac ? "⌘K" : "Ctrl+K";
};
