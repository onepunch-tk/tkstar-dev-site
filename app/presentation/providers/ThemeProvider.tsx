import { createContext, type ReactNode, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "proto-theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

export type ThemeContextValue = {
	theme: Theme;
	setTheme: (value: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const readInitial = (): Theme => {
	if (typeof window === "undefined") return "dark";
	const stored = window.localStorage.getItem(STORAGE_KEY);
	if (stored === "dark" || stored === "light") return stored;
	return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
};

export default function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(readInitial);

	const setTheme = (value: Theme) => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(STORAGE_KEY, value);
		document.documentElement.dataset.theme = value;
		setThemeState(value);
	};

	// system 추종 모드(localStorage 미설정)일 때만 OS 변경 반영
	useEffect(() => {
		if (typeof window === "undefined") return;
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored === "dark" || stored === "light") return;

		const media = window.matchMedia(MEDIA_QUERY);
		const onChange = (event: MediaQueryListEvent) => {
			const next: Theme = event.matches ? "dark" : "light";
			document.documentElement.dataset.theme = next;
			setThemeState(next);
		};
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
