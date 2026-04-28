import { useContext } from "react";

import { ThemeContext, type ThemeContextValue } from "../providers/ThemeProvider";

export const useTheme = (): ThemeContextValue => {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		// Provider 미마운트(SSR / 일부 테스트) fallback — 첫 paint 동기 부트 스크립트가
		// data-theme를 보장하므로 시각 회귀는 없으며, setTheme은 noop으로 안전 처리
		return { theme: "dark", setTheme: () => {} };
	}
	return ctx;
};
